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

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function(fmt)
{ //author: meizz
  var o = {
    "M+" : this.getMonth()+1,                 //月份
    "d+" : this.getDate(),                    //日
    "h+" : this.getHours(),                   //小时
    "m+" : this.getMinutes(),                 //分
    "s+" : this.getSeconds(),                 //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S"  : this.getMilliseconds()             //毫秒
  };
  if(/(y+)/.test(fmt))
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)
    if(new RegExp("("+ k +")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
  return fmt;
};

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
          var last_report = db_docs[0].recv_time;
          sensors_value.inside_pm1_0 = sensor.pm1_0;
          sensors_value.inside_pm2_5 = sensor.pm2_5;
          sensors_value.inside_pm10 = sensor.pm10;
          sensors_value.inside_last_report = new Date(last_report).Format("yyyy-MM-dd hh:mm:ss");
          sensors_value.inside_temp = sensor.temp;

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
          var last_report = db_docs[0].recv_time;
          sensors_value.outside_pm1_0 = sensor.pm1_0;
          sensors_value.outside_pm2_5 = sensor.pm2_5;
          sensors_value.outside_pm10 = sensor.pm10;
          sensors_value.outside_temp = sensor.temp;
          sensors_value.outside_last_report = new Date(last_report).Format("yyyy-MM-dd hh:mm:ss");
          
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
