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
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
