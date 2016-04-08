/*
 * 	SIGUCA (Sistema de Gestión de Usuarios y Control de Asistencia)
 * 	Aplicación principal	
 */
 
/**
* Dependencias del módulo
*/
var path = require('path'),
	express = require('express'),
	http = require('http'),
	mongoose = require('mongoose'),
	passport = require('passport');

/*
	Leer la configuración de ./config/config
*/
var env = process.env.NODE_ENV || 'development',
	config = require('./config/config')[env];

/*
 	Conexión a la base de datos MongoDB, por medio de Mongoose
*/
mongoose.connect(config.db,function(err){
	if(!err){
		console.log('Conectado a SIGUCADB');
	}else{
	 throw err;
	}
});

/*
	Carga de la configuración de los módulos
*/
require('./config/passport')(passport);

var app = express();
require('./config/express')(app, config, passport);

/*
	Rutas
*/
//Asignamos a server la creación del servidor http.
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
 
//Importamos socket.io utilizando el servidor creado anteriormente.
var io = require('socket.io').listen(server);

require('./routes/index')(app,io);
