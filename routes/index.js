var express = require('express');
var router = express.Router();
var async = require('async');
var db = require('../device_server/device_db');

/* GET home page. */
router.get('/', function(req, res, next) {
  for (var connect_device in global.online_device) {
    console.log('connect_device[%s]=%s', connect_device, global.online_device[connect_device]);
  }

  res.render('index', { title: 'Express' });
});

router.get('/home', function(req, res, next) {
  res.render('home', {});
});

router.get('/register', function(req, res, next) {
  res.render('register', {});
});

// 数据展示页面
router.get('/show', function(req, res, next) {
  var sensors_value = {};
  async.series({
    g3_001: function(callback) {
      // 读取室内G3传感器最新数据
      db.get('G3-001', function(err, db_docs) {
        if (err) {
          console.error('db read error ' + err);
          callback(err);
        }

        if (db_docs.length !== 0) {
          var sensor = db_docs[0].sensor_data.sensor;
          for (var i = 0; i < sensor.length; i++) {
            var sensor_value = sensor[i];
            if (sensor_value.type === 3) {
              sensors_value.inside_pm1_0 = sensor_value.value.pm1_0;
              sensors_value.inside_pm2_5 = sensor_value.value.pm2_5;
              sensors_value.inside_pm10 = sensor_value.value.pm10;
            }

            if (sensor_value.type === 1) {
              sensors_value.inside_temp = sensor_value.value;
            }
          }
          callback(null, sensors_value);
        } else {
          callback('G3-001 no records');
        }
      });
    },
    g3_002: function(callback) {
      // 读取室外G3传感器最新数据
      db.get('G3-002', function(err, db_docs) {
        if (err) {
          console.error('db read error ' + err);
          callback(err);
        }

        if (db_docs.length !== 0) {
          var sensor = db_docs[0].sensor_data.sensor;
          for (var i = 0; i < sensor.length; i++) {
            var sensor_value = sensor[i];
            if (sensor_value.type === 3) {
              sensors_value.outside_pm1_0 = sensor_value.value.pm1_0;
              sensors_value.outside_pm2_5 = sensor_value.value.pm2_5;
              sensors_value.outside_pm10 = sensor_value.value.pm10;
            }

            if (sensor_value.type === 1) {
              sensors_value.outside_temp = sensor_value.value;
            }
          }
          callback(null, sensors_value);
        } else {
          callback('G3-002 no records');
        }
      });
    }
  }, function(err, results) {
    if (err) {
      console.log(err);
    } else {
      res.render('show', sensors_value);
    }
  });

});

module.exports = router;
