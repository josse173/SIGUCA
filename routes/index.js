
/*
 * GET home page.
 * Aqui deben crear un exports para cada página que llamen desde el router, pueden agregar los datos dinámicos a través de objetos JS
  y pasarlos a la vista con res.render('<vista>', <objeto>)
 */

exports.index = function(req, res){
  res.render('index', { title: 'SIGUCA' });
};
exports.roles = function(req, res){
	res.render('roles', {title: 'SIGUCA - Administración de Roles', rol: req.rol, nombre: req.nombre});
};
exports.escritorio = function(req, res){
	res.render('escritorio', {title: 'Usuario escritorio'});
};
exports.graficos = function(req, res){
<<<<<<< HEAD
	res.render('graficos', {title: 'Graficos'});
};
exports.ayuda = function(req, res){
	res.render('ayuda', {title: 'Ayuda'});
};
exports.configuracion = function(req, res){
	res.render('configuracion',{title: 'Configuración'});
};
=======
	res.render('graficos', {title: 'Graficos'})
}
exports.acciones = function(req, res){
	res.render('acciones', {title: 'Justificaciones/Permisos'})
}
>>>>>>> 087902f2688f71cae775522927ef91d7b09450e6


