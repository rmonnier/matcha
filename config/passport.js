// config/passport.js

var LocalStrategy   = require('passport-local').Strategy;
var User            = require('../app/models/user');

module.exports = function(passport) {


    // passport session setup ==================================================

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



    passport.use('local-signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback : true
    },
      function(req, username, password, done) {

          // asynchronous
          // User.findOne wont fire unless data is sent back
          process.nextTick(function() {
            User.findOne({ 'username' :  username }, function(err, user) {
              if (err) { return done(err); }
              if (user) { return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
              }
              var newUser = new User();
              newUser.username = username;
              newUser.local.password = newUser.generateHash(password);
              newUser.save(function(err) {
                if (err) { throw err; }
                return done(null, newUser);
              });
            })
          });
      }
    ));

    passport.use('local-signin', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback : true
      },
      function(req, username, password, done) {
        User.findOne({ 'username': username }, function(err, user) {
          if (err) { return done(err); }
          if (!user) {
            return done(null, false, req.flash('signinMessage', 'Incorrect username.'))
          }
          if (!user.validPassword(password)) {
            return done(null, false, req.flash('signinMessage', 'Incorrect password.'))
          }
          return done(null, user);
        });
      }
    ));

};
