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
	bodyParser = require('body-parser');
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

var requestIp = require('request-ip');
app.use(requestIp.mw());

app.use(function(req, res, next){
	let ip = String(req.clientIp);
	ip = ip.replace("::ffff:", "");
	console.log(ip);
	req.app.locals.user_ip = ip;
	next();
});

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


/**
 * Configuración inicial de la Base de Datos(Creación de las colecciones
 * y mantener un administrador por defecto)
 */
require('./config/initData');

/**
 * Configuración inicial de los archivos de log
 */

const options = {
	timeZone: 'America/Costa_Rica',
	folderPath: './logs/',
	dateBasedFileNaming: true,
	fileNamePrefix: 'LogDiario_',
	fileNameExtension: '.log',
	dateFormat: 'YYYY_MM_DD',
	timeFormat: 'hh:mm:ss A',
};

const log = require('node-file-logger');

log.SetUserOptions(options);

log.Info('Conectado a SIGUCADB');
log.Info("Express server listening on port " + app.get('port'));
