import { UrlWithStringQuery } from "url";
import { Link } from "./link";

export class Page {
    private links = new Array<Link>();

    public constructor(public url: UrlWithStringQuery, public title: string) {

    }

    public addLink(link: Link) {
        this.links.push(link);
    }

    public getLinks() {
        return this.links;
    }

    public getLiveLinks() {
        return this.links.filter((link) => {
            return link.internal && !link.anchor && !link.malformed && !link.dead;
        });
    }
}
