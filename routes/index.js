/*
 * GET home page.
 * Rutas
 */
require('../models/roles');
var Empleado = require('../models/Empleado');
var mongoose = require('mongoose');
var Marca = require('../models/Marca');
var Supervisor = require('../models/Supervisor');
var Departamento = require('../models/Departamento');
var passport = require('passport');
var Usuario = require('../models/Usuario');
var Horario = require('../models/Horario');

module.exports = function(app) {

    app.get('/', function(req, res) {
        res.render('index', {
            usuario: req.user
        });
    });

    app.post('/login', passport.authenticate('local'), function(req, res) {
		req.session.name = req.user.tipo; // Setea el tipo de Usuario (No lo mas conveniente, cuestion de tiempo, funciona).
        if (req.session.name == "Administrador") {
            res.redirect('/escritorioAdmin');
        } 
        if (req.session.name == "Supervisor") {
            res.redirect('/escritorio');
        } 
        if (req.session.name == "Empleado") {
            res.redirect('/escritorioEmpl');
        }
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/registro', autentificado, function(req, res) {
        res.render('registro', {});
    });

    app.post('/registro', function(req, res) {
        Usuario.register(new Usuario({
            username: req.body.username,
            tipo: req.body.tipo
        }), req.body.password, function(err, usuario) {
            console.log('Recibimos nuevo usuario:' + req.body.username + ' de tipo:' + req.body.tipo);
            console.log(req.body);
            if (err) {
                return res.render("registro", {
                    info: "Disculpe, el usuario ya existe. Intente de nuevo."
                });
            }
            if (req.body.tipo == "Administrador") {
                passport.authenticate('local')(req, res, function() {
                    res.redirect('/escritorioAdmin');
                });
            } else {
                if (req.body.tipo == "Supervisor") {
                    passport.authenticate('local')(req, res, function() {
                        res.redirect('/escritorio');
                    });
                } else {
                    if (req.body.tipo == "Empleado") {
                        passport.authenticate('local')(req, res, function() {
                            res.redirect('/escritorioEmpl');
                        });
                    }

                }

            }

        });
    });

    app.get('/escritorio', autentificado, function(req, res) {
		if (req.session.name == "Supervisor") {
			res.render('escritorio', {
				usuario: req.user
			});
		}else{
			req.logout();
			res.redirect('/');
		}
    });
    app.get('/escritorioEmpl', autentificado, function(req, res) {
	    if (req.session.name == "Empleado") {
            Marca.find().exec(function(error, marcas) {

				if (error) return res.json(error);
					return res.render('escritorioEmpl', {
                title: 'Escritorio Empleado | SIGUCA',
                marcas: marcas,
                usuario: req.user
				});
			});
        }else{
			req.logout();
			res.redirect('/');
		}
        /*res.render('escritorioEmpl', {
            title: 'Empleado escritorio | SIGUCA',
            usuario: req.user
        });*/
    });
    app.get('/escritorioAdmin', autentificado, function(req, res) {
		if (req.session.name == "Administrador") {
			res.render('escritorioAdmin', {
				title: 'Administrador escritorio | SIGUCA',
				usuario: req.user
			});
		}else{
			req.logout();
			res.redirect('/');
		}
    });
    app.get('/graficos', autentificado, function(req, res) {
		if (req.session.name == "Supervisor") {
			res.render('graficos', {
				title: 'Graficos | SIGUCA',
				usuario: req.user
			});
		}else{
			req.logout();
			res.redirect('/');		
		}
    });
    app.get('/graficosAdmin', autentificado, function(req, res) {
		if (req.session.name == "Administrador") {
			res.render('graficosAdmin', {
				title: 'Graficos Administrador | SIGUCA',
				usuario: req.user
			});
		}else{
			req.logout();
			res.redirect('/');			
		}
    });
    app.get('/graficosEmpl', autentificado, function(req, res) {
		if (req.session.name == "Empleado") {
			res.render('graficosEmpl', {
				title: 'Graficos Administrador | SIGUCA',
				usuario: req.user
			});
		}else{
			req.logout();
			res.redirect('/');			
		}
    });
    app.get('/ayuda', autentificado, function(req, res) {
		if (req.session.name == "Supervisor") {
			res.render('ayuda', {
				title: 'Ayuda | SIGUCA',
				usuario: req.user
			});
		}else{
			req.logout();
			res.redirect('/');			
		}
    });
    app.get('/ayudaAdmin', autentificado, function(req, res) {
		if (req.session.name == "Administrador") {
			res.render('ayudaAdmin', {
				title: 'Ayuda | SIGUCA',
				usuario: req.user
			});
		}else{
			req.logout();
			res.redirect('/');					
		}
    });
    app.get('/ayudaEmpl', autentificado, function(req, res) {
		if (req.session.name == "Empleado") {
			res.render('ayudaEmpl', {
				title: 'Ayuda | SIGUCA',
				usuario: req.user
			});
		}else{
			req.logout();
			res.redirect('/');				
		}
    });
    app.get('/configuracion', autentificado, function(req, res) {
		if (req.session.name == "Supervisor") {
			res.render('configuracion', {
				title: 'Configuración | SIGUCA',
				usuario: req.user
			});
		}else{
			req.logout();
			res.redirect('/');			
		}
    });
    app.get('/configuracionEmpl', autentificado, function(req, res) {
		if (req.session.name == "Empleado") {
			res.render('configuracionEmpl', {
				title: 'Configuración | SIGUCA',
				usuario: req.user
			});
		}else{
			req.logout();
			res.redirect('/');			
		}
    });
    app.get('/configuracionAdmin', autentificado, function(req, res) {
		if (req.session.name == "Administrador") {
			res.render('configuracionAdmin', {
				title: 'Configuración | SIGUCA',
				usuario: req.user
			});
		}else{
			req.logout();
			res.redirect('/');			
		}
    });
    app.get('/justificaciones', autentificado, function(req, res) {
		if (req.session.name == "Supervisor") {
			res.render('justificaciones', {
				title: 'Justificaciones/Permisos | SIGUCA',
				usuario: req.user
			});
		}else{
			req.logout();
			res.redirect('/');			
		}
    });
    app.get('/justificacionesAdmin', autentificado, function(req, res) {
		if (req.session.name == "Administrador") {
			res.render('justificacionesAdmin', {
				title: 'Administrador justificaciones| Permisos',
				usuario: req.user
			});
		}else{
			req.logout();
			res.redirect('/');				
		}
    });
    app.get('/justificacionesEmpl', autentificado, function(req, res) {
		if (req.session.name == "Empleado") {
			res.render('justificacionesEmpl', {
				title: 'Solicitudes/Justificaciones | SIGUCA',
				usuario: req.user
			});
		}else{
			req.logout();
			res.redirect('/');				
		}
    });
    app.get('/justificacion_nueva', autentificado, function(req, res) {
        res.render('justificacion_nueva', {
            title: 'Nueva Justificacion | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/solicitud_extra', autentificado, function(req, res) {
        res.render('solicitud_extra', {
            title: 'Solicitud Tiempo Extra | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/autoriza_extra', autentificado, function(req, res) {
        res.render('autoriza_extra', {
            title: 'Autorizacion Tiempo Extra | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/autoriza_justificacion', autentificado, function(req, res) {
        res.render('autoriza_justificacion', {
            title: 'Autorizacion Justificacion | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/roles', autentificado, function(req, res) {
        res.render('roles', {
            title: 'SIGUCA - Administración de Roles',
            rol: req.rol,
            nombre: req.nombre
        });
    });
    //create Horario
    app.post('/horarioN', function(request, response) {

        var h = request.body;
        var horarioN = Horario({
            nombre: h.nombre,
            horaEntrada: h.horaEntrada,
            horaSalida: h.horaSalida,
            horaInAlmuerzo: h.horaInAlmuerzo,
            horaFnAlmuerzo: h.horaFnAlmuerzo,
            rangoReceso: h.rangoReceso
        });
        console.log(h);
        horarioN.save(function(error, user) {

            if (error) response.json(error);

            response.redirect('/configuracionAdmin');
        });
    });
    //read horario
    app.get('/horarioN', autentificado, function(request, response) {

        Horario.find().exec(function(error, horarios) {

            if (error) return response.json(error);

            return response.render('horarioN', {
                title: 'Nuevo Horario | SIGUCA',
                horarios: horarios,
                usuario: request.user
            });


        });
    });
    //update Horario
    app.get('/horarioN/editHorario/:id', autentificado, function(request, response) {
        var horarioId = request.params.id;

        Horario.findById(horarioId, function(error, horario) {

            if (error) return response.json(error);

            response.render('editHorario', horario);

        });
    });
    app.put('/horarioN/:id', function(request, response) {

        var horario = request.body,
            horarioId = request.params.id;

        delete horario.id;
        delete horario._id;

        Horario.findByIdAndUpdate(horarioId, horario, function(error, horarios) {

            if (error) return response.json(error);

            response.redirect('/horarioN');

        });
    });
    //delete Horario
    app.get('/horarioN/deleteHorario/:id', autentificado, function(request, response) {

        var horarioId = request.params.id;


        Horario.findByIdAndRemove(horarioId, function(error, horarios) {

            if (error) return response.json(error);

            response.redirect('/horarioN');

        });
    });
    //create marca
    app.post('/marca', function(request, response) {

        var d = new Date();
        var horaActual = "la fecha y hora actual es: " + d.getUTCDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
        console.log("hora de entrada" + horaActual);
        var usuario = request.user;
        var m = request.body;
        console.log('el codigo es' + usuario);
        var newMarca = Marca({
            fecha: ({
                dia: d.getUTCDate(),
                mes: (d.getMonth() + 1),
                ano: d.getFullYear()
            }),
            horaEntrada: ({
                hora: d.getHours(),
                minutos: d.getMinutes(),
                segundos: d.getSeconds()
            }),

            codTarjeta: request.user.codTarjeta
        });
        newMarca.save(function(error, user) {

            if (error) response.json(error);

            response.redirect('/escritorioEmpl');
        });
    });
    //create empleado
    app.post('/empleado', function(request, response) {
        var e = request.body;
        /* var newEmpleado = Empleado({
            usuario: e.username,
            tipo: e.tipo,
            nombre: e.nombre,
            apellido1: e.apellido1,
            apellido2: e.apellido2,
            email: e.email,
            cedula: e.cedula,
            codTarjeta: e.codTarjeta,

        });*/

        Usuario.register(new Usuario({ //cambie Empleado por Usuario segun nuevo CRUD

                username: e.username,
                tipo: e.tipo,
                estado: "Activo",
                nombre: e.nombre,
                apellido1: e.apellido1,
                apellido2: e.apellido2,
                email: e.email,
                cedula: e.cedula,
                codTarjeta: e.codTarjeta,
            }), e.password, function(err, usuario) {
                console.log('Recibimos nuevo usuario:' + e.username + ' de tipo:' + e.tipo);
                console.log(e);
                if (err) {
                    console.log('usuario ya existe desde error');
                    response.json(error);
                    return response.render("registro", {
                        info: "Disculpe, el usuario ya existe. Intente de nuevo."
                    });
                }
                passport.authenticate('local')(request, response, function() {
                    response.redirect('/configuracionAdmin');
                });
            }


        );

        console.log(e);
        /*newEmpleado.save(function(error, user) {

            if (error) response.json(error);

            response.redirect('/configuracionAdmin');
        });*/
    });
    //read empleado
    app.get('/empleado', autentificado, function(request, response) {
		if (req.session.name == "Empleado") {
			console.log('si entra');

			Usuario.find().exec(function(error, empleados) { //cambie Empleado por Usuario segun nuevo CRUD

				if (error) return response.json(error);

				return response.render('empleado', {
					title: 'Nuevo Empleado | SIGUCA',
					empleados: empleados,
					usuario: request.user
				});


			});
		}else{
			req.logout();
			res.redirect('/');
		}
    });
    //update empleado
    app.get('/empleado/edit/:id', autentificado, function(request, response) {
        var empleadoId = request.params.id;

        Usuario.findById(empleadoId, function(error, empleado) { //cambie Empleado por Usuario segun nuevo CRUD

            if (error) return response.json(error);

            response.render('edit', empleado);

        });
    });
    app.put('/empleado/:id', function(request, response) {

        var empleado = request.body,
            empleadoId = request.params.id;

        delete empleado.id;
        delete empleado._id;

        Usuario.findByIdAndUpdate(empleadoId, empleado, function(error, empleados) { //cambie Empleado por Usuario segun nuevo CRUD

            if (error) return response.json(error);

            response.redirect('/empleado');

        });
    });
    //delete empleado
    app.get('/empleado/delete/:id', autentificado, function(request, response) {

        var empleadoId = request.params.id;


        Usuario.findByIdAndRemove(empleadoId, function(error, empleados) { //cambie Empleado por Usuario segun nuevo CRUD

            if (error) return response.json(error);

            response.redirect('/empleado');

        });
    });
    //create Departamento
    app.post('/departamento', function(request, response) {

        var e = request.body;
        var newDepartamento = Departamento({
            nombre: e.nombre,
            tipoJornada: e.tipoJornada,
        });
        newDepartamento.save(function(error, user) {

            if (error) response.json(error);

            response.redirect('/configuracionAdmin');
        });
    });
    //read departamento
    app.get('/departamento', autentificado, function(request, response) {

        Departamento.find().exec(function(error, departamentos) {

            if (error) return response.json(error);

            return response.render('departamento', {
                title: 'Nuevo Departamento | SIGUCA',
                departamentos: departamentos,
                usuario: request.user
            });


        });
    });
    //update departamento
    app.get('/departamento/editDepartamento/:id', autentificado, function(request, response) {
        var departamentoId = request.params.id;

        Departamento.findById(departamentoId, function(error, departamento) {

            if (error) return response.json(error);

            response.render('editDepartamento', departamento);

        });
    });
    app.put('/departamento/:id', function(request, response) {

        var departamento = request.body,
            departamentoId = request.params.id;

        delete departamento.id;
        delete departamento._id;

        Departamento.findByIdAndUpdate(departamentoId, departamento, function(error, departamentos) {

            if (error) return response.json(error);

            response.redirect('/departamento');

        });
    });
    //delete departamento
    app.get('/departamento/deleteDepartamento/:id', autentificado, function(request, response) {

        var departamentoId = request.params.id;


        Departamento.findByIdAndRemove(departamentoId, function(error, departamentos) {

            if (error) return response.json(error);

            response.redirect('/departamento');

        });
    });
    // create supervisor
    app.post('/supervisor', function(request, response) {

        var e = request.body;
        var newSupervisor = Supervisor({
            nombre: e.nombre,
            apellido1: e.apellido1,
            apellido2: e.apellido2,
            email: e.email,
            cedula: e.cedula,
            codTarjeta: e.codTarjeta,
            area: e.area,
        });
        newSupervisor.save(function(error, user) {

            if (error) response.json(error);

            response.redirect('/configuracionAdmin');
        });
    });
    //read supervisor
    app.get('/supervisor', autentificado, function(request, response) {

        console.log(buscaTodosSuper + 'asi si');
        response.render('supervisor', {
            title: 'Lista de Supervisores | SIGUCA',
            supervisors: buscaTodosSuper,
            busca: request.user
        });


    });

    //update supervisor
    app.get('/supervisor/editSupervisor/:id', autentificado, function(request, response) {
        var supervisorId = request.params.id;

        Supervisor.findById(supervisorId, function(error, supervisor) {

            if (error) return response.json(error);

            response.render('editSupervisor', supervisor);

        });
    });
    app.put('/supervisor/:id', function(request, response) {

        var supervisor = request.body,
            supervisorId = request.params.id;

        delete supervisor.id;
        delete supervisor._id;

        Supervisor.findByIdAndUpdate(supervisorId, supervisor, function(error, supervisors) {

            if (error) return response.json(error);

            response.redirect('/supervisor');

        });
    });
    //delete supervisor
    app.get('/supervisor/deleteSupervisor/:id', autentificado, function(request, response) {

        var supervisorId = request.params.id;

        Supervisor.findByIdAndRemove(supervisorId, function(error, supervisors) {

            if (error) return response.json(error);

            response.redirect('/supervisor');

        });
    });


    app.get('/dispositivos', autentificado, function(req, res) {
        res.render('dispositivos', {
            title: 'Dispositivos | SIGUCA',
            usuario: req.user
        });
    });

    function autentificado(req, res, next) {
        // Si no esta autentificado en la sesion, que prosiga con el enrutamiento 
        if (req.isAuthenticated())
            return next();

        // redireccionar al home en caso de que no
        res.redirect('/');
    }

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