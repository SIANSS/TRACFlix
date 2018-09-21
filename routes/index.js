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

  // // github --------------------------------
  //
  // // send to github to do the authentication
  // app.get('/auth/github', passport.authenticate('github', { scope : 'email' }));
  //
  // // handle the callback after github has authenticated the user
  // app.get('/auth/github/callback',
  // passport.authenticate('github', {
  //   successRedirect : '/profile',
  //   failureRedirect : '/'
  // }));


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

  app.get('/api/users', function(req, res, next) {
    if (!req.query.email) {
      return res.send(400, { message: 'Email parameter is required.' });
    }

    User.findOne({ email: req.query.email }, function(err, user) {
      if (err) return next(err);
      res.send({ available: !user });
    });
  });

  app.get('/api/shows', function(req, res, next) {
    var query = Show.find();
    if (req.query.genre) {
      query.where({ genre: req.query.genre });
    } else if (req.query.alphabet) {
      query.where({ name: new RegExp('^' + '[' + req.query.alphabet + ']', 'i') });
    } else {
      query.limit(12);
    }
    query.exec(function(err, shows) {
      if (err) return next(err);
      res.send(shows);
    });
  });

  app.get('/api/shows/:id', function(req, res, next) {
    Show.findById(req.params.id, function(err, show) {
      if (err) return next(err);
      res.send(show);
    });
  });

  app.post('/api/shows', function (req, res, next) {
    var seriesName = req.body.showName
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/[^\w-]+/g, '');
    var apiKey = '9EF1D1E7D28FDA0B';
    var parser = xml2js.Parser({
      explicitArray: false,
      normalizeTags: true
    });

    async.waterfall([
      function (callback) {
        request.get('http://thetvdb.com/api/GetSeries.php?seriesname=' + seriesName, function (error, response, body) {
          if (error) return next(error);
          parser.parseString(body, function (err, result) {
            if (!result.data.series) {
              return res.send(400, { message: req.body.showName + ' was not found.' });
            }
            var seriesId = result.data.series.seriesid || result.data.series[0].seriesid;
            callback(err, seriesId);
          });
        });
      },
      function (seriesId, callback) {
        request.get('http://thetvdb.com/api/' + apiKey + '/series/' + seriesId + '/all/en.xml', function (error, response, body) {
          if (error) return next(error);
          parser.parseString(body, function (err, result) {
            var series = result.data.series;
            var episodes = result.data.episode;
            var show = new Show({
              _id: series.id,
              name: series.seriesname,
              airsDayOfWeek: series.airs_dayofweek,
              airsTime: series.airs_time,
              firstAired: series.firstaired,
              genre: series.genre.split('|').filter(Boolean),
              network: series.network,
              overview: series.overview,
              rating: series.rating,
              ratingCount: series.ratingcount,
              runtime: series.runtime,
              status: series.status,
              poster: series.poster,
              episodes: []
            });
            _.each(episodes, function (episode) {
              show.episodes.push({
                season: episode.seasonnumber,
                episodeNumber: episode.episodenumber,
                episodeName: episode.episodename,
                firstAired: episode.firstaired,
                overview: episode.overview
              });
            });
            callback(err, show);
          });
        });
      },
      function (show, callback) {
        var url = 'http://thetvdb.com/banners/' + show.poster;
        request({ url: url, encoding: null }, function (error, response, body) {
          show.poster = 'data:' + response.headers['content-type'] + ';base64,' + body.toString('base64');
          callback(error, show);
        });
      }
    ], function (err, show) {
      if (err) return next(err);
      show.save(function (err) {
        if (err) {
          if (err.code == 11000) {
            return res.send(409, { message: show.name + ' already exists.' });
          }
          return next(err);
        }
        var alertDate = Sugar.Date.create('Next ' + show.airsDayOfWeek + ' at ' + show.airsTime).rewind({ hour: 2});
        agenda.schedule(alertDate, 'send email alert', show.name).repeatEvery('1 week');
        res.send(200);
      });
    });
  });

  app.post('/api/subscribe', ensureAuthenticated, function(req, res, next) {
    Show.findById(req.body.showId, function(err, show) {
      if (err) return next(err);
      show.subscribers.push(req.user._id);
      show.save(function(err) {
        if (err) return next(err);
        res.send(200);
      });
    });
  });

  app.post('/api/unsubscribe', ensureAuthenticated, function(req, res, next) {
    Show.findById(req.body.showId, function(err, show) {
      if (err) return next(err);
      var index = show.subscribers.indexOf(req.user._id);
      show.subscribers.splice(index, 1);
      show.save(function(err) {
        if (err) return next(err);
        res.send(200);
      });
    });
  });

  app.get('*', function(req, res) {
    res.redirect('/#' + req.originalUrl);
  });
};

function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
  return next();

  // if they aren't redirect them to the home page
  res.redirect('/login');
}

// function ensureAuthenticated(req, res, next) {
//   if (req.headers.authorization) {
//     var token = req.headers.authorization.split(' ')[1];
//     try {
//       var decoded = jwt.decode(token, tokenSecret);
//       if (decoded.exp <= Date.now()) {
//         res.send(400, 'Access token has expired');
//       } else {
//         req.user = decoded.user;
//         return next();
//       }
//     } catch (err) {
//       return res.send(500, 'Error parsing token');
//     }
//   } else {
//     return res.send(401);
//   }
// }
