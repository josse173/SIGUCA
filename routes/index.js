
/*
 * GET home page.
 * Aqui deben crear un exports para cada página que llamen desde el router, pueden agregar los datos dinámicos a través de objetos JS
  y pasarlos a la vista con res.render('<vista>', <objeto>)
 */
var mongoose    = require('mongoose');
require('../models/roles');
require('../models/Empleado');
var dbRol = mongoose.model('Rol');
var Empleado = mongoose.model('Empleado');
var AM = require('../models/cuentas-admin');
var passport    = require('passport');

module.exports = function(app) {

	app.get('/', function(req, res){
		res.render('index', { user : req.user });
	});
	 app.post('/', passport.authenticate('local'), function(req, res) {
        res.redirect('/');
    });
	app.get('/register', function(req, res) {
      res.render('register', { });
  	});

  	app.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
          res.redirect('/');
        });
    });
  });

	app.get('/escritorio', function(req, res){
		res.render('escritorio', {title: 'Supervisor escritorio | SIGUCA'});
	});
	app.get('/escritorioEmpl', function(req, res){
		res.render('escritorioEmpl', {title: 'Empleado escritorio | SIGUCA'});
	});
	app.get('/graficos', function(req, res){
		res.render('graficos', {title: 'Graficos | SIGUCA'});
	});
	app.get('/graficoAdmin', function(req, res){
		res.render('graficoAdmin', {title: 'Graficos Administrador | SIGUCA'});
	});
	app.get('/ayuda', function(req, res){
		res.render('ayuda', {title: 'Ayuda | SIGUCA'});
	});
	app.get('/configuracion', function(req, res){
		res.render('configuracion',{title: 'Configuración | SIGUCA'});
	});
	app.get('/confAdmin', function(req, res){
		res.render('confAdmin',{title: 'Configuración Administrador| SIGUCA'});
	});
	app.get('/justificaciones', function(req, res){
		res.render('justificaciones', {title: 'Justificaciones/Permisos | SIGUCA'});
	});
	app.get('/justEmpl', function(req, res){
		res.render('justEmpl', {title: 'Solicitudes/Justificaciones | SIGUCA'});
	});
	app.get('/justificacion_nueva', function(req, res){
		res.render('justificacion_nueva', {title: 'Nueva Justificacion | SIGUCA'});
	});
	app.get('/solicitud_extra', function(req, res){
		res.render('solicitud_extra', {title: 'Solicitud Tiempo Extra | SIGUCA'});
	});
	app.get('/autoriza_extra', function(req, res){
		res.render('autoriza_extra', {title: 'Autorizacion Tiempo Extra | SIGUCA'});
	});
	app.get('/autoriza_justificacion', function(req, res){
		res.render('autoriza_justificacion', {title: 'Autorizacion Justificacion | SIGUCA'});
	});
	app.get('/roles', function(req, res){
		res.render('roles', {title: 'SIGUCA - Administración de Roles', rol: req.rol, nombre: req.nombre});
	});
	app.post('/roles', function(req, res){
		console.log('Recibimos rol:'+req.body.rol+' y nombre:'+req.body.nombre);
		var newRol = new dbRol (req.body)
		newRol.save(function(err){
			if (err) {
				return res.render('roles', {
					errors: utils.errors(err.errors),
					rol: rol,
					nombre: nombre,
					title: 'SIGUCA - Administración de Roles - Intente nuevamente'
				});
			};
		});
		res.redirect('/');
	});
	app.get('/dispositivos', function(req, res){
		res.render('dispositivos', {title: 'Dispositivos | SIGUCA'});
	});

	

};


// Crea nuevo Empleado
exports.crea = function(req, res) {
	var empleado = new Empleado(req.body);
	empleado.save(function (err) {
		if (err) {
			return res.render('empleado', {
				errors: utils.errors(err.errors),
				empleado: empleado,
				title: 'Intente el registro de nuevo'
			})
		}
		return res.redirect('/')
	});				
}


								
exports.registra = function (req, res) {
  res.render('empleado', {
    title: 'SIGUCA - Administración de Empleados',
    empleado: new Empleado()
  })
}


// Busca Empleado por Cédula
exports.buscaPorCedula = (function(req, res) {
	Empleado.findOne({cedula: req.params.cedula});
});

// Lista a todos los Empleados
exports.lista = function(req, res) {
	Empleado.find(function(err, empleados) {
		res.send(empleados);
	});
}
exports.indexAng = function (req, res){
  return Empleado.find(function (err, contacts) {
    if (!err) {
      res.jsonp(contacts);    } else {
      console.log(err);
    }
  });
}