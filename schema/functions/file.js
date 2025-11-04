const fs = require('fs');
const sqlite3 = require('sqlite3');
const filePath = '../tempFiles/';
const timeToLive = 1000 * 60 * 10; // 10 mins

function generateFiles(sqlString, projectName) {
    // get nextID and increment
    var info = JSON.parse(fs.readFileSync(`${filePath}fileInfo.json`, 'utf-8'));
    var id = info.nextID;
    info.nextID = info.nextID + 1;

    var fileName = projectName + '-' + id;

    // add deleteTimes for the current fileNames
    info.deleteTimes.push({
        fileName: fileName,
        deleteTime: Date.now() + timeToLive
    })

    // create new db
    var newdb = new sqlite3.Database(`${filePath}${fileName}.db`, (err) => {
        if (err) {
            console.log("Error creating sqlite file: " + err);
            throw "V00";
        }
        // run the sql
        try {
            newdb.exec(sqlString, ()  => {runQueries(newdb)});
        } catch (err){
            console.log("Error inserting sqlite schema: " + err);
            throw "V01";
        }
    });
    newdb.close();

    // create sql file
    fs.writeFileSync(`${filePath}${fileName}.sql`, sqlString);

    // write to info file
    fs.writeFileSync(`${filePath}fileInfo.json`, JSON.stringify(info));

    return fileName;
}

function deleteFiles() {
    // delete all files past the delete time specified in fileInfo
}

module.exports = {generateFiles, deleteFiles};