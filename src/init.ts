import fs from 'fs';

var path = './log'

fs.mkdir(path, function (ErrnoException) {
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

let data = {
    "url": "placeholder.com",
    "date": "ages ago",
    "posted": "no"
}

let jsonData = JSON.stringify(data)

fs.writeFile(`${path}/latest.json`, `${jsonData}`, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("Nessesery file and folder have been created");
})