import fs from 'fs';

function mainRunner() {

    if (process.argv[2] == null) {
        console.log("missing argument(s), please provide a channal name")
    } else {
        let ChannalName = process.argv[2]
        let ChannalNameLowerCase = ChannalName.toLowerCase()

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
            "date": "ages ago",
            "views": "Sett 234k ganger",
            "posted": "no",
            "timePostedtoDiscord": `${dateAndTime}`
        }

        let jsonData = JSON.stringify(data)

        fs.writeFile(`./log/${ChannalNameLowerCase}-data.json`, `${jsonData}`, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("Nessesery file and folder have been created");
        })

    }
}

mainRunner()