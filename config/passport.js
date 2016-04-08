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

  // Estrategia para realizar acción de logueo
  passport.use('login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, username, password, done) {
	//Valida el usuario y la contraseña de logueo
      Usuario.findOne({ 'username': username }, function (err, user) {
        if (err) { return done(err) }
        if (!user) {
          return done(null, false, { message: 'Usuario desconocido.' })
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: 'Contraseña inválida.' })
        }
        return done(null, user)
      });
    }));

  // Estrategia para realizar acción de registro
  passport.use('signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, username, password, done) {
        process.nextTick(function() {
	//Valida que no exista otro usuario con el nombre de registro
	//y guarda el usuario nuevo si no existió ningún error
          Usuario.findOne({ 'username' :  username }, function(err, user) {
              if (err)
                  return done(err);
              if (user) {
                  return done(null, false, { message: 'That username is already taken.'});
              } else {
                  var newUser = new Usuario();
                  newUser.username = username;
                  newUser.password = Usuario.generateHash(password);

                  newUser.save(function(err) {
                      if (err)
                          throw err;
                      return done(null, newUser);
                  });
              }
          });   
        });
    })); 
};
