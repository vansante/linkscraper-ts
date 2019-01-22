import * as htmlparser from "htmlparser2";
import * as fetch from "isomorphic-fetch";
import * as url from "url";
import { Link } from "./link";
import { Page } from "./page";
import { PageParser } from "./pageparser";

export const MalformedURL = url.parse("http://www.not-found.com/404");
export const PageNotFound = new Page(MalformedURL, "Not Found");
export const PageExternal = new Page(url.parse("http://external-page.com/299"), "External");

export class Scraper {
    private startURL: url.UrlWithStringQuery;
    private pages = new Map<string, Page>();
    private pageQueue = new Array<Page>();

    constructor(startURL: string) {
        this.startURL = url.parse(startURL);
    }

    public async run() {
        const startPage = await this.fetch(this.startURL);
        this.pageQueue.push(startPage);

        while (this.pageQueue.length > 0) {
            const current = this.pageQueue.pop();
            if (!current) {
                break;
            }
            await this.processLinks(current.getLiveLinks());
        }
    }

    public walkPages(walker: (page: Page, url: string) => void) {
        this.pages.forEach(walker);
    }

    private async processLinks(links: Link[]) {
        const proms = new Array<Promise<Page>>();
        for (const link of links) {
            proms.push(this.fetchLink(link));
        }

        return Promise.all(proms);
    }

    private async fetchLink(link: Link) {
        const page = await this.fetch(link.targetURL);
        link.setTargetPage(page);
        if (page === PageNotFound) {
            link.markDead();
        }
        return page;
    }

    private async fetch(URL: url.UrlWithStringQuery) {
        if (URL.hostname === null) {
            URL.hostname = this.startURL.hostname;
        }
        if (URL.protocol === null) {
            URL.protocol = this.startURL.protocol;
        }
        if (URL.port === null) {
            URL.protocol = this.startURL.protocol;
        }

        const parsedURL = url.format(URL);
        let page = this.pages.get(parsedURL);
        if (page) {
            return page;
        }

        try {
            const response = await fetch(parsedURL);

            page = new Page(URL, "");
            const linkParser = new PageParser(page);
            const parser = new htmlparser.Parser(linkParser, {
                decodeEntities: true,
                lowerCaseAttributeNames: true,
                lowerCaseTags: true,
            });

            const text = await response.text();
            parser.parseChunk(text);
        } catch (ex) {
            return PageNotFound;
        }

        this.pages.set(parsedURL, page);
        this.pageQueue.push(page);

        return page;
    }
}
