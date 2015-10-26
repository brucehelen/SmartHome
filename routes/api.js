/**
 * Created by missionhealth on 15/10/23.
 */

var express = require('express');
var api = express.Router();
var db = require('../device_server/device_db');

/**
 * 根据设备id获取设备的状态
 */
api.get('/get_status/:device_id', function(req, res, next) {
    var device_id = req.params.device_id;
    var res_json_obj = {
        "status": 0,
        "desc":'',
        "online": 0,
        "last_report": '',
        "value":''
    };

    // TODO 检查设备id是否合法

    if (device_id) {
        db.get(device_id, function(err, db_docs) {
            if (err) {
                console.error('read db error ' + err);
                res.send('device_id: ' + device_id);
                return;
            }

            if (db_docs.length !== 0) {
                var first_obj = db_docs[0];
                var is_online = global.online_device[first_obj.ip_address];
                res_json_obj.status = 1;
                res_json_obj.desc = 'OK';
                res_json_obj.online = is_online ? 1:0;
                res_json_obj.connect_time = is_online;
                res_json_obj.value = first_obj.sensor_data;
                res_json_obj.last_report = first_obj.recv_time;
            } else {
                res_json_obj.desc = 'device id[' + device_id + '] not found';
            }

            //console.log(JSON.stringify(res_json_obj));
            res.set('Content-Type','application/json');
            res.status(200).send(JSON.stringify(res_json_obj));
        });
    } else {
        res_json_obj.desc = 'device id error';
        res.set('Content-Type','application/json');
        res.status(200).send(JSON.stringify(res_json_obj));
    }
});

api.post('/get_status', function(req, res, next) {
    console.log('/get_status');
});

/**
 * 其他不匹配的情况的处理
 */
api.get(function(req, res) {

});

api.post(function(req, res) {

});

module.exports = api;
