
/*
 * GET home page.
 * Aqui deben crear un exports para cada página que llamen desde el router, pueden agregar los datos dinámicos a través de objetos JS y pasarlos a la vista con res.render('<vista>', <objeto>)
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.roles = function(req, res){
	res.render('roles', {title: 'SIGUCA - Administración de Roles', rol: req.rol, nombre: req.nombre})
}

