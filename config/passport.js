/**
* Dependencias del módulo
*/

var mongoose = require('mongoose'),
    LocalStrategy = require('passport-local').Strategy,
    Usuario = require('../models/Usuario');

module.exports = function (passport, config) {

  // Serializa sesiones
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    Usuario.findOne({ _id: id }, function (err, user) {
      done(err, user)
    })
  })

  // Estrategia local
  passport.use('login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
      console.log(username + "," + password);
      Usuario.findOne({ 'username': username }, function (err, user) {
        if (err) { return done(err) }
        console.log(user);
        if (!user) {
          return done(null, false, { message: 'Usuario desconocido.' })
        }
        if (!user.validPassword(password)) {
          console.log("Contraseña inválida " + password);
          return done(null, false, { message: 'Contraseña inválida.' })
        }
        return done(null, user)
      });//Usuario
    }));//Estrategia 

  passport.use('signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        process.nextTick(function() {
          console.log(username + "," + password);
          Usuario.findOne({ 'username' :  username }, function(err, user) {
              if (err)
                  return done(err);
              if (user) {
                  return done(null, false, { message: 'That username is already taken.'});
              } else {
                  var newUser = new Usuario();
                  newUser.username = username;
                  newUser.password = Usuario.generateHash(password);

                  console.log(newUser);
                  newUser.save(function(err) {
                      if (err)
                          throw err;
                      console.log("listo");
                      return done(null, newUser);
                  });
              }
          });//User    
        });//nextTick
    })); //Strategy
};