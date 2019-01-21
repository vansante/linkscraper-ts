main();

async function main() {
    // tslint:disable: no-console
    console.log("hi");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("bye");
}
