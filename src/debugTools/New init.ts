import fs from 'fs';

function mainRunner() {



    if (process.argv[2] == null) {
        console.log("missing argument, please provide a channal url, ex https://www.youtube.com/c/LinusTechTips")
    } else if (arraylenghtChecker() <= 4) {
        console.log("invalid url, please provide a channal url, ex https://www.youtube.com/c/LinusTechTips")
    } else {



        var url = process.argv[2]
        var urlFix = urlCheck()
        var urlArr = urlFix.split("/")
        var ChannalName = urlArr[urlArr.length - 1].toLowerCase()

        fs.mkdir('./log', function (ErrnoException) {
            if (ErrnoException) {
                if (ErrnoException.code == 'EEXIST') {
                    console.log('Directory exists already');
                } else {
                    console.log('failed to create directory');
                    return console.error(ErrnoException);
                }
            } else {

            }
        })

        fs.mkdir('./debugScreenshots', function (ErrnoException) {
            if (ErrnoException) {
                if (ErrnoException.code == 'EEXIST') {
                    console.log('Directory exists already');
                } else {
                    console.log('failed to create directory');
                    return console.error(ErrnoException);
                }
            } else {

            }
        })

        var today = new Date();
        var dateAndTime = today.toLocaleString('no-NB');

        let data = {
            "url": "placeholder.com",
            "channelUrl": `${url}/videos/`,
            "date": "ages ago",
            "views": "Sett 234k ganger",
            "posted": "no",
            "timePostedtoDiscord": `${dateAndTime}`
        }

        let jsonData = JSON.stringify(data)

        fs.writeFile(`./log/TEST${ChannalName}-data.json`, `${jsonData}`, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("Nessesery file and folder have been created");
        })

    }
}

function arraylenghtChecker() {

    var url = process.argv[2]
    var urlArr = url.split("/")
    return urlArr.length

}

function urlCheck() {

    var url = process.argv[2]
    var urlFix = url.charAt(url.length - 1)

    if (urlFix == "/") {
        return url.slice(0, -1)
    } else {
        return url
    }

}



mainRunner()