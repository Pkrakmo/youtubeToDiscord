const puppeteer = require('puppeteer')
import fs from 'fs';
require('dotenv').config();
const fetch = require("node-fetch");

async function scrapePage(url: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage()

    await page.goto(url);

    await page.screenshot({
        path: `./debugScreenshots/screenshot${Math.floor(Date.now() / 1000)}.png`
    });
    sleep(10000).then(() => {});

    //get latest video URL
    const [ellatest] = await page.$x('//*[@id="thumbnail"]')
    const latest = await ellatest.getProperty('href')
    const latestUrl = await latest.jsonValue();


    //get premier date/upload date
    const [elDate] = await page.$x('//*[@id="metadata-line"]/span[2]')
    const date = await elDate.getProperty('innerHTML')
    const dateTxt = await date.jsonValue();

    logic(latestUrl, dateTxt)

    sleep(8000).then(() => {
        saveInfoToFile(latestUrl, dateTxt)
    });

    await browser.close();
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function logic(url: string, date: string) {

    var path = './log'
    fs.readFile(`${path}/latest.json`, 'utf8', function read(err, data) {
        if (err) {
            return console.log(err);
        }

        let jsonData = JSON.parse(data)


        if (url == jsonData.url) {

            //console.log("old content")

            if (date.split(" ")[0] == "Premieredato") {

                //console.log('I cant post this, this video is still not live 0003')

            } else {

                if (jsonData.posted == 'no') {

                    webhook(url)
                    saveStateToFile('yes')

                } else {

                    //console.log("This video should have been posted")

                }
            }

        } else {

            //console.log("new content")

            if (date.split(" ")[0] == "for") {

                webhook(url)
                saveStateToFile('yes')

            } else {

                //console.log('I cant post this, this video is still not live 0004')

            }



        }

    })

}

async function saveInfoToFile(url: string, date: string) {

    var path = './log'
    fs.readFile(`${path}/latest.json`, 'utf8', function read(err, data) {
        if (err) {
            return console.log(err);
        }

        let jsonData = JSON.parse(data)

        jsonData.url = url
        jsonData.date = date

        let jsonToJson = JSON.stringify(jsonData)

        fs.writeFile(`${path}/latest.json`, `${jsonToJson}`, function (err) {
            if (err) {
                return console.log(err);
            }
            //console.log("URL and DATE was saved!");
        })

    })
}

async function saveStateToFile(state: string) {

    var path = './log'
    fs.readFile(`${path}/latest.json`, 'utf8', function read(err, data) {
        if (err) {
            return console.log(err);
        }


        let jsonData = JSON.parse(data)

        jsonData.posted = state;

        let jsonToJson = JSON.stringify(jsonData)

        fs.writeFile(`${path}/latest.json`, `${jsonToJson}`, function (err) {
            if (err) {
                return console.log(err);
            }
            //console.log("State was saved!");
        })

    })
}

async function webhook(url: string) {
    const whrul = process.env.WEBHOOK;
    const msg = {
        "content": `${url}`
    };
    fetch(whrul, {
        "method": "POST",
        "headers": {
            "content-type": "application/json"
        },
        "body": JSON.stringify(msg)
    });
}

scrapePage('https://consent.youtube.com/m?continue=https%3A%2F%2Fwww.youtube.com%2Fuser%2FlinustEchtips%2Fvideos&gl=NO&m=0&pc=yt&uxe=23983172&hl=en-GB&src=1')