/** SIGUCA (Sistema de Gestión de Usuarios y Control de Asistencia)
 * Aplicación principal- 
   Main app
 * 		
 *
 */


/** Dependencias
    Dependencies
 */
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var routes = require('./routes');
var path = require('path');
LocalStrategy = require('passport-local').Strategy;
//var apiEmpleado = require('../controllers');

var app = express();

/*Configuración de ambientes.s
* Configuration */
app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));

});

/** Leer la configuración de ./config/config **/
var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];



// Configure passport
var Account = require('./models/cuentas-admin');

passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.locals.pretty = true;
  //app.configure('development', function () { app.locals.pretty = true; });
}


/** Routes
**/
require('./routes/index')(app);

// Open App socket
app.listen(3000);
console.log('Servidor Express escuchando en http://localhost:' + app.get('port'));


