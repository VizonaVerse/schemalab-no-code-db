var express = require('express');
var router = express.Router();
var file = require('../functions/file.js');
var sql = require('../functions/sql.js');
var getDate = require('../functions/date.js');

router.post('/', async (req, res, next) => {
    try {
        var {data} = req.body;
        var ProjectName = data.projectName;
        var canvas = data.canvas;
    }catch (err){
        return res.status(400).json({
            code: 400,
            message: 'Invalid JSON format',
            errorCode: 'S00',
            data: {}, // can send back additional data later
            time: getDate(),
        });
    }

    try {
        var SqlString = await sql.generateSQL(canvas)
    } catch {
        //CAtch Codes
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
                message: result.Message,
                errorCode: result.code,
                data: {}, // can send back additional data later
                time: getDate(),
            });
        }
    }
    
    return res.status(200).json({message:"hi"});
    // result has a thing called file name 
    //sending 2 file
    // (__filename.sql, __filename.db)
});

module.exports = router;

