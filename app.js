
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

/** Leer la configuración de ./config/config **/
var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];
var mongoose = require('mongoose');

//Para conectarse a la base de datos indicada en config.db
mongoose.connect(config.db);

require('./models/roles');
var dbRol = mongoose.model('Rol'); //Con esto tenemos el modelo rol listo para ser guardado en mongo

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.locals.pretty = true;
  //app.configure('development', function () { app.locals.pretty = true; });
}

/** Agregar las rutas para cada página que se va a ofrecer, 
si la página envía datos de regreso al servirdor deben crear un app.post tambiém
**/

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/ingresado', routes.ingresado);
app.get('/graficos', routes.graficos);
app.get('/roles', routes.roles); //Llama la vista de roles a través de ./routes/index.js
app.post('/roles', function(req, res){
	console.log('Recibimos rol:'+req.body.rol+' y nombre:'+req.body.nombre);
	var newRol = new dbRol (req.body)
	newRol.save(function(err){
		if (err) {
			return res.render('roles', {
				errors: utils.errors(err.errors),
				rol: rol,
				nombre: nombre,
				title: 'SIGUCA - Administración de Roles - Intende nuevamente'
			});
		};
	});
	res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
