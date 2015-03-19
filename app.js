/** 
 *
 * 	SIGUCA (Sistema de Gestión de Usuarios y Control de Asistencia)
 * 	Aplicación principal	
 *
 */
 
/** 
 *
 *	Dependencias
 *
 */
 
var path = require('path');
var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var routes = require('./routes');
//var apiEmpleado = require('../controllers');

/**
 *
 *	Configuración principal
 *
 */
 
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

/**
 *
 *	Configuración de Passport
 *
 */

var Usuario = require('./models/Usuario');
passport.use(new LocalStrategy(Usuario.authenticate()));
passport.serializeUser(Usuario.serializeUser());
passport.deserializeUser(Usuario.deserializeUser());

/**
 *
 *	Mongoose
 *
 */

mongoose.connect('mongodb://localhost/sigucadb',function(err){
	if(!err){
		console.log('Conectado a SIGUCADB');
	}else{
	 throw err;
	}
});

/** Leer la configuración de ./config/config **/
var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.locals.pretty = true;
}

/**
 *
 *	Rutas
 *
 */
var server = http.createServer(app);
var io = require('socket.io').listen(server);

require('./routes/index')(app,io);

app.listen(app.get('port'), function(){
  console.log(("Servidor escuchando en puerto: " + app.get('port')))
});