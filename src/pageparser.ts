import { Link } from "./link";
import { Page } from "./page";

export class PageParser {
    private currentLink: Link | null = null;
    private currentTitle = false;

    public constructor(public onPage: Page) {

    }

    public onopentag(name: string, attributes: { [type: string]: string }) {
        switch (name) {
            case "a":
                this.currentTitle = false;
                this.currentLink = new Link(this.onPage, "", attributes.href);
                this.onPage.addLink(this.currentLink);
                break;
            case "title":
                this.currentTitle = true;
                this.currentLink = null;
                break;
            default:
                this.currentTitle = false;
                this.currentLink = null;
                break;
        }
    }

    public ontext(text: string) {
        if (this.currentLink) {
            this.currentLink.title = this.processText(this.currentLink.title, text);
            return;
        }
        if (this.currentTitle) {
            this.onPage.title = this.processText(this.onPage.title, text);
            return;
        }
    }

    private processText(original: string, newStr: string) {
        return (original + newStr).replace(/\\n/g, "").trim();
    }
}
