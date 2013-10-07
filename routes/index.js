
/*
 * GET home page.
 * Aqui deben crear un exports para cada página que llamen desde el router, pueden agregar los datos dinámicos a través de objetos JS
  y pasarlos a la vista con res.render('<vista>', <objeto>)
 */

exports.index = function(req, res){
  res.render('index', { title: 'SIGUCA' });
};

exports.roles = function(req, res){
	res.render('roles', {title: 'SIGUCA - Administración de Roles', rol: req.rol, nombre: req.nombre})
}
exports.ingresado = function(req, res){
	res.render('ingresado', {title: 'Usuario Ingresado'})
}
exports.graficos = function(req, res){
	res.render('graficos', {title: 'Graficos'})
}
exports.acciones = function(req, res){
	res.render('acciones', {title: 'Justificaciones/Permisos'})
}


