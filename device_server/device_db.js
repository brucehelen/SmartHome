/**
 * Created by missionhealth on 15/10/22.
 */


// 存储设备发送过来的数据
var settings = require('./db_settings');
var Db = require('mongodb').Db;
var server = require('mongodb').Server;

var mongodb = new Db(
    settings.db,
    new server(settings.host, settings.port),
    {safe: true});

function device(data) {
    this.ipaddress = data.ipaddress;    // 接收设备的IP地址
    this.recvtime = data.recvtime;      // 接收到数据的时间
    this.sensor = data.sensor;          // 真正的传感器数据
}

module.exports = device;

device.prototype.save = function(callback) {
    var device = {
        ipaddress: this.ipaddress,
        recvtime: this.recvtime,
        sensor: this.sensor
    };

    // 打开数据库
    mongodb.open(function(err, db) {
        if (err) return callback(err);

        // 读取device集合
        db.collection('device', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            //将用户信息插入device集合
            collection.insert(device, {safe: true}, function(err) {
                mongodb.close();
                if (err) return callback(err);
                callback(null);
            });
        });
    });
};


device.get = function(name, callback) {
    mongodb.open(function(err, db) {
        if (err) return callback(err);

        // 读取device集合
        db.collection('device', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.findOne({}, function(err, devices) {
                mongodb.close();
                if (err) return callback(err);
                callback(null, devices);
            });
        });
    });
};

