"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require('puppeteer');
const fs_1 = __importDefault(require("fs"));
require('dotenv').config();
const fetch = require("node-fetch");
function scrapePage(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer.launch();
        const page = yield browser.newPage();
        yield page.goto(url);
        yield page.screenshot({ path: `./debugScreenshots/screenshot${Math.floor(Date.now() / 1000)}.png` });
        sleep(10000).then(() => {
        });
        //get latest video URL
        const [ellatest] = yield page.$x('//*[@id="thumbnail"]');
        const latest = yield ellatest.getProperty('href');
        const latestUrl = yield latest.jsonValue();
        //get premier date/upload date
        const [elDate] = yield page.$x('//*[@id="metadata-line"]/span[2]');
        const date = yield elDate.getProperty('innerHTML');
        const dateTxt = yield date.jsonValue();
        console.log(latestUrl);
        console.log(dateTxt);
        logic(latestUrl, dateTxt);
        sleep(8000).then(() => {
            saveInfoToFile(latestUrl, dateTxt);
        });
        yield page.screenshot({ path: `screenshot${Math.floor(Date.now() / 1000)}.png` });
        yield browser.close();
    });
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function logic(url, date) {
    return __awaiter(this, void 0, void 0, function* () {
        var path = './dist/log';
        fs_1.default.readFile(`${path}/latest.json`, 'utf8', function read(err, data) {
            if (err) {
                return console.log(err);
            }
            let jsonData = JSON.parse(data);
            if (url == jsonData.url) {
                console.log("old content");
                if (date.split(" ")[0] == "Premieredato") {
                    console.log('I cant post this, this video is still not live 0003');
                }
                else {
                    if (jsonData.posted == 'no') {
                        webhook(url);
                        saveStateToFile('yes');
                    }
                    else {
                        console.log("This video should have been posted");
                    }
                }
            }
            else {
                console.log("new content");
                if (date.split(" ")[0] == "for") {
                    webhook(url);
                    saveStateToFile('yes');
                }
                else {
                    console.log('I cant post this, this video is still not live 0004');
                }
            }
        });
    });
}
function saveInfoToFile(url, date) {
    return __awaiter(this, void 0, void 0, function* () {
        var path = './dist/log';
        fs_1.default.readFile(`${path}/latest.json`, 'utf8', function read(err, data) {
            if (err) {
                return console.log(err);
            }
            let jsonData = JSON.parse(data);
            jsonData.url = url;
            jsonData.date = date;
            let jsonToJson = JSON.stringify(jsonData);
            fs_1.default.writeFile(`${path}/latest.json`, `${jsonToJson}`, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("URL and DATE was saved!");
            });
        });
    });
}
function saveStateToFile(state) {
    return __awaiter(this, void 0, void 0, function* () {
        var path = './dist/log';
        fs_1.default.readFile(`${path}/latest.json`, 'utf8', function read(err, data) {
            if (err) {
                return console.log(err);
            }
            let jsonData = JSON.parse(data);
            jsonData.posted = state;
            let jsonToJson = JSON.stringify(jsonData);
            fs_1.default.writeFile(`${path}/latest.json`, `${jsonToJson}`, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("State was saved!");
            });
        });
    });
}
function webhook(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const whrul = process.env.WEBHOOK;
        const msg = {
            "content": `${url}`
        };
        fetch(whrul, {
            "method": "POST", "headers": { "content-type": "application/json" },
            "body": JSON.stringify(msg)
        });
    });
}
//scrapePage('https://consent.youtube.com/m?continue=https%3A%2F%2Fwww.youtube.com%2Fuser%2Flinustechtips%2Fvideos&gl=NO&m=0&pc=yt&uxe=23983172&hl=en-GB&src=1')
//scrapePage('https://consent.youtube.com/m?continue=https%3A%2F%2Fwww.youtube.com%2Fuser%2FDuplexRecords%2Fvideos&gl=NO&m=0&pc=yt&uxe=23983172&hl=en-GB&src=1')
scrapePage('https://consent.youtube.com/m?continue=https%3A%2F%2Fwww.youtube.com%2Fuser%2Faumymx%2Fvideos&gl=NO&m=0&pc=yt&uxe=23983172&hl=en-GB&src=1');
