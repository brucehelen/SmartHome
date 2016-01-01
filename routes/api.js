/**
 * Created by missionhealth on 15/10/23.
 */

var express = require('express');
var api = express.Router();
var db = require('../device_server/device_db');
var relays = require('../device_server/relays');

var fs = require("fs");
var path = require("path");
var url = require('url');
var async = require('async');

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
        value:{}            // 传感器的具体值
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

// 获取历史数据
// history
api.get('/history/:device_id', function(req, res, next) {
    var device_id = req.params.device_id;

    if (device_id) {
        db.history({device_id: device_id, records: 200}, function(err, db_docs) {
            if (err) {
                res.set('Content-Type','application/json');
                res.status(200).send(JSON.stringify({status: 0, desc: 'db -> ' + err}));
                return;
            }

            if (db_docs.length !== 0) {
                res.set('Content-Type','application/json');
                res.status(200).send(JSON.stringify({status: 1, desc: 'OK', history: db_docs}));
            } else {
                res.set('Content-Type','application/json');
                res.status(200).send(JSON.stringify({status: 0, desc: 'device id[' + device_id + '] not found'}));
            }
        });
    } else {
        res.set('Content-Type','application/json');
        res.status(200).send(JSON.stringify({status: 0, desc: 'device id error'}));
    }
});

//
// 上传iPhone手机的devicetoken, 推送时会用到
// /api/uploadDeviceToken?userName=Bruce&deviceToken=dfjdkfjdkfjdkfjdkf
//
api.get('/uploadDeviceToken', function(req, res, next) {
    var arg = url.parse(req.url, true).query;
    var res_json_obj = {};

    console.log('arg.userName: ' + arg.userName);
    console.log('arg.deviceToken: ' + arg.deviceToken);

    if (arg.userName && arg.deviceToken) {
        console.log('1');
        db.updateUserDeviceToken(arg, function(err, results) {
            if (err) {
                console.log('uploadDeviceToken ' + err);
                res_json_obj.state = 0;
                res_json_obj.desc = 'uploadDeviceToken ' + err;
            } else {
                res_json_obj.state = 1;
                res_json_obj.desc = 'uploadDeviceToken OK -> ' + results;
            }
        });

        console.log('2');
    } else {
        res_json_obj.state = 0;
        res_json_obj.desc = 'param error';
    }

    console.log('3');

    console.log(JSON.stringify(res_json_obj));

    res.set('Content-Type','application/json');
    res.status(200).send(JSON.stringify(res_json_obj));
});


// 继电器控制
// 获取继电器状态/gpio/relays
// 设置继电器状态/gpio/relays?value=0
api.get('/gpio/relays', function(req, res, next) {
    var arg = url.parse(req.url, true).query;
    var res_json_obj = {};

    if (arg.value) {      // 设置继电器状态
        var v = parseInt(arg.value, 10);
        relays.relaysControl(v);
        res_json_obj.state = 1;
        res_json_obj.desc = 'relays set success';
        res_json_obj.value = relays.readRelayState();
    } else {        // 获取继电器状态
        var state = relays.readRelayState();
        res_json_obj.state = 1;
        res_json_obj.desc = 'relays read success';
        res_json_obj.value = state;
    }

    res.set('Content-Type','application/json');
    res.status(200).send(JSON.stringify(res_json_obj));
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
                    console.log('-> ' + value);
                    var client = is_online.c;
                    client.write(value, function(err) {
                        if (err) {
                            res_json_obj.desc = 'Send data to client error ' + err;
                            res_json_obj.status = 0;

                            res.set('Content-Type','application/json');
                            res.status(200).send(JSON.stringify(res_json_obj));
                        } else {
                            res_json_obj.desc = 'OK';
                            res_json_obj.status = 1;

                            res.set('Content-Type','application/json');
                            res.status(200).send(JSON.stringify(res_json_obj));
                        }
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

// 文件服务器
api.get('/file/:filename', function (req, res, next) {
    var filename = '/share/db_server/' + req.params.filename;

    // /share/db_server
    console.log('read file: ' + filename);
    fs.readFile(filename, "binary", function(err, file) {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end();
        } else {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(file, "binary");
            res.end();
        }
    });
});

module.exports = api;
