
/*
 * GET home page.
 * Aqui deben crear un exports para cada página que llamen desde el router, pueden agregar los datos dinámicos a través de objetos JS
  y pasarlos a la vista con res.render('<vista>', <objeto>)
 */

var mongoose    = require('mongoose');
require('../models/roles');
var dbRol = mongoose.model('Rol');

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