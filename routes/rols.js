
var mongoose    = require('mongoose');
require('../models/roles');
var dbRol = mongoose.model('Rol');

exports.roles = function(req, res){
	res.render('roles', {title: 'SIGUCA - Administración de Roles', rol: req.rol, nombre: req.nombre});
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