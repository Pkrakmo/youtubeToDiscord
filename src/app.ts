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

    // Youtube consent bit

    const [button] = await page.$x('//*[@id="yDmH0d"]/c-wiz/div/div/div/div[2]/div[1]/div[4]/form/div[1]/div/button');

    if (button) {
        await button.click();
    }

    //await page.screenshot({ path: `./debugScreenshots/ScreenshotBeforeClick${Math.floor(Date.now() / 1000)}.png` });

    await page.waitForXPath('//*[@id="logo"]', {
        visible: true
    })

    //await page.screenshot({ path: `./debugScreenshots/ScreenshotAfterClick${Math.floor(Date.now() / 1000)}.png` });

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

    //will sleep for 4 seconds before executing the comparison logic
    sleep(4000).then(() => {
        magicFunction(latestUrl, dateTxt, viewsTxt)
    });

    //will sleep for 10 seconds before saving data to file (subject to change)
    sleep(10000).then(() => {
        saveInfoToFile(latestUrl, dateTxt, viewsTxt)
    });
    await browser.close();

}

/**
 * This function will run through a series if IF statements 
 * too see if the video should be posted or not
 * @param {string} url - Video url
 * @param {string} date - Video upload date or Premierdate
 * @param {string} views - Current Views, Waiting or Premierdate
 */
async function magicFunction(url: string, date: string, views: string) {

    fs.readFile(`./log/${process.argv[2]}-data.json`, 'utf8', function read(err, data) {
        if (err) {
            return console.log(err);
        }

        let jsonData = JSON.parse(data)

        //Items for checking if an video is streaming or premiering
        let premierWordOne: string = date.split(" ")[0]
        let premierWordTwo: string = date.split(" ")[1]
        let premierWordThree: string = views.split(" ")[0]

        //array of the variables above
        let premierWordArray = [premierWordOne, premierWordTwo, premierWordThree]

        //array of the possible variables for Premiering video or streaming
        let premierArray = ["Premieredato", "venter", "ser"]

        //will compare Array premierWordArray against Array premierArray too see if the video is Premiering or is a livestream
        let foundWord: boolean = premierWordArray.some(arr => premierArray.includes(arr))

        //Items for checking if an video is posted or done streaming/premiering
        let dateWord: string = date.split(" ")[0]
        let afterPremierArray = ["for", "Strømmet", "StrÃ¸mmet"]

        if (url == "") {
            debugData(url, date, views, 'No URL from scraping, stopping proccess')
            debugCopyFile()
            throw new Error("No URL from scraping, stopping proccess")
        } else if (jsonData.url == "") {
            debugData(url, date, views, 'No URL from JSON-file, stopping proccess')
            debugCopyFile()
            throw new Error("No URL from JSON-file, stopping proccess")
        } else{

            if (jsonData.url != url) {
                /**
                 * 001
                 * This part will be triggered if the URL does not match the URL in the JSON aka there is a new video
                 * 002 And it will then check if the video is Premiering or a livestream, if so it will not be posted
                 * 003 If the video is not Premiering or a livestream it will be posted and then marked as posted as 006 will prevent it
                 */
                if (foundWord) {
                    debugData(url, date, views, 'premiering or streaming 002 via new url 001')
                    saveStateToFile("no")
                } else if (afterPremierArray.includes(dateWord)) {
                    debugData(url, date, views, 'posting video 003 via new url 001')
                    webhook(url)
                    saveStateToFile("yes")
                }

            } else if (jsonData.url == url) {
                /**
                 * 004
                 * This part will be triggered if the URL does match with the URL in the JSON
                 * This does occure if the video was livestreaming or Premiering on the scan when the video
                 * was added to the selected channal
                 * 005 It will then check if the video is Premiering or a livestream,if so it will not be posted
                 * 006 If the video is already posted it will not be posted
                 * 007 If the video is not a Premiering or a livestream and it has not been posted before it will be posted
                 */
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

    let ChannalName = process.argv[2]
    let ChannalNameLowerCase = ChannalName.toLowerCase()

    fs.readFile(`./log/${ChannalNameLowerCase}-data.json`, 'utf8', function read(err, data) {
        if (err) {
            return console.log(err);
        }

        let jsonData = JSON.parse(data)

        jsonData.url = url
        jsonData.date = date
        jsonData.views = views

        let jsonToJson = JSON.stringify(jsonData)

        fs.writeFile(`./log/${ChannalNameLowerCase}-data.json`, `${jsonToJson}`, function (err) {
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

    let ChannalName = process.argv[2]
    let ChannalNameLowerCase = ChannalName.toLowerCase()

    fs.readFile(`./log/${ChannalNameLowerCase}-data.json`, 'utf8', function read(err, data) {
        if (err) {
            return console.log(err);
        }

        var today = new Date();
        var dateAndTime = today.toLocaleString('no-NB');

        let jsonData = JSON.parse(data)

        jsonData.posted = state;
        jsonData.timePostedtoDiscord = dateAndTime

        let jsonToJson = JSON.stringify(jsonData)

        fs.writeFile(`./log/${ChannalNameLowerCase}-data.json`, `${jsonToJson}`, function (err) {
            if (err) {
                return console.log(err);
            }
        })

    })
}

/**
 * Copies ./log/latest.json if something went wrong
 * Creates a new file named ./log/latest{UNIXtimestamp}.json
 */
async function debugCopyFile() {

    let ChannalName = process.argv[2]
    let ChannalNameLowerCase = ChannalName.toLowerCase()

    fs.copyFile(`./log/${ChannalNameLowerCase}-data.json`, `./log/${ChannalNameLowerCase}-data${Math.floor(Date.now() / 1000)}.json`, (err) => {
        if (err) {
            console.log("Error Found:", err);
        } else {
            webhookDebug(`file copied !`)
        }
    });
}

/**
 * Function for trying to delay some operations
 * @param {number} ms - time given in ms
 */
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

/**
 * Own webhook function for debugging, subject to change
 * @param {string} dataString - will send the input to webhook target
 */
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

/**
 * Executes the whole flow by using the first arugment
 * ex: node .\dist\app.js DuplexRecords
 */
function scriptExecuter() {


    let ChannalName = process.argv[2]
    let ChannalNameLowerCase = ChannalName.toLowerCase()

    fs.readFile(`./log/${ChannalNameLowerCase}-data.json`, 'utf8', function read(err, data) {
        if (err) {
            return console.log("File does not exisit, did you run the init.js file first ? example: node .\dist\init.js https://www.youtube.com/c/LinusTechTips");
        } 

        let jsonData = JSON.parse(data)
        scrapePage(jsonData.channelUrl)

    })

}

/**
 * Executes the whole debug flow by using the first arugment
 * ex: node .\dist\app.js DuplexRecords debug
 */
async function debugData(url: string, date: string, views: string, consoleLogMessage: string) {

    var today = new Date();
    var dateAndTime = today.toLocaleString('no-NB');

    let debugArg = process.argv[3]

    let ChannalName = process.argv[2]
    let ChannalNameLowerCase = ChannalName.toLowerCase()

    if (debugArg == null) {} else if (debugArg.toLowerCase() == "debug") {

        fs.readFile(`./log/${ChannalNameLowerCase}-data.json`, 'utf8', function read(err, data) {
            if (err) {
                return console.log(err);
            }

            let jsonData = JSON.parse(data)

            webhookDebug(`Run time of debug: ${dateAndTime}\nChannalName: ${ChannalNameLowerCase} \nJSON-data from file:\nURL: ${jsonData.url} \nDate: ${jsonData.date} \nViews: ${jsonData.views} \nPosted: ${jsonData.posted} \nTimePosted: ${jsonData.timePostedtoDiscord}  \n\nData pulled from scrape, before saved to file:\nURL: ${url} \nDate: ${date} \nViews: ${views}  \nConsoleLogMessage: ${consoleLogMessage}`)
        })
    }
}

scriptExecuter()