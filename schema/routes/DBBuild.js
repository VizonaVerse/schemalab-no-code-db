var express = require('express');
var router = express.Router();
var file = require('../functions/file.js');
var sql = require('../functions/sql.js');
var getDate = require('../functions/date.js');

router.post('/DBBuild', async (req, res, next) => {
    const options = {
        root: path.join(tempFiles)
    };

    const fileName = 'Hello.txt';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.error('Error sending file:', err);
        } else {
            return res.status(200)
        }
    });
});

app.listen(PORT, function (err) {
    if (err) console.error(err);
        return res.status(200)
});

module.exports = router;