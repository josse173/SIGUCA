
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


exports.index = function(req, res){
  res.render('index', { title: 'SIGUCA' });
};
exports.roles = function(req, res){
	res.render('roles', {title: 'SIGUCA - Administración de Roles', rol: req.rol, nombre: req.nombre});
};
exports.escritorio = function(req, res){
	res.render('escritorio', {title: 'Usuario escritorio | SIGUCA'});
};
exports.graficos = function(req, res){
	res.render('graficos', {title: 'Graficos | SIGUCA'});
};
exports.ayuda = function(req, res){
	res.render('ayuda', {title: 'Ayuda | SIGUCA'});
};
exports.configuracion = function(req, res){
	res.render('configuracion',{title: 'Configuración | SIGUCA'});
};
exports.justificaciones = function(req, res){
	res.render('justificaciones', {title: 'Justificaciones/Permisos | SIGUCA'});
};
exports.justificacion_nueva = function(req, res){
	res.render('justificacion_nueva', {title: 'Nueva Justificacion | SIGUCA'});
};
exports.solicitud_extra = function(req, res){
	res.render('solicitud_extra', {title: 'Solicitud Tiempo Extra | SIGUCA'});
};
exports.rolesPost = function(req, res){
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