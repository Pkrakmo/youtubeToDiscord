import puppeteer from 'puppeteer';
import os from 'os';
import fs from 'fs';
require('dotenv').config();

async function scrapePage(url: string) {

    const browser = await osChecker()
    const page = await browser.newPage()

    await page.goto(url);

    const [button] = await page.$x('//*[@id="yDmH0d"]/c-wiz/div/div/div/div[2]/div[1]/div[4]/form/div[1]/div/button');

    if (button) {
        await button.click();
        console.log('accept button clicked')
    }

    await page.waitForXPath('//*[@id="logo"]', {
        visible: true
    })

    await browser.close();
}


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @returns will change what properties puppeteer.launch() will use,
 * this was to fix issues running puppeteer on Linux
 */
async function osChecker() {

    if (os.type() == "Windows_NT") {
        return puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    } else {
        return puppeteer.launch({
            headless: true,
            executablePath: '/usr/bin/chromium-browser',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
}


function mainRunner() {

    let ChannalName = process.argv[2]
    let ChannalNameLowerCase = ChannalName.toLowerCase()

    fs.readFile(`./log/TEST${ChannalNameLowerCase}-data.json`, 'utf8', function read(err, data) {
        if (err) {
            return console.log(err);
        }

        let jsonData = JSON.parse(data)
        scrapePage(jsonData.channelUrl)
    })
}

mainRunner()

//scrapePage("https://www.youtube.com/user/DuplexRecords/videos")
//scrapePage("https://consent.youtube.com/m?continue=https%3A%2F%2Fwww.youtube.com%2Fuser%2F$DuplexRecords%2Fvideos&gl=NO&m=0&pc=yt&uxe=23983172&hl=en-GB&src=1")