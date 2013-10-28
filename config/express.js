/**
* Dependencias del módulo
*/

var express = require('express')
  , mongoStore = require('connect-mongo')(express) // https://github.com/kcbanner/connect-mongo
  , flash = require('connect-flash') // https://github.com/jaredhanson/connect-flash
  , helpers = require('view-helpers') // https://github.com/madhums/node-view-helpers
  , pkg = require('../package.json')

module.exports = function (app, config, passport) {

  app.set('showStackError', true)

  // Tiene que presentarse antes de express.static
  app.use(express.compress({
    filter: function (req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
    },
    level: 9
  }))

  app.use(express.favicon())
  app.use(express.static(config.root + '/public'))

  // No usar el logger para ambiente de pruebas
  if (process.env.NODE_ENV !== 'test') {
    app.use(express.logger('dev'))
  }

  // Se declara la ruta de Views y su respectivo motor de plantillas (Jade)
  app.set('views', config.root + '/views')
  app.set('view engine', 'jade')

  app.configure(function () {
    // Expone a package.json a las Vistas.
    app.use(function (req, res, next) {
      res.locals.pkg = pkg
      next()
    })

    // cookieParser tiene que estar antes que la Sesión
    app.use(express.cookieParser())

    // bodyParser stiene que estar antes de methodOverride
    app.use(express.bodyParser())
    app.use(express.methodOverride())

    // express/mongo repositorio de sesión
    app.use(express.session({
      secret: 'noobjs',
      store: new mongoStore({
        url: config.db,
        collection : 'sessions'
      })
    }))

    // Usa la sesión de Passport
    app.use(passport.initialize())
    app.use(passport.session())

    // Conecta Flash para los mensajes - tiene que ser declarado despúes de las Sesiones.
    app.use(flash())

    // Tiene que ser declarado despúes de las Sesiones y del Flash.
    app.use(helpers(pkg.name))

    // Soporte a CSRF: http://es.wikipedia.org/wiki/Cross_Site_Request_Forgery
    if (process.env.NODE_ENV !== 'test') {
      app.use(express.csrf())

    // Las rutas deben de ser lo último
    app.use(app.router)

    app.use(function(err, req, res, next){
      // Se maneja como 404
      if (err.message
        && (~err.message.indexOf('not found')
        || (~err.message.indexOf('Cast to ObjectId failed')))) {
        return next()
      }

      // Muestra mensaje de error.
      console.error(err.stack)

      // Error de servidor.
      res.status(500).render('500', { error: err.stack })
    })

    // Muestra un 404 si el Middleware no responde.
    app.use(function(req, res, next){
      res.status(404).render('404', {
        url: req.originalUrl,
        error: 'Not found'
      })
    })
  })

  // development env config
  app.configure('development', function () {
    app.locals.pretty = true
  })
}