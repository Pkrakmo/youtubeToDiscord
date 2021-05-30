import fs from 'fs';

async function createMockJSON() {

    var path = './log'
    fs.readFile(`${path}/latest.json`, 'utf8', function read(err, data) {
        if (err) {
            return console.log(err);
        }

        let jsonData = JSON.parse(data)

        var today = new Date();
        var dateAndTime = today.toLocaleString('no-NB');

        jsonData.url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        jsonData.date = "for 35 minutter siden"
        jsonData.views = "Sett 234k ganger"
        jsonData.posted = "yes"
        jsonData.timePostedtoDiscord = dateAndTime

        // Premieredato 28.05.2021, 21:15
        //

        let jsonToJson = JSON.stringify(jsonData)

        fs.writeFile(`${path}/latest.json`, `${jsonToJson}`, function (err) {
            if (err) {
                return console.log(err);
            }
            //console.log("URL and DATE was saved!");
        })

    })
}


createMockJSON()