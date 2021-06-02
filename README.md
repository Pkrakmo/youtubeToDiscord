# youtubeToDiscord
Script that will get the latest youtube video from a spesific channel and post it to Discord via their Webhook
I have tested this on Windows 10 and Raspberry Pi OS

# Setup / Running

## Installation guide

* you must have node installed to run this program locally.
* You will also need other packages. To install these, run this command:

```sh
npm install
```

## env

> You will need a .env file to run this locally. It requires 1 value for the basic use, but for debugging it needs 2 values containing discord webhook URL: [How to generate a discord webhook url](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)

ENV variables needed
  
| Name | Data needed |
| ------ | ------ |
| WEBHOOK | Discord webhook url|
| WEBHOOKDEBUG | Discord webhook url |

## Compile

* To run this scrip you need to compile the the typescript files into usable javascript files

```sh
tsc
```

* a new folder named dist will apear with the javascript-files that you need
  
## Setup
  
* I have set it up so that you only need to feed it arguments
* First we need some folders, and a data file for storing information
* arguments accepted: url (required) (NB: It is important that )

```sh
node .\dist\init.js channal/user URL
```
Example: 
```sh
node .\dist\init.js https://www.youtube.com/c/LinusTechTips
```

This will create a folder in the root of the working directory
*./debugScreenshots <-- will be removed sometime in the future
*./log
*./log/channalname-data.json

## Running

* I have set it up so that you only need to feed it arguments
* arguments accepted: channalname (required) debug (optional)

```sh
node .\dist\app.js channalname 
```
Example: 
```sh
node .\dist\app.js linustechtips
```
debug Example: 
```sh
node .\dist\app.js linustechtips debug
```

## Making it work on a Raspberry Pi

* this script uses puppeteer that needs chromeium installed, but it needs to be installed manually on Raspberry Pi OS [Source: Puppeteer on Raspberry Pi OS NodeJS
](https://samiprogramming.medium.com/puppeteer-on-raspbian-nodejs-3425ccea470e)

```sh
sudo apt install chromium-browser chromium-codecs-ffmpeg
```

* Since I am a total n00b I do not use complete paths, so this will cause issues trying to run it on RPi, but using bash-files are the workaround for now

```sh
#!/bin/bash
cd /home/pi/projects/youtubeToDiscord/
node dist/app.js linustechtips debug
```
* here is an example of how I check mulitple channels:

```sh
#!/bin/bash
cd /home/pi/projects/youtubeToDiscord/
node dist/app.js linustechtips debug
cd /home/pi/projects/youtubeToDiscord/
node dist/app.js videogamedunkey debug
```