/*
 * GET home page.
 * Rutas
 */
require('../models/roles');
var Empleado = require('../models/Empleado');
var mongoose = require('mongoose');
var Marca = require('../models/Marca');
var Departamento = require('../models/Departamento');
var Supervisor = require('../models/Supervisor');
require('../models/Usuario');
require('../models/Horario');

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
        console.log("ingreso correcto" + req.user.tipo);
        if (req.user.tipo == "Administrador") {
            passport.authenticate('local')(req, res, function() {
                res.redirect('/escritorioAdmin');
            });
        } else {
            if (req.user.tipo == "Supervisor") {
                passport.authenticate('local')(req, res, function() {
                    res.redirect('/escritorio');
                });
            } else {
                if (req.user.tipo == "Empleado") {
                    passport.authenticate('local')(req, res, function() {
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
    app.get('/escritorio', function(req, res) {
        res.render('escritorio', {
            usuario: req.user
        });
    });
    app.get('/escritorioEmpl', function(req, res) {
        res.render('escritorioEmpl', {
            title: 'Empleado escritorio | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/escritorioAdmin', function(req, res) {
        res.render('escritorioAdmin', {
            title: 'Administrador escritorio | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/graficos', function(req, res) {
        res.render('graficos', {
            title: 'Graficos | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/graficosAdmin', function(req, res) {
        res.render('graficosAdmin', {
            title: 'Graficos Administrador | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/graficosEmpl', function(req, res) {
        res.render('graficosEmpl', {
            title: 'Graficos Administrador | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/ayuda', function(req, res) {
        res.render('ayuda', {
            title: 'Ayuda | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/ayudaAdmin', function(req, res) {
        res.render('ayudaAdmin', {
            title: 'Ayuda | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/ayudaEmpl', function(req, res) {
        res.render('ayudaEmpl', {
            title: 'Ayuda | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/configuracion', function(req, res) {
        res.render('configuracion', {
            title: 'Configuración | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/configuracionEmpl', function(req, res) {
        res.render('configuracionEmpl', {
            title: 'Configuración | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/configuracionAdmin', function(req, res) {
        res.render('configuracionAdmin', {
            title: 'Configuración | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/justificaciones', function(req, res) {
        res.render('justificaciones', {
            title: 'Justificaciones/Permisos | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/justificacionesAdmin', function(req, res) {
        res.render('justificacionesAdmin', {
            title: 'Administrador justificaciones| Permisos',
            usuario: req.user
        });
    });
    app.get('/justificacionesEmpl', function(req, res) {
        res.render('justificacionesEmpl', {
            title: 'Solicitudes/Justificaciones | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/justificacionNueva', function(req, res) {
        res.render('justificacionNueva', {
            title: 'Nueva Justificacion | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/solicitudExtra', function(req, res) {
        res.render('solicitudExtra', {
            title: 'Solicitud Tiempo Extra | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/autorizaExtra', function(req, res) {
        res.render('autorizaExtra', {
            title: 'Autorizacion Tiempo Extra | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/autorizaJustificacion', function(req, res) {
        res.render('autorizaJustificacion', {
            title: 'Autorizacion Justificacion | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/roles', function(req, res) {
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
    app.get('/horarioN', function(request, response) {

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
    app.get('/horarioN/editHorario/:id', function(request, response) {
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
    app.get('/horarioN/deleteHorario/:id', function(request, response) {

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
        var m = request.body;
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
            codTarjeta: 12345
        });
        newMarca.save(function(error, user) {

            if (error) response.json(error);

            response.redirect('/escritorioEmpl');
        });
    });
    //create empleado
    app.post('/empleado', function(request, response) {
        var e = request.body;
        var newEmpleado = Empleado({
            nombre: e.nombre,
            apellido1: e.apellido1,
            apellido2: e.apellido2,
            email: e.email,
            cedula: e.cedula,
            codTarjeta: e.codTarjeta
        });
        console.log(e);
        newEmpleado.save(function(error, user) {

            if (error) response.json(error);

            response.redirect('/configuracionAdmin');
        });
    });
    //read empleado
    app.get('/empleado', function(request, response) {
        console.log('si entra');

        Empleado.find().exec(function(error, empleados) {

            if (error) return response.json(error);

            return response.render('empleado', {
                title: 'Nuevo Empleado | SIGUCA',
                empleados: empleados,
                usuario: request.user
            });


        });
    });
    //update empleado
    app.get('/empleado/edit/:id', function(request, response) {
        var empleadoId = request.params.id;

        Empleado.findById(empleadoId, function(error, empleado) {

            if (error) return response.json(error);

            response.render('edit', empleado);

        });
    });
    app.put('/empleado/:id', function(request, response) {

        var empleado = request.body,
            empleadoId = request.params.id;

        delete empleado.id;
        delete empleado._id;

        Empleado.findByIdAndUpdate(empleadoId, empleado, function(error, empleados) {

            if (error) return response.json(error);

            response.redirect('/empleado');

        });
    });
    //delete empleado
    app.get('/empleado/delete/:id', function(request, response) {

        var empleadoId = request.params.id;


        Empleado.findByIdAndRemove(empleadoId, function(error, empleados) {

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
    app.get('/departamento', function(request, response) {

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
    app.get('/departamento/editDepartamento/:id', function(request, response) {
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
    app.get('/departamento/deleteDepartamento/:id', function(request, response) {

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
    app.get('/supervisor', function(request, response) {
        console.log('si entra');

        Supervisor.find().exec(function(error, supervisors) {

            if (error) return response.json(error);

            return response.render('supervisor', {
                title: 'Lista de Supervisores | SIGUCA',
                supervisors: supervisors,
                usuario: request.user
            });


        });
    });
    //update supervisor
    app.get('/supervisor/editSupervisor/:id', function(request, response) {
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
    app.get('/supervisor/deleteSupervisor/:id', function(request, response) {

        var supervisorId = request.params.id;

        Supervisor.findByIdAndRemove(supervisorId, function(error, supervisors) {

            if (error) return response.json(error);

            response.redirect('/supervisor');

        });
    });
    app.get('/dispositivos', function(req, res) {
        res.render('dispositivos', {
            title: 'Dispositivos | SIGUCA',
            usuario: req.user
        });
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