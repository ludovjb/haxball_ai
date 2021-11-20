const puppeteer = require('puppeteer');
const url = process.argv[2];
if (!url) {
    throw "Please provide URL as a first argument";
}

const playerName = process.argv[3];
if (!playerName) {
    throw "Please provide a player name as a second argument";
}
async function run () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1900, height: 1024 })
    await page.goto(url);
    await page.waitForSelector("iframe");
    await page.screenshot({path: 'capture_'+playerName+'.png'});

    var frames = await page.frames();
    var myframe = frames.find(f => f.url().indexOf("__cache_static__/g/game.html") > -1);

    const input = await myframe.$("input[type=text]");
    await input.type(playerName);
    const button = await myframe.$("button");
    await button.click();
    //await page.waitForTimeout(2000);
    await myframe.waitForSelector(".icon-menu");
    await page.keyboard.press('Tab');
    await page.keyboard.press('/');
    await page.keyboard.press('a');
    await page.keyboard.press('v');
    await page.keyboard.press('a');
    await page.keyboard.press('t');
    await page.keyboard.press('a');
    await page.keyboard.press('r');
    await page.keyboard.press(' ');
    await page.keyboard.press('a');
    await page.keyboard.press('i');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    //await page.screenshot({path: 'screenshot_'+playerName+'.png'});

    while(await myframe.$(".icon-menu")) {
      await page.waitForTimeout(10000);
    }
    console.log("End of connection for "+playerName);
    browser.close();
}
run();
