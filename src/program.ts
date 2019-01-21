import { Page } from "./page";
import { Scraper } from "./scraper";

main();

async function main() {
    // tslint:disable: no-console

    const scraper = new Scraper("https://gameye.com/home");
    await scraper.run();

    scraper.walkPages((page: Page, url: string) => {
        console.log("Page: " + page.title + " on URL: " + url);

        page.getLinks().forEach((link) => {
            let str = "- " + link.title + " => " + link.target;
            str += " (" + link.targetPage.title + ")";

            console.log(str);
        });
    });

    let pages = 0;
    let links = 0;
    let deadLinks = 0;
    let internalLinks = 0;
    let externalLinks = 0;
    let mailLinks = 0;

    scraper.walkPages((page: Page, url: string) => {
        pages++;

        page.getLinks().forEach((link) => {
            links++;

            if (link.mailto) {
                mailLinks++;
                return;
            }
            if (link.internal) {
                internalLinks++;
            } else {
                externalLinks++;
            }
            if (link.dead || link.malformed) {
                deadLinks++;
            }
        });
    });

    console.log("\n\nResults:");
    console.log(pages + " pages, " + links + " links.");
    console.log("From the links, " + internalLinks + " are internal, " + externalLinks + " are external, "
        + mailLinks + " are email links" + " and " + deadLinks + " are dead links.");
}
