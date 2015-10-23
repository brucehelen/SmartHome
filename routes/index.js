var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  for (var connect_device in global.online_device) {
    console.log('connect_device[%s]=%s', connect_device, global.online_device[connect_device]);
  }

  res.render('index', { title: 'Express' });
});

module.exports = router;
