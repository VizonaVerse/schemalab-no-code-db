var express = require('express');
var router = express.Router();
var file = require('../functions/file.js');
var sql = require('../functions/sql.js');
var getDate = require('../functions/date.js');

/* GET home page. */
 router.get('/', async function (req, res, next) {
    try {
        const {data} = req.body;
        const ProjectName = data.ProjectName
        const canvas= data.canvas
    }catch{
        return res.status(400).json({
            code: 400,
            message: 'ivalid Json format',
            errorCode: 'S00',
            data: {}, // can send back additional data later
            time: getDate(),
        });
    }

    try {
        const SqlString = await sql.generateSQL(canvas)
    } catch {
        //CAtch Codes
    }
    
    try {
        const result = await file.deletefiles ()
    }catch(err) {
        return res.status(err.httpCode).json({
            code: err.httpCode,
            message: err.message,
            errorCode: err.code,
            data: {}, // can send back additional data later
            time: getDate(),
        });
    }

    const result = await file.generateFiles (SqlString, ProjectName, ttl)
    if (result.failed = True) 
        if (result.code = "V00")
        return res.status(result.httpCode).json({
                code: result.httpCode,
                message: result.message,
                errorCode: result.code,
                data: {}, // can send back additional data later
                time: getDate(),
            });
        else if (result.code = "V01")
            return res.status(result.httpCode).json({
                code: result.httpCode,
                message: result.Message,
                errorCode: result.code,
                data: {}, // can send back additional data later
                time: getDate(),
            });
    

    return res.status(200)
    // result has a thing called file name 
    //sending 2 file
    // (__filename.sql, __filename.db)
});

module.exports = router;

