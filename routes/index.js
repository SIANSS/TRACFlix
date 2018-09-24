var Show = require('../models/show');
module.exports = (app, passport) =>{


  app.get('/', (req, res)=>{
    res.render('index', { user : req.user});
  })

  app.get('/add', isLoggedIn, (req, res)=>{
    res.render('add', {user : req.user});
  });

  app.get('/login', (req, res)=>{
    res.render('login');
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/add', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get('/signup', (req, res)=>{
    res.render('signup');
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/add', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get('/desc', (req, res)=>{
    res.render('description');
  })

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
  });

  // facebook -------------------------------

  // send to facebook to do the authentication
  app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

  // handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect : '/',
    failureRedirect : '/login'
  }));

  // google ---------------------------------

  // send to google to do the authentication
  app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

  // the callback after google has authenticated the user
  app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect : '/',
    failureRedirect : '/login'
  }));

  // =============================================================================
  // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
  // =============================================================================

  // // locally --------------------------------
  // app.get('/connect/local', function(req, res) {
  //   res.render('connect-local.ejs', { message: req.flash('loginMessage') });
  // });
  // app.post('/connect/local', passport.authenticate('local-signup', {
  //   successRedirect : '/profile', // redirect to the secure profile section
  //   failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
  //   failureFlash : true // allow flash messages
  // }));
  //
  // facebook -------------------------------

  // send to facebook to do the authentication
  app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

  // handle the callback after facebook has authorized the user
  app.get('/connect/facebook/callback',
  passport.authorize('facebook', {
    successRedirect : '/profile',
    failureRedirect : '/'
  }));

  // github --------------------------------

  // send to github to do the authentication
  app.get('/connect/github', passport.authorize('github', { scope : 'email' }));

  // handle the callback after github has authorized the user
  app.get('/connect/github/callback',
  passport.authorize('github', {
    successRedirect : '/profile',
    failureRedirect : '/'
  }));


  // google ---------------------------------

  // send to google to do the authentication
  app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

  // the callback after google has authorized the user
  app.get('/connect/google/callback',
  passport.authorize('google', {
    successRedirect : '/profile',
    failureRedirect : '/'
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', function(req, res) {
    var user            = req.user;
    user.local.email    = undefined;
    user.local.password = undefined;
    user.save(function(err) {
      res.redirect('/');
    });
  });

  // facebook -------------------------------
  app.get('/unlink/facebook', function(req, res) {
    var user            = req.user;
    user.facebook.token = undefined;
    user.save(function(err) {
      res.redirect('/');
    });
  });

  // github --------------------------------
  app.get('/unlink/github', function(req, res) {
    var user           = req.user;
    user.github.token = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

  // google ---------------------------------
  app.get('/unlink/google', function(req, res) {
    var user          = req.user;
    user.google.token = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });


};

function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
  return next();

  // if they aren't redirect them to the home page
  res.redirect('/login');
}
