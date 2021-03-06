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
    public readonly pages = new Map<string, Page>();

    private readonly startURL: url.UrlWithStringQuery;
    private readonly pageQueue = new Array<Page>();

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

    private processLinks(links: Link[]) {
        // This is cleaner
        return Promise.all(
            links.map(link => this.fetchLink(link)),
        );
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
            URL.port = this.startURL.port;
        }

        const parsedURL = url.format(URL);

        {
            const page = this.pages.get(parsedURL);
            if (page) {
                return page;
            }
        }

        const response = await fetch(parsedURL);
        switch (response.status) {
            case 404:
                return PageNotFound;

            case 200: {
                const page = new Page(URL, "");
                const linkParser = new PageParser(page);
                const parser = new htmlparser.Parser(linkParser, {
                    decodeEntities: true,
                    lowerCaseAttributeNames: true,
                    lowerCaseTags: true,
                });

                const text = await response.text();
                parser.parseChunk(text);

                this.pages.set(parsedURL, page);
                this.pageQueue.push(page);

                return page;
            }

            default:
                throw new Error(`unexpected status ${response.status}`);
        }
    }
}
