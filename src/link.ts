import * as url from "url";
import { Page } from "./page";
import { MalformedURL, PageExternal, PageNotFound } from "./scraper";

export class Link {
    public targetURL = MalformedURL;
    public targetPage = PageNotFound;

    public internal: boolean = false;
    public anchor: boolean = false;
    public malformed: boolean = false;
    public dead: boolean = false;
    public mailto: boolean = false;

    public constructor(public onPage: Page, public title: string, public target: string) {
        if (target.substr(0, 7) === "mailto:") {
            this.mailto = true;
            return;
        }
        try {
            this.targetURL = url.parse(target);
            this.internal = this.targetURL.host === onPage.url.host || this.targetURL.host === null;
            if (this.targetURL.hash) {
                this.anchor = this.targetURL.hash.substr(0, 1) === "#";
                this.targetPage = this.onPage;
            }
            if (!this.internal) {
                this.targetPage = PageExternal;
            }
        } catch (ex) {
            this.malformed = true;
            this.dead = true;
        }
    }

    public markDead() {
        this.dead = true;
    }

    public getTargetPage() {
        return this.targetPage;
    }

    public setTargetPage(page: Page) {
        this.targetPage = page;
    }
}
