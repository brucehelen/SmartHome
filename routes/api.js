/**
 * Created by missionhealth on 15/10/23.
 */

var express = require('express');
var api = express.Router();
var db = require('../device_server/device_db');

/* GET device id */
api.get('/:device_id', function(req, res, next) {
    var device_id = req.params.device_id;
    var data;
    if (device_id) {
        db.get(device_id, function(err, user) {
            if (err) {
                console.error('read db error ' + err);
                res.send('device_id: ' + device_id);
                return;
            }
            data = JSON.stringify(user);
            console.log('user: ' + data);
            res.send(data);
        });
    } else {
        res.send('no device_id');
    }
});

module.exports = api;
