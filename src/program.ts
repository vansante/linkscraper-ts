import { Page } from "./page";
import { Scraper } from "./scraper";

main();

async function main() {
    // tslint:disable: no-console

    const scraper = new Scraper("https://gameye.com/home");
    await scraper.run();

    for (const [url, page] of scraper.pages) {
        // console.log("Page: " + page.title + " on URL: " + url);

        // use template strings
        console.log(`Page: ${page.title} on URL: ${url}`);

        for (const link of page.getLinks()) {
            // let str = "- " + link.title + " => " + link.target;
            // str += " (" + link.targetPage.title + ")";

            // use template strings
            console.log(
                `- ${link.title}" => ${link.target} ` +
                `(${link.targetPage.title}")`,
            );
        }
    }

    const pages = scraper.pages.size;
    let links = 0;
    let deadLinks = 0;
    let internalLinks = 0;
    let externalLinks = 0;
    let mailLinks = 0;

    for (const [, page] of scraper.pages)
        for (const link of page.getLinks()) {
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

        }

    console.log("");
    console.log("");
    console.log("Results:");
    console.log(`${pages} pages, ${links} links.`);
    console.log(
        `From the links, ${internalLinks} are internal, ` +
        `${externalLinks} are external, ${mailLinks} are email links and ` +
        `${deadLinks} are dead links.`,
    );
}
