/*
 * GET home page.
 * Rutas
 */
require('../models/roles');
var Empleado= require('../models/Empleado');
var mongoose = require('mongoose');
require('../models/Usuario');
require('../models/Horario');


var passport = require('passport');
var Usuario = require('../models/Usuario');
var Horario = require('../models/Horario');

module.exports = function(app) {
	
	app.get('/', function(req, res) {
		res.render('index', { usuario : req.user });
	});	
	
	app.post('/login', passport.authenticate('local'), function(req, res) {
		console.log("ingreso correcto"+req.user.tipo);
		if(req.user.tipo=="Administrador"){
	         passport.authenticate('local')(req, res, function () {
	           res.redirect('/escritorioAdmin');
	         });
	      }
          else{
          	if(req.user.tipo=="Supervisor"){
	          passport.authenticate('local')(req, res, function () {
	            res.redirect('/escritorio');
	          });
	        }
	        else{
	        	if(req.user.tipo=="Empleado"){
		          passport.authenticate('local')(req, res, function () {
		            res.redirect('/escritorioEmpl');
		          });
		        }

	        }  

          }
	});
	
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	
	app.get('/registro', function(req, res) { 
      res.render('registro', { });
  	});
  	
  	app.post('/horarioN', function(req,res){
  		var horarioN = new Horario ({nombre : req.body.nombreHorario, horaEntrada: req.body.horaEntrada, 
  			horaSalida: req.body.horaSalida, horaInAlmuerzo: req.body.horaInAlmuerzo, 
  			horaFnAlmuerzo: req.body.horaFnAlmuerzo, rangoReceso : req.body.rangoReceso});
		console.log(req.body);
		horarioN.save(function(err){
			if (err) {
				return res.render('horarioN', {
					errors: utils.errors(err.errors),
					nombre: horarioN,
					title: 'SIGUCA - Nuevo H- Intente nuevamente'
				});
			};
		});

	});
	
	app.post('/registro', function(req, res) {
      Usuario.register(new Usuario({ username : req.body.username, tipo : req.body.tipo  }), req.body.password, function(err, usuario) {
          console.log('Recibimos nuevo usuario:'+req.body.username+' de tipo:'+req.body.tipo);
          console.log(req.body);
          if (err) {
            return res.render("registro", {info: "Disculpe, el usuario ya existe. Intente de nuevo."});
          }
          if(req.body.tipo=="Administrador"){
	         passport.authenticate('local')(req, res, function () {
	           res.redirect('/escritorioAdmin');
	         });
	      }
          else{
          	if(req.body.tipo=="Supervisor"){
	          passport.authenticate('local')(req, res, function () {
	            res.redirect('/escritorio');
	          });
	        }
	        else{
	        	if(req.body.tipo=="Empleado"){
		          passport.authenticate('local')(req, res, function () {
		            res.redirect('/escritorioEmpl');
		          });
		        }

	        }  

          }

      });
	});

	app.get('/escritorio', function(req, res){
		res.render('escritorio', { usuario : req.user });
	});
	app.get('/escritorioEmpl', function(req, res){
		res.render('escritorioEmpl', {title: 'Empleado escritorio | SIGUCA', usuario : req.user});
	});
	app.get('/escritorioAdmin', function(req, res){
		res.render('escritorioAdmin', {title: 'Administrador escritorio | SIGUCA', usuario : req.user});
	});

	app.get('/graficos', function(req, res){
		res.render('graficos', {title: 'Graficos | SIGUCA', usuario : req.user});
	});
	app.get('/graficosAdmin', function(req, res){
		res.render('graficosAdmin', {title: 'Graficos Administrador | SIGUCA', usuario : req.user});
	});
	app.get('/graficosEmpl', function(req, res){
		res.render('graficosEmpl', {title: 'Graficos Administrador | SIGUCA', usuario : req.user});
	});
	app.get('/ayuda', function(req, res){
		res.render('ayuda', {title: 'Ayuda | SIGUCA', usuario : req.user});
	});
	app.get('/ayudaAdmin', function(req, res){
		res.render('ayudaAdmin', {title: 'Ayuda | SIGUCA', usuario : req.user});
	});
	app.get('/ayudaEmpl', function(req, res){
		res.render('ayudaEmpl', {title: 'Ayuda | SIGUCA', usuario : req.user});
	});
	app.get('/configuracion', function(req, res){
		res.render('configuracion',{title: 'Configuración | SIGUCA', usuario : req.user});
	});
	
	app.get('/configuracionEmpl', function(req, res){
		res.render('configuracionEmpl',{title: 'Configuración | SIGUCA', usuario : req.user});
	});
	
	app.get('/configuracionAdmin', function(req, res){
		res.render('configuracionAdmin',{title: 'Configuración | SIGUCA', usuario : req.user});
	});	
	
	app.get('/justificaciones', function(req, res){
		res.render('justificaciones', {title: 'Justificaciones/Permisos | SIGUCA', usuario : req.user});
	});
	
	app.get('/justificacionesAdmin', function(req, res){
		res.render('justificacionesAdmin', {title: 'Administrador justificaciones| Permisos', usuario : req.user});
	});
	
	app.get('/justificacionesEmpl', function(req, res){
		res.render('justificacionesEmpl', {title: 'Solicitudes/Justificaciones | SIGUCA', usuario : req.user});
	});
	
	app.get('/justificacion_nueva', function(req, res){
		res.render('justificacion_nueva', {title: 'Nueva Justificacion | SIGUCA', usuario : req.user});
	});
	
	app.get('/solicitud_extra', function(req, res){
		res.render('solicitud_extra', {title: 'Solicitud Tiempo Extra | SIGUCA', usuario : req.user});
	});
	
	app.get('/autoriza_extra', function(req, res){
		res.render('autoriza_extra', {title: 'Autorizacion Tiempo Extra | SIGUCA', usuario : req.user});
	});
	
	app.get('/autoriza_justificacion', function(req, res){
		res.render('autoriza_justificacion', {title: 'Autorizacion Justificacion | SIGUCA', usuario : req.user});
	});
	
	app.get('/roles', function(req, res){
		res.render('roles', {title: 'SIGUCA - Administración de Roles', rol: req.rol, nombre: req.nombre});
	});
	
	app.get('/horarioN', function(req, res){
		res.render('horarioN', {title: 'SIGUCA - Nuevo Horario', usuario : req.user});
	});

		
	app.post('/empleado', function(request, response) {
 
        var e = request.body;
        var newEmpleado = Empleado({
	        nombre: e.nombre,
	        apellido1: e.apellido1,
	        apellido2: e.apellido2,cedula: e.cedula,
	        email:e.email,
	        cedula: e.cedula,
	        codTarjeta: e.codTarjeta
        });
        newEmpleado.save(function(error, user) {
    
        if (error) response.json(error);
 
           response.redirect('/configuracionAdmin');
        });
   
    });

	app.get('/empleado', function(request, response) {
	 console.log('si entra');
	 
	  Empleado.find().exec(function (error, empleados) {
	    
	    if (error) return response.json(error);
	 
	     return response.render('empleado', {title: 'Nuevo Empleado | SIGUCA', empleados : empleados, usuario : request.user });
	     	
	 
	  });
	 
	});
	  
	//update
	app.get('/empleado/edit/:id', function(request, response) {		 
	  var empleadoId = request.params.id;
	   
	  Empleado.findById(empleadoId, function (error, empleado) {
	 
	    if (error) return response.json(error);
	 
	    response.render('edit', empleado);
	 
	  });
	 
	});

	app.put('/empleado/:id', function(request, response) {
	 
	  var empleado = request.body,
	      empleadoId = request.params.id;
	 
	  delete empleado.id;
	  delete empleado._id;
	 
	  Empleado.findByIdAndUpdate(empleadoId, empleado, function (error, empleados) {
	 
	    if (error) return response.json(error);
	 
	    response.redirect('/empleado');
	 
	  });
	 
	});

	//delete
	app.get('/empleado/delete/:id', function(request, response) {
	 
	  var empleadoId = request.params.id;
	 
	  
	   Empleado.findByIdAndRemove(empleadoId, function (error, empleados) {
	 
	    if (error) return response.json(error);
	 
	    response.redirect('/empleado');
	 
	  });
	 
	});

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
	}); */
	
	app.get('/dispositivos', function(req, res){
		res.render('dispositivos', {title: 'Dispositivos | SIGUCA', usuario : req.user});
	});	

};

/*

// Crea nuevo Empleado
exports.crea = function(req, res) {
	var empleado = new Empleado(req.body);
	empleado.save(function (err) {
		if (err) {
			return res.render('empleado', {
				errors: utils.errors(err.errors),
				empleado: empleado,
				title: 'Intente el registro de nuevo'
			})
		}
		return res.redirect('/')
	});				
}


								
exports.registra = function (req, res) {
  res.render('empleado', {
    title: 'SIGUCA - Administración de Empleados',
    empleado: new Empleado()
  })
}


// Busca Empleado por Cédula
exports.buscaPorCedula = (function(req, res) {
	Empleado.findOne({cedula: req.params.cedula});
});

// Lista a todos los Empleados
exports.lista = function(req, res) {
	Empleado.find(function(err, empleados) {
		res.send(empleados);
	});
}
exports.indexAng = function (req, res){
  return Empleado.find(function (err, contacts) {
    if (!err) {
      res.jsonp(contacts);    } else {
      console.log(err);
    }
  });
 

  
}

 */
