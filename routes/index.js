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
var Justificacion = require('../models/Justificaciones');
var Extra = require('../models/horasExtras');

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
            Usuario.find().exec(function(error, empleados) {

                if (error) return res.json(error);
                return res.render('escritorio', {
                    title: 'Escritorio Supervisor | SIGUCA',
                    empleados: empleados,
                    usuario: req.user,

                });
            });

        } else {
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
        } else {
            req.logout();
            res.redirect('/');
        }

    });
    app.get('/escritorioAdmin', autentificado, function(req, res) {
        if (req.session.name == "Administrador") {
            res.render('escritorioAdmin', {
                title: 'Administrador escritorio | SIGUCA',
                usuario: req.user
            });
        } else {
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
        } else {
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
        } else {
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
        } else {
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
        } else {
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
        } else {
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
        } else {
            req.logout();
            res.redirect('/');
        }
    });
    app.get('/configuracion', autentificado, function(req, res) {
        if (req.session.name == "Supervisor") {
            Usuario.find().exec(function(error, empleados) {

                Horario.find().exec(function(error, horarios) {
                    Departamento.find().exec(function(error, departamentos) {

                        if (error) return res.json(error);
                        return res.render('configuracionAdmin', {
                            title: 'Configuración Administrador | SIGUCA',
                            empleados: empleados,
                            usuario: req.user,
                            horarios: horarios,
                            departamentos: departamentos
                        });
                    });
                });
            });
        } else {
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
        } else {
            req.logout();
            res.redirect('/');
        }
    });
    app.get('/configuracionAdmin', autentificado, function(req, res) {
        if (req.session.name == "Administrador") {

            Usuario.find().exec(function(error, empleados) {

                Horario.find().exec(function(error, horarios) {
                    Departamento.find().exec(function(error, departamentos) {

                        if (error) return res.json(error);
                        return res.render('configuracionAdmin', {
                            title: 'Configuración Administrador | SIGUCA',
                            empleados: empleados,
                            usuario: req.user,
                            horarios: horarios,
                            departamentos: departamentos
                        });
                    });
                });
            });
        } else {
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
        } else {
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
        } else {
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
        } else {
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
    app.post('/horarioN', function(req, res) {

        var h = req.body;
        var horarioN = Horario({
            nombre: h.nombre,
            horaEntrada: h.horaEntrada,
            horaSalida: h.horaSalida,
            horaInAlmuerzo: h.horaInAlmuerzo,
            horaFnAlmuerzo: h.horaFnAlmuerzo,
            rangoReceso: h.rangoReceso,
        });
        console.log(h);
        horarioN.save(function(error, user) {

            if (error) res.json(error);
            if (req.session.name == "Administrador") {

                res.redirect('/configuracionAdmin');
            } else res.redirect('/configuracion');

        });
    });
    //read horario
    app.get('/horarioN', autentificado, function(req, res) {

        Horario.find().exec(function(error, horarios) {

            if (error) return res.json(error);

            return res.render('horarioN', {
                title: 'Nuevo Horario | SIGUCA',
                horarios: horarios,
                usuario: req.user
            });


        });
    });
    //update Horario
    app.get('/horarioN/editHorario/:id', autentificado, function(req, res) {
        var horarioId = req.params.id;

        Horario.findById(horarioId, function(error, horario) {

            if (error) return res.json(error);

            res.render('editHorario', horario);

        });
    });
    app.put('/horarioN/:id', function(req, res) {

        var horario = req.body,
            horarioId = req.params.id;

        delete horario.id;
        delete horario._id;

        Horario.findByIdAndUpdate(horarioId, horario, function(error, horarios) {

            if (error) return res.json(error);

            res.redirect('/horarioN');

        });
    });
    //delete Horario
    app.get('/horarioN/deleteHorario/:id', autentificado, function(req, res) {

        var horarioId = req.params.id;


        Horario.findByIdAndRemove(horarioId, function(error, horarios) {

            if (error) return res.json(error);

            res.redirect('/horarioN');

        });
    });
    //create marca
    app.post('/marca', function(req, res) {

        var d = new Date();
        var horaActual = "la fecha y hora actual es: " + d.getUTCDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
        console.log("hora de entrada" + horaActual);
        var usuario = req.user;
        var m = req.body;
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

            codTarjeta: req.user.codTarjeta
        });
        newMarca.save(function(error, user) {

            if (error) res.json(error);

            res.redirect('/escritorioEmpl');
        });
    });
    //create Justificacion
    app.post('/justificacion', function(req, res) {

        var d = new Date();
        var j = req.body;
        var newJustificacion = Justificacion({
            fecha: ({
                dia: d.getUTCDate(),
                mes: (d.getMonth() + 1),
                ano: d.getFullYear()
            }),
            comentario: j.comentario,
            estado: "Pendiente", //Pendiente, Aceptado, Rechazado
            comentarioSupervisor: j.comentarioSupervisor,
            codTarjeta: req.user.codTarjeta,
            idSupervisor: req.user.idSupervisor,
        });
        newJustificacion.save(function(error, user) {

            if (error) res.json(error);

            res.redirect('/justificacionesEmpl');
        });
    });
    //create Horas Extras
    app.post('/extra', function(req, res) {

        var d = new Date();
        var j = req.body;
        var newExtra = Extra({
            fecha: ({
                dia: d.getUTCDate(),
                mes: (d.getMonth() + 1),
                ano: d.getFullYear()
            }),
            comentario: j.comentario,
            estado: "Pendiente", //Pendiente, Aceptado, Rechazado
            comentarioSupervisor: j.comentarioSupervisor,
            codTarjeta: req.user.codTarjeta,
            idSupervisor: req.user.idSupervisor,
        });
        newExtra.save(function(error, user) {

            if (error) res.json(error);
            if (req.user.tipo == "Empleado") {
                res.redirect('/justificacionesEmpl');
            } else {
                res.redirect('/justificaciones');
            }
        });
    });
    //create empleado
    app.post('/empleado', function(req, res) {
        var e = req.body;

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
                departamento: e.idDepartamento,
            }), e.password, function(err, usuario) {
                console.log('Recibimos nuevo usuario:' + e.username + ' de tipo:' + e.tipo);
                console.log(e);
                if (err) {
                    console.log('usuario ya existe desde error');
                    res.json(error);
                    return res.render("registro", {
                        info: "Disculpe, el usuario ya existe. Intente de nuevo."
                    });
                }
                passport.authenticate('local')(req, res, function() {
                    if (req.session.name == "Administrador") {

                        res.redirect('/configuracionAdmin');
                    } else res.redirect('/configuracion');
                });
            }


        );

        console.log(e);
    });
    //read empleado
    app.get('/empleado', autentificado, function(req, res) {

        console.log('si entra');

        Usuario.find().exec(function(error, empleados) { //cambie Empleado por Usuario segun nuevo CRUD

            if (error) return res.json(error);

            return res.render('empleado', {
                title: 'Nuevo Empleado | SIGUCA',
                empleados: empleados,
                usuario: req.user
            });


        });

    });
    //update empleado
    app.get('/empleado/edit/:id', autentificado, function(req, res) {
        var empleadoId = req.params.id;

        Usuario.findById(empleadoId, function(error, empleado) { //cambie Empleado por Usuario segun nuevo CRUD

            if (error) return res.json(error);

            res.render('edit', empleado);

        });
    });
    app.put('/empleado/:id', function(req, res) {

        var empleado = req.body,
            empleadoId = req.params.id;

        delete empleado.id;
        delete empleado._id;

        Usuario.findByIdAndUpdate(empleadoId, empleado, function(error, empleados) { //cambie Empleado por Usuario segun nuevo CRUD

            if (error) return res.json(error);

            res.redirect('/empleado');

        });
    });
    //delete empleado
    app.get('/empleado/delete/:id', autentificado, function(req, res) {

        var empleadoId = req.params.id;


        Usuario.findByIdAndRemove(empleadoId, function(error, empleados) { //cambie Empleado por Usuario segun nuevo CRUD

            if (error) return res.json(error);

            res.redirect('/empleado');

        });
    });
    //create Departamento
    app.post('/departamento', function(req, res) {

        var e = req.body;
        var newDepartamento = Departamento({
            nombre: e.nombre,
            tipoJornada: e.tipoJornada,
            idSupervisor: e.idSupervisor,
            idHorario: e.idHorario,
        });
        newDepartamento.save(function(error, user) {

            if (error) res.json(error);
            if (req.session.name == "Administrador") {

                res.redirect('/configuracionAdmin');
            } else res.redirect('/configuracion');
        });
    });
    //read departamento
    app.get('/departamento', autentificado, function(req, res) {

        Departamento.find().exec(function(error, departamentos) {

            if (error) return res.json(error);

            return res.render('departamento', {
                title: 'Nuevo Departamento | SIGUCA',
                departamentos: departamentos,
                usuario: req.user
            });


        });
    });
    //update departamento
    app.get('/departamento/editDepartamento/:id', autentificado, function(req, res) {
        var departamentoId = req.params.id;

        Departamento.findById(departamentoId, function(error, departamento) {

            if (error) return res.json(error);

            res.render('editDepartamento', departamento);

        });
    });
    app.put('/departamento/:id', function(req, res) {

        var departamento = req.body,
            departamentoId = req.params.id;

        delete departamento.id;
        delete departamento._id;

        Departamento.findByIdAndUpdate(departamentoId, departamento, function(error, departamentos) {

            if (error) return res.json(error);

            res.redirect('/departamento');

        });
    });
    //delete departamento
    app.get('/departamento/deleteDepartamento/:id', autentificado, function(req, res) {

        var departamentoId = req.params.id;


        Departamento.findByIdAndRemove(departamentoId, function(error, departamentos) {

            if (error) return res.json(error);

            res.redirect('/departamento');

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