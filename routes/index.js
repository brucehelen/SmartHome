var express = require('express');
var router = express.Router();

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

module.exports = router;
