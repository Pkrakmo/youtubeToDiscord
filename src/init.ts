import fs from 'fs';

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

fs.writeFile(`./log/latest.json`, `${jsonData}`, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("Nessesery file and folder have been created");
})