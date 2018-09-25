var express  = require('express');
var app      = express(); //instantiating
var path = require('path');
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var exphbs = require('express-handlebars');
const TVDB = require('node-tvdb');
var expressvalidator = require('express-validator');
var passport = require('passport');
var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var xml2js = require('xml2js');

var configDB = require('./config/database.js');
var routes = require('./routes/index');

mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({'defaultLayout':'layout'}));
app.set('view engine', 'handlebars');

app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'letsbreaksomecode' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(expressvalidator({
  errorFormatter: (param, msg, value) => {
    var namespace = param.split('.')
    , root      = namespace.shift()
    , formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(flash()); // use connect-flash for flash messages stored in session

app.use((req, res, next)=>{
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg  = req.flash('error_msg');
  res.locals.error      = req.flash('error');
  next();
});

require('./routes/')(app, passport); // load our routes and pass in our app and fully configured passport


app.listen(port);
console.log('The magic happens on port ' + port);
