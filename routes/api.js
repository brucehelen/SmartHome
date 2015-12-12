/**
 * Created by missionhealth on 15/10/23.
 */

var express = require('express');
var api = express.Router();
var db = require('../device_server/device_db');

var fs = require("fs");
var path = require("path");

/**
 * 根据设备id获取设备的状态
 */
api.get('/get_status/:device_id', function(req, res, next) {
    var device_id = req.params.device_id;
    var res_json_obj = {
        status: 0,          // API请求是否成功
        desc:'',            // API请求结果描述
        online: 0,          // 设备是否在线
        last_report: '',    // 设备最后一次汇报时间
        value:''            // 传感器的具体值
    };

    // TODO 检查设备id是否合法

    if (device_id) {
        db.get(device_id, function(err, db_docs) {
            if (err) {
                console.error('db read error ' + err);
                res.send('db read error: ' + device_id);
                return;
            }

            if (db_docs.length !== 0) {
                var first_obj = db_docs[0];
                var is_online = global.online_device[first_obj.ip_address];
                res_json_obj.status = 1;
                res_json_obj.desc = 'OK';
                if (is_online) {
                    res_json_obj.online = 1;
                    res_json_obj.connect_time = is_online.connect_time;
                } else {
                    res_json_obj.online = 0;
                    res_json_obj.connect_time = 0;
                }
                res_json_obj.last_report = first_obj.recv_time;
                res_json_obj.value = first_obj.sensor_data;
            } else {
                res_json_obj.desc = 'device id[' + device_id + '] not found';
            }

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

/*
 * 控制设备,value
 */
api.post('/set_status/:device_id', function(req, res, next) {
    var device_id = req.params.device_id;
    var res_json_obj = {
        status: 0,          // 发送控制命令给设备是否成功
        desc:''             // API请求结果文字描述
    };

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
                if (is_online) {
                    // value
                    var value = req.body.value;
                    var client = is_online.c;
                    client.write(value, function() {
                        res_json_obj.desc = 'OK';
                        res_json_obj.status = 1;

                        res.set('Content-Type','application/json');
                        res.status(200).send(JSON.stringify(res_json_obj));
                    });
                } else {
                    res_json_obj.desc = 'device[' + device_id + '] offline';

                    res.set('Content-Type','application/json');
                    res.status(200).send(JSON.stringify(res_json_obj));
                }
            } else {
                res_json_obj.desc = 'device id[' + device_id + '] not found';

                res.set('Content-Type','application/json');
                res.status(200).send(JSON.stringify(res_json_obj));
            }
        });
    } else {
        res_json_obj.desc = 'device id error';
        res.set('Content-Type','application/json');
        res.status(200).send(JSON.stringify(res_json_obj));
    }
});

// helen测试用API
api.get('/bruce_love_helen', function(req, res, next) {
    var res_json_obj = {
        "messageId": '1',
        "message": "明天天气怎么样"
    };

    res.set('Content-Type','application/json');
    res.status(200).send(JSON.stringify(res_json_obj));
});

// 文件服务器
api.get('/file/:filename', function (req, res, next) {
    var filename = '/share/db_server/' + req.params.filename;

    // /share/db_server
    console.log('read file: ' + filename);
    fs.readFile(filename, "binary", function(err, file) {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end(err);
        } else {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(file, "binary");
            res.end();
        }
    });
});


/**
 * 其他不匹配的情况的处理
 */
api.get(function(req, res) {

});

api.post(function(req, res) {

});

module.exports = api;
