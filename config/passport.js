/**
* Dependencias del módulo
*/

var mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , Usuario = mongoose.model('Usuario')


module.exports = function (passport, config) {
  // require('./initializer')

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
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      Usuario.findOne({ email: email }, function (err, user) {
        if (err) { return done(err) }
        if (!user) {
          return done(null, false, { message: 'Usuario desconocido.' })
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Contraseña inválida.' })
        }
        return done(null, user)
      })
    }
  )) 
}