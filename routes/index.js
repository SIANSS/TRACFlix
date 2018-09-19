var express = require('express');
var router = express.Router();

router.get('/', (req, res)=>{
  res.render('index');
});

router.get('/add', (req, res)=>{
  res.render('add');
});

router.get('/login', (req, res)=>{
  res.render('login');
});

router.get('/signup', (req, res)=>{
  res.render('signup');
});

router.get('/desc', (req, res)=>{
  res.render('description');
})

module.exports = router;
