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
    
    try {
    // create sql file
    fs.writeFileSync(`${filePath}${fileName}.sql`, sqlString);

    // write to info file
    fs.writeFileSync(`${filePath}fileInfo.json`, JSON.stringify(info));
    } catch (err) {
        console.log("Error writing to file: " + err);
        throw "F00";
    }

    return fileName;
}

function deleteFiles() {
    // delete all files past the delete time specified in fileInfo
    var info = JSON.parse(fs.readFileSync(`${filePath}fileInfo.json`, 'utf-8'));
    var keep = [];
    const date = Date.now();
    for (var item of info.deleteTimes) {
        if (item.deleteTime < date) {
            // delete files
            try {
                fs.unlinkSync(`${filePath}${item.fileName}.db`)
                fs.unlinkSync(`${filePath}${item.fileName}.sql`)
            } catch (err) {
                console.log("Error deleting temp files: " + err);
                throw "F00";
            }
        } else {
            // add the item to the new array to be kept in fileInfo
            keep.push(item)
        }
    }
    info.deleteTimes = keep;
    try {
        fs.writeFileSync(`${filePath}fileInfo.json`, JSON.stringify(info));
    } catch (err) {
        console.log("Error writing to file: " + err);
        throw "F00";
    }
}

module.exports = {generateFiles, deleteFiles};