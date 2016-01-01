/**
 * Created by missionhealth on 15/10/22.
 */

// 存储设备发送过来的数据
var settings = require('./db_settings');
var MongoClient = require('mongodb').MongoClient;

var device_node = 'device_node';

function device_node_save(data, callback) {
    MongoClient.connect('mongodb://localhost:27017/' + settings.db, function(err, db) {
        if (err) {
            console.log('mongodb err ' + err + ' -> data: ' + data);
            return;
        }

        var col = db.collection(device_node);
        col.insertOne(data, function(err, r) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, r);
            db.close();
        });
    });
}

// {nameName: bruce, deviceToken: devicetoken}
function updateUserDeviceToken(user, callback) {
    MongoClient.connect('mongodb://localhost:27017/' + settings.db, function(err, db) {
        if (err) {
            console.log('mongodb err ' + err);
            callback(err);
            return;
        }
        
        db.collection('user').updateOne(
            {"userName": user.userName},
            {
                "$set": {"iosDeviceToken":user.deviceToken}
            }, function(err2, results) {
                callback(err2, results);
                db.close();
            });
    });
}

// 获取数据库中存储的最新记录
function get_device_node(device_id, callback) {
    MongoClient.connect('mongodb://localhost:27017/' + settings.db, function(err, db) {

        var collection = db.collection(device_node);

        collection.find({'sensor_data.device_id': '' + device_id}, {"_id":0})
            .sort({'recv_time':-1})
            .limit(1)
            .toArray(function(err, docs) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, docs);
            db.close();
        });
    });
}

// 获取设备的历史记录
// {device_id, records}
function get_device_history(device, callback) {
    MongoClient.connect('mongodb://localhost:27017/' + settings.db, function(err, db) {

        var collection = db.collection(device_node);
        // 默认取100条数据
        var records = device.records ? device.records : 100;

        collection.find({'sensor_data.device_id': '' + device.device_id}, {"_id":0})
            .sort({'recv_time':1})
            .limit(records)
            .toArray(function(err, docs) {
                if (err) {
                    callback(err);
                    return;
                }

                callback(null, docs);
                db.close();
            });
    });
}

exports.get = get_device_node;
exports.save = device_node_save;
exports.history = get_device_history;
exports.updateUserDeviceToken = updateUserDeviceToken;
