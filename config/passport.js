// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GitHubStrategy = require('passport-github').Strategy;

// load up the user model
var User = require('../models/user');

// load the auth variables
var configAuth = require('./auth')

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-signup', new LocalStrategy({

        // pull in our app id and secret from our auth.js file
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },

    // facebook will send back the token and profile
    function(req, email, password, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                // find the user in the database based on their facebook id
                User.findOne({ 'local.email' :  email }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser            = new User();

                        // set all of the facebook information in our user model
                        newUser.local.email     = email;
                        newUser.local.name      = req.body.fullname;
                        newUser.local.password  = newUser.generateHash(password);

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }

                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session

                // update the current users facebook credentials
                user.local.email    = email;
                user.local.username = fullname;
                user.local.password = user.generateHash(password);
                // save the user
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }

        });

    }));





      // =========================================================================
      // LOCAL LOGIN =============================================================
      // =========================================================================
      // we are using named strategies since we have one for login and one for signup
      // by default, if there was no name, it would just be called 'local'

      passport.use('local-login', new LocalStrategy({
          // by default, local strategy uses username and password, we will override with email
          usernameField : 'email',
          passwordField : 'password',
          passReqToCallback : true // allows us to pass back the entire request to the callback
      },
      function(req, email, password, done) { // callback with email and password from our form

          // find a user whose email is the same as the forms email
          // we are checking to see if the user trying to login already exists
          User.findOne({ 'local.email' :  email }, function(err, user) {
              // if there are any errors, return the error before anything else
              if (err)
                  return done(err);

                  // if no user is found, return the message
                  if (!user)
                  return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                  // if the user is found but the password is wrong
                  if (!user.validPassword(password))
                  return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                  // all is well, return successful user
                  return done(null, user);
            });
        }));





      // =========================================================================
      // FACEBOOK ================================================================
      // =========================================================================
      passport.use(new FacebookStrategy({

          // pull in our app id and secret from our auth.js file
          clientID        : configAuth.facebookAuth.clientID,
          clientSecret    : configAuth.facebookAuth.clientSecret,
          callbackURL     : configAuth.facebookAuth.callbackURL,
          passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

      },

      // facebook will send back the token and profile
      function(req, token, refreshToken, profile, done) {

          // asynchronous
          process.nextTick(function() {

              // check if the user is already logged in
              if (!req.user) {

                  // find the user in the database based on their facebook id
                  User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                      // if there is an error, stop everything and return that
                      // ie an error connecting to the database
                      if (err)
                          return done(err);

                      // if the user is found, then log them in
                      if (user) {

                          // if there is a user id already but no token (user was linked at one point and then removed)
                          // just add our token and profile information
                          if (!user.facebook.token) {
                              user.facebook.id    = profile.id; // set the users facebook id
                              user.facebook.token = token;
                              user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                              user.facebook.email = profile.emails;

                              user.save(function(err) {
                                  if (err)
                                      throw err;
                                  return done(null, user);
                              });
                          }

                          return done(null, user); // user found, return that user
                      } else {
                          // if there is no user found with that facebook id, create them
                          var newUser            = new User();

                          // set all of the facebook information in our user model
                          newUser.facebook.id    = profile.id; // set the users facebook id
                          newUser.facebook.token = token; // we will save the token that facebook provides to the user
                          newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                          // newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                          // save our user to the database
                          newUser.save(function(err) {
                              if (err)
                                  throw err;

                              // if successful, return the new user
                              return done(null, newUser);
                          });
                      }

                  });

              } else {
                  // user already exists and is logged in, we have to link accounts
                  var user            = req.user; // pull the user out of the session

                  // update the current users facebook credentials
                  user.facebook.id    = profile.id;
                  user.facebook.token = token;
                  user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                  // user.facebook.email = profile.emails[0].value;

                  // save the user
                  user.save(function(err) {
                      if (err)
                          throw err;
                      return done(null, user);
                  });
              }

          });

      }));





      // =========================================================================
      // Google ================================================================
      // =========================================================================
      passport.use(new GoogleStrategy({

          // pull in our app id and secret from our auth.js file
          clientID        : configAuth.googleAuth.clientID,
          clientSecret    : configAuth.googleAuth.clientSecret,
          callbackURL     : configAuth.googleAuth.callbackURL,
          passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

      },

      // facebook will send back the token and profile
      function(req, token, refreshToken, profile, done) {

          // asynchronous
          process.nextTick(function() {

              // check if the user is already logged in
              if (!req.user) {

                  // find the user in the database based on their facebook id
                  User.findOne({ 'google.id' : profile.id }, function(err, user) {

                      // if there is an error, stop everything and return that
                      // ie an error connecting to the database
                      if (err)
                          return done(err);

                      // if the user is found, then log them in
                      if (user) {

                          // if there is a user id already but no token (user was linked at one point and then removed)
                          // just add our token and profile information
                          if (!user.google.token) {
                              user.google.id    = profile.id;
                              user.google.token = token;
                              user.google.name  = profile.displayName;
                              user.google.email = profile.emails[0].value;

                              user.save(function(err) {
                                  if (err)
                                      throw err;
                                  return done(null, user);
                              });
                          }

                          return done(null, user); // user found, return that user
                      } else {
                          // if there is no user found with that facebook id, create them
                          var newUser            = new User();

                          // set all of the facebook information in our user model
                          newUser.google.id    = profile.id; // set the users facebook id
                          newUser.google.token = token; // we will save the token that facebook provides to the user
                          newUser.google.name  = profile.displayName;// look at the passport user profile to see how names are returned
                          newUser.google.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                          // save our user to the database
                          newUser.save(function(err) {
                              if (err)
                                  throw err;

                              // if successful, return the new user
                              return done(null, newUser);
                          });
                      }

                  });

              } else {
                  // user already exists and is logged in, we have to link accounts
                  var user            = req.user; // pull the user out of the session

                  // update the current users facebook credentials
                  user.google.id    = profile.id;
                  user.google.token = token;
                  user.google.name  = profile.displayName;
                  user.google.email = profile.emails[0].value;

                  // save the user
                  user.save(function(err) {
                      if (err)
                          throw err;
                      return done(null, user);
                  });
              }

          });

      }));




      // =========================================================================
      // GitHub ================================================================
      // =========================================================================
      passport.use(new GitHubStrategy({

          // pull in our app id and secret from our auth.js file
          clientID        : configAuth.githubAuth.clientID,
          clientSecret    : configAuth.githubAuth.clientSecret,
          callbackURL     : configAuth.githubAuth.callbackURL,
          passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

      },

      // facebook will send back the token and profile
      function(req, accessToken, refreshToken, profile, done) {

          // asynchronous
          process.nextTick(function() {

              // check if the user is already logged in
              if (!req.user) {

                  // find the user in the database based on their facebook id
                  User.findOne({ 'githubId' : profile.id }, function(err, user) {

                      // if there is an error, stop everything and return that
                      // ie an error connecting to the database
                      if (err)
                          return done(err);

                      // if the user is found, then log them in
                      if (user) {

                          // if there is a user id already but no token (user was linked at one point and then removed)
                          // just add our token and profile information
                          if (!user.github.token) {
                              user.github.id    = profile.id; // set the users facebook id
                              user.github.token = accessToken;
                              user.github.name  = profile.name;
                              user.github.email = profile.emails[0].value;

                              user.save(function(err) {
                                  if (err)
                                      throw err;
                                  return done(null, user);
                              });
                          }

                          return done(null, user); // user found, return that user
                      } else {
                          // if there is no user found with that facebook id, create them
                          var newUser            = new User();

                          // set all of the facebook information in our user model
                          newUser.github.id    = profile.id; // set the users facebook id
                          newUser.github.token = accessToken; // we will save the token that facebook provides to the user
                          newUser.github.name  = profile.name; // look at the passport user profile to see how names are returned
                          newUser.github.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                          // save our user to the database
                          newUser.save(function(err) {
                              if (err)
                                  throw err;

                              // if successful, return the new user
                              return done(null, newUser);
                          });
                      }

                  });

              } else {
                  // user already exists and is logged in, we have to link accounts
                  var user            = req.user; // pull the user out of the session

                  // update the current users facebook credentials
                  user.github.id    = profile.id;
                  user.github.token = accessToken;
                  user.github.name  = profile.name;
                  user.github.email = profile.emails[0].value;

                  // save the user
                  user.save(function(err) {
                      if (err)
                          throw err;
                      return done(null, user);
                  });
              }

          });

      }));
  };
