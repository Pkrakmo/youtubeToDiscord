import fs from 'fs';
import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import os from 'os';
require('dotenv').config();



/**
 * Will scrape the video youtube page with the help of @see {@link https://pptr.dev/} will only work on URLs like this:
 * https://www.youtube.com/user/username/videos
 * @param url
 * And it will look for Video url, Video upload date or Premierdate and Current Views, Waiting or Premierdate
 * Then it will excecute @see magicFunction() and run through the logics and check if the video should be posted or not
 * Then at the end it will save information to local JSON-file via the function @see saveInfoToFile()
 */
async function scrapePage(url: string) {

    const browser = await osChecker()

    const page = await browser.newPage()

    await page.goto(url);

    //get latest video URL
    const [ellatest] = await page.$x('//*[@id="thumbnail"]')
    const latest = await ellatest.getProperty('href')
    const latestUrl: string = await latest!.jsonValue();

    //get premier date/upload date
    const [elDate] = await page.$x('//*[@id="metadata-line"]/span[2]')
    const date = await elDate.getProperty('innerHTML')
    const dateTxt: string = await date!.jsonValue();

    //get premier date/views
    const [elViews] = await page.$x('//*[@id="metadata-line"]/span[1]')
    const views = await elViews.getProperty('innerHTML')
    const viewsTxt: string = await views!.jsonValue();

    sleep(4000).then(() => {
        magicFunction(latestUrl, dateTxt, viewsTxt)
    });

    await browser.close();
    sleep(10000).then(() => {
        saveInfoToFile(latestUrl, dateTxt, viewsTxt)
    });

}

/**
 * This function will run through a series if IF statements 
 * too see if the video should be posted or not
 * @param {string} url - Video url
 * @param {string} date - Video upload date or Premierdate
 * @param {string} views - Current Views, Waiting or Premierdate
 */
async function magicFunction(url: string, date: string, views: string) {

    fs.readFile(`./log/latest.json`, 'utf8', function read(err, data) {
        if (err) {
            return console.log(err);
        }

        let jsonData = JSON.parse(data)

        //Items for checking if an video is streaming or premiering
        let premierWordOne: string = date.split(" ")[0]
        let premierWordTwo: string = date.split(" ")[1]
        let premierWordThree: string = views.split(" ")[0]

        let premierWordArray = [premierWordOne, premierWordTwo, premierWordThree]
        let premierArray = ["Premieredato", "venter", "ser"]

        let foundWord: boolean = premierWordArray.some(arr => premierArray.includes(arr))

        //Items for checking if an video is posted or done streaming/premiering
        let dateWord: string = date.split(" ")[0]
        let afterPremierArray = ["for", "Strømmet", "StrÃ¸mmet"]

        if (jsonData.url == "") {
            debugData(url, date, views, 'missing URL in JSON-file or unable to read 000')         
        } else {
            if (jsonData.url != url) {
                //001
                if (foundWord) {
                    debugData(url, date, views, 'premiering or streaming 002 via new url 001')
                    saveStateToFile("no")
                } else if (afterPremierArray.includes(dateWord)) {
                    debugData(url, date, views, 'posting video 003 via new url 001')
                    webhook(url)
                    saveStateToFile("yes")
                }
    
            } else if (jsonData.url == url) {
                //004
                if (foundWord) {
                    debugData(url, date, views, 'premiering or streaming 005 via old url 004')
                    saveStateToFile("no")
                } else if (afterPremierArray.includes(dateWord)) {
                    if (jsonData.posted == "yes") {
                        debugData(url, date, views, 'already posted 006 via old url 004')
                    } else {
                        debugData(url, date, views, 'posting video 007 via old url 004')
                        webhook(url)
                        saveStateToFile("yes")
                    }
                }
            }
        }
        
        

    })
}

/**
 * Will send the paramteres and write it to an local JSON-file
 * @param {string} url - Video url
 * @param {string} date - Video upload date or Premierdate
 * @param {string} views - Current Views, Waiting or Premierdate
 */
async function saveInfoToFile(url: string, date: string, views: string) {

    fs.readFile(`./log/latest.json`, 'utf8', function read(err, data) {
        if (err) {
            return console.log(err);
        }

        let jsonData = JSON.parse(data)

        jsonData.url = url
        jsonData.date = date
        jsonData.views = views

        let jsonToJson = JSON.stringify(jsonData)

        fs.writeFile(`./log/latest.json`, `${jsonToJson}`, function (err) {
            if (err) {
                return console.log(err);
            }
        })

    })
}

/**
 * Will send the paramteres and write it to an local JSON-file
 * it will also save date and time to the JSON-file, subject to change
 * @param {string} state - is it posted yes/no
 */
async function saveStateToFile(state: string) {

    fs.readFile(`./log/latest.json`, 'utf8', function read(err, data) {
        if (err) {
            return console.log(err);
        }

        var today = new Date();
        var dateAndTime = today.toLocaleString('no-NB');

        let jsonData = JSON.parse(data)

        jsonData.posted = state;
        jsonData.timePostedtoDiscord = dateAndTime

        let jsonToJson = JSON.stringify(jsonData)

        fs.writeFile(`./log/latest.json`, `${jsonToJson}`, function (err) {
            if (err) {
                return console.log(err);
            }
        })

    })
}



function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function webhook(dataString: string) {
    const whurl = process.env.WEBHOOK;
    const msg = {
        "content": `${dataString}`
    };
    fetch(whurl!, {
        "method": "POST",
        "headers": {
            "content-type": "application/json"
        },
        "body": JSON.stringify(msg)
    });
}

async function webhookDebug(dataString: string) {
    const whurl = process.env.WEBHOOKDEBUG;
    const msg = {
        "content": `${dataString}`
    };
    fetch(whurl!, {
        "method": "POST",
        "headers": {
            "content-type": "application/json"
        },
        "body": JSON.stringify(msg)
    });

}

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


function scriptExecuter() {
    if (process.argv[2] == null) {
        console.log("missing argument(s)")
    } else {
        var ytChannalname = process.argv[2]
        var ytUrl = `https://consent.youtube.com/m?continue=https%3A%2F%2Fwww.youtube.com%2Fuser%2F${ytChannalname}%2Fvideos&gl=NO&m=0&pc=yt&uxe=23983172&hl=en-GB&src=1`

        scrapePage(ytUrl)
    }
}


async function debugData(url: string, date: string, views: string, consoleLogMessage: string) {

    var today = new Date();
    var dateAndTime = today.toLocaleString('no-NB');

    if (process.argv[3] == null) {
    } else if (process.argv[3] == "debug") {

        fs.readFile(`./log/latest.json`, 'utf8', function read(err, data) {
            if (err) {
                return console.log(err);
            }

            let jsonData = JSON.parse(data)

            webhookDebug(`Run time of debug: ${dateAndTime} \nJSON-data from file:\nURL: ${jsonData.url} \nDate: ${jsonData.date} \nViews: ${jsonData.views} \nPosted: ${jsonData.posted} \nTimePosted: ${jsonData.timePostedtoDiscord}  \n\nData pulled from scrape, before saved to file:\nURL: ${url} \nDate: ${date} \nViews: ${views}  \nConsoleLogMessage: ${consoleLogMessage}`)
        })
    }
}

scriptExecuter()