var express = require('express');
var router = express.Router();
var file = require('../functions/file.js');
var sql = require('../functions/sql.js');
var getDate = require('../functions/date.js');
var path = require('path');

router.post('/', async (req, res, next) => {
    try {
        var {data} = req.body;
        var ProjectName = data.projectName;
        var canvas = data.canvas;
    }catch (err){
        return res.status(400).json({
            code: 400,
            message: err.message,
            errorCode: "S00",
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
            data: err.data,
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
    }

    return res.status(200).json({
        code: 200,
        message: "Files generated successfully",
        errorCode: "",
        data: {fileName: result.fileName},
        time: getDate()
    })

});

router.get('/DB', async (req, res, next) => {
    try{
        var {data} = req.body
    }catch (err){
        return res.status(400).json({
            code: 400,
            message: err.message,
            errorCode: "S00",
            data: {}, // can send back additional data later
            time: getDate(),
        });
    }
    
    file = path.resolve("tempFiles/" + data.fileName + ".db");
    res.sendFile(file, function (err) {
        if (err) {
            return res.status(400).json({
                code: 400,
                message: "Error sending Files",
                errorCode: "F00",
                data: err, // can send back additional data later
                time: getDate(),
            });
        }
    });
    res.status(200);
});

router.get('/SQL', async (req, res, next) => {
    try{
        var {data} = req.body
    }catch (err){
        return res.status(400).json({
            code: 400,
            message: err.message,
            errorCode: "S00",
            data: {}, // can send back additional data later
            time: getDate(),
        });
    }
    
    file = path.resolve("tempFiles/" + data.fileName + ".sql");
    res.sendFile(file, function (err) {
        if (err) {
            return res.status(400).json({
                code: 400,
                message: "Error sending Files",
                errorCode: "F00",
                data: err, // can send back additional data later
                time: getDate(),
            });
        }
    });
    res.status(200);
});

module.exports = router;

