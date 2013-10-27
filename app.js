/** SIGUCA
 *
 * 		Aplicación Principal
 *
 */

var express = require('express');
var mongoose = require('mongoose');
var routes = require('./routes');
var path = require('path');
/** Leer la configuración de ./config/config **/
var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];

var api_empleado = require('./controllers/API_Empleado');

var app = express();

//Para conectarse a la base de datos indicada en config.db
mongoose.connect(config.db);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión:'));
db.once('open', function callback () {
  console.log('Conexión a Mongo abierta');
});


require('./models/roles');

var dbRol = mongoose.model('Rol'); //Con esto tenemos el modelo rol listo para ser guardado en mongo

// Configuración de ambientes.
app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});


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
app.get('/escritorio', routes.escritorio);
app.get('/graficos', routes.graficos);
app.get('/ayuda', routes.ayuda);
app.get('/configuracion', routes.configuracion);
app.get('/justificaciones', routes.justificaciones);
app.get('/justificacion_nueva', routes.justificacion_nueva);
app.get('/roles', routes.roles); //Llama la vista de roles a través de ./routes/index.js
/*app.post('/roles', function(req, res){
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
});*/
app.get('/empleado', api_empleado.registra);
app.post('/empleado', api_empleado.crea);
/*app.get('/empleado/:cedula.:format?', api_empleado.buscaPorCedula);
app.get('/empleado', api_empleado.lista);
*/

app.listen(3000);
console.log('Servidor Express escuchando en http://localhost:' + app.get('port'));

/* http.createServer(app).listen(app.get('port'), function(){			ELIMINADO POR DEPRECADO
  console.log('Express server listening on port ' + app.get('port'));
}); */
