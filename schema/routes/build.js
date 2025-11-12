var express = require('express');
var router = express.Router();
var file = require('./functions/file.js');
var getDate = require('../functions/date.js');

/* GET home page. */
 router.get('/', async function (req, res, next) {
    try {
        //fix the req.body to be in new format
        //only need projetc Name and canvas 
        const {  } = req.body;
    }catch{
        // error code bad request (400) json sent in wrong fromat
    }

    //function generate SQL go here

    try {
        const result = await file.deletefiles ()
    }catch(err) {
        res.status(404).json({
            code: 404,
            message: err.message,
            errorCode: err.code,
            data: {}, // can send back additional data later
            time: getDate(),
        });
    }

    try { // no catch put if staments for res catch no try
        const result = await file.generateFiles (SqlString, ProjectName, ttl)
    }catch{
        if (result = "V00")
            return res.status(400).json({ Message:"V00: A server-side error in the validation"});
        else if (result = "V01")
            return res.status(400).json({ Message:"V01: Invalid schema upon db file creation"});
    }

});

module.exports = router;

