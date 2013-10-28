/** SIGUCA  
 *
 *		API del Usuario
 *				registro - Registra nuevo Usuario.
 *				login - Ingresa Usuario al sistema.
 *				logout - Sale del sistema.
 *				sesion - Inicia la Sesión del Usuario.
 *				crea - Crea al Usuario, lo guarda en la BD y lo loguea.
 *				mostrar - Muestra los atributos del Usuario.
 *				usuario - Busca al Usuario con el ID determinado.
 *
**/

var mongoose = require('mongoose')
  , Usuario = mongoose.model('Usuario')

var login = function (req, res) {
  if (req.session.returnTo) {
    res.redirect(req.session.returnTo)
    delete req.session.returnTo
    return
  }
  res.redirect('/')
}

exports.signin = function (req, res) {}

/**
* Callback de Autorización
*/

exports.authCallback = login

/**
* Muestra Login
*/

exports.login = function (req, res) {
  res.render('usuario/login', {
    title: 'Login',
    message: req.flash('error')
  })
}

/**
* Muestra formulario de Registro
*/

exports.registro = function (req, res) {
  res.render('usuario/registro', {
    title: 'Registro',
    user: new Usuario()
  })
}

/**
* Logout
*/

exports.logout = function (req, res) {
  req.logout()
  res.redirect('/')
}

/**
* Sesión
*/

exports.sesion = login

/**
* Crea usuario
*/

exports.crea = function (req, res) {
  var usuario = new Usuario(req.body)
  usuario.save(function (err) {
    if (err) {
      return res.render('usuario/registro', {
        user: usuario,
        title: 'Registro'
      })
    }

    // Login manual del usuario una vez que se haya registrado.
    req.logIn(usuario, function(err) {
      if (err) return next(err)
      return res.redirect('/')
    })
  })
}

/**
* Muestra perfil
*/

exports.mostrar = function (req, res) {
  var usuario = req.profile
  res.render('usuario/mostrar', {
    title: Usuario.nombre,
    user: usuario
  })
}

/**
* Busca Usuario por ID
*/

exports.usuario = function (req, res, next, id) {
  Usuario
    .findOne({ _id : id })
    .exec(function (err, usuario) {
      if (err) return next(err)
      if (!usuario) return next(new Error('Fallo al cargar el Usuario: ' + id))
      req.profile = usuario
      next()
    })
}