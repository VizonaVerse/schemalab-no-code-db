var express = require('express');
var router = express.Router();
var file = require('../functions/file.js');
var sql = require('../functions/sql.js');
var getDate = require('../functions/date.js');
var Filename = "";

router.post('/build', async (req, res, next) => {
    try {
        var {data} = req.body;
        var ProjectName = data.projectName;
        var canvas = data.canvas;
    }catch (err){
        return res.status(400).json({
            code: err.code,
            message: err.message,
            errorCode: err.httpCode,
            data: {}, // can send back additional data later
            time: getDate(),
        });
    }

    try {
        var SqlString = await sql.generateSQL(canvas)
    } catch(err) {
        return res.status(err.httpCode).json({
            code: err.httpCode,
            message: err.message,
            errorCode: err.code,
            data: {}, // can send back additional data later
            time: getDate(),
        });
    }
    try {
        var result = await file.deleteFiles()
    }catch(err) {
        return res.status(err.httpCode).json({
            code: err.httpCode,
            message: err.message,
            errorCode: err.code,
            data: {}, // can send back additional data later
            time: getDate(),
        });
    }
    
    var result = await file.generateFiles(SqlString, ProjectName, 0) // placeholder ttl value
    if (result.failed == true) {
        if (result.code == "V00") {
        return res.status(result.httpCode).json({
                code: result.httpCode,
                message: result.message,
                errorCode: result.code,
                data: {}, // can send back additional data later
                time: getDate(),
            });
        } else if (result.code == "V01") {
            return res.status(result.httpCode).json({
                code: result.httpCode,
                message: result.message,
                errorCode: result.code,
                data: {}, // can send back additional data later
                time: getDate(),
            });
        }
    } else {
        Filename = result.fileName
    }

    return res.status(400)

});

router.post('/DBBuild', async (req, res, next) => {
    const options = {
        root: path.join('./tempFiles/')
    };

    File = FileName + ".db";
    res.sendFile(file, options, function (err) {
        if (err) {
            return res.status(400).json({
                code: 400,
                message: "Error sending Files",
                errorCode: "F00",
                data: {}, // can send back additional data later
                time: getDate(),
            });
        } else {
            return res.status(200).json({
                code: 200,
                message: "File Sent Successfully",
                errorCode: "",
                data: {}, // can send back additional data later
                time: getDate(),
            });
        }
    });
});

router.post('/SQLBuild', async (req, res, next) => {
    const options = {
        root: path.join('./tempFiles/')
    };

    File = FileName + ".sql";
    res.sendFile(file, options, function (err) {
        if (err) {
            return res.status(400).json({
                code: 400,
                message: "Error sending Files",
                errorCode: "F00",
                data: {}, // can send back additional data later
                time: getDate(),
            });
        } else {
            return res.status(200).json({
                code: 200,
                message: "File Sent Successfully",
                errorCode: "",
                data: {}, // can send back additional data later
                time: getDate(),
            });
        }
    });
});

module.exports = router;

