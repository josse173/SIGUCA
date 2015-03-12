
/*
 * GET home page.
 * Rutas
 */

var mongoose = require('mongoose');
var Marca = require('../models/Marca');
var Departamento = require('../models/Departamento');
var passport = require('passport');
var Usuario = require('../models/Usuario');
var Horario = require('../models/Horario');
var Justificacion = require('../models/Justificaciones');


module.exports = function(app) {

    app.get('/', function(req, res) {
        res.render('index', {
            usuario: req.user
        });
    });

    app.post('/login', passport.authenticate('local'), function(req, res) {
        req.session.name = req.user.tipo;
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

    app.get('/logout',autentificado, function(req, res) {
        req.logout();
        res.redirect('/');
    });
    app.get('/escritorio', autentificado, function(req, res) {
        if (req.session.name == "Supervisor") {
            Usuario.find().exec(function(error, empleados) {

                if (error) return res.json(error);
                return res.render('escritorio', {
                    title: 'Escritorio Supervisor | SIGUCA',
                    empleados: empleados, /* Para que envian los empleados?? - para el calendario?*/
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
                    marcas: marcas, /* Para que envian las marcas?? - para el calendario?*/
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
             Usuario.find().exec(function(error, empleados) {

                if (error) return res.json(error);
                return res.render('escritorioAdmin', {
                    title: 'Escritorio Administrador | SIGUCA',
                    empleados: empleados, /* Para que envian los empleados?? - para el calendario?*/
                    usuario: req.user,

                });
            });
        } else {
            req.logout();
            res.redirect('/');
        }
    });
  
    app.get('/ayuda', autentificado, function(req, res) {
        if (req.session.name == "Supervisor" || req.session.name == "Administrador"|| req.session.name == "Empleado") {
            res.render('ayuda', {
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
                        return res.render('configuracion', {
                            title: 'Configuración Supervisor | SIGUCA',
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
        if (req.session.name ==="Administrador") {

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
    app.get('/justificaciones', autentificado, function(req, res) { /* No hace nada*/
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
    app.get('/justificacionesAdmin', autentificado, function(req, res) {/* No hace nada*/
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

            Justificacion.find().exec(function(error, justificaciones) {

                if (error) return res.json(error);

                return res.render('justificacionesEmpl', {
                    title: 'Solicitudes/Justificaciones | SIGUCA',
                    justificaciones: justificaciones,
                    usuario: req.user
                });

            });
        } else {
            req.logout();
            res.redirect('/');
        }
    });
    //create Justificacion
    app.post('/justificacion_nueva', autentificado, function(req, res) {
        var d = new Date();
        var epochTime = (d.getTime() - d.getMilliseconds())/1000;
        var fechaActual= new Date(0);
        var e = req.body; 
        var newjustificacion = Justificacion({
            usuario: e.usuario,
            fechaCreada: fechaActual,
            motivo: e.motivo,
            detalle: e.detalle,
            estado: 0,//0 = pendiente
            comentarioSupervisor: ""
        });

        newjustificacion.save(function(error, user) {

            if (error) return res.json(error);

            res.redirect('/justificacionesEmpl');

        });
    });
    app.get('/solicitud_extra', autentificado, function(req, res) {/* No hace nada*/
        res.render('solicitud_extra', {
            title: 'Solicitud Tiempo Extra | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/autoriza_extra', autentificado, function(req, res) {/* No hace nada*/
        res.render('autoriza_extra', {
            title: 'Autorizacion Tiempo Extra | SIGUCA',
            usuario: req.user
        });
    });
    app.get('/autoriza_justificacion', autentificado, function(req, res) {/* No hace nada*/
        res.render('autoriza_justificacion', {
            title: 'Autorizacion Justificacion | SIGUCA',
            usuario: req.user
        });
    });
    //create Horario
    app.post('/horarioN', autentificado, function(req, res) {

        var h = req.body;
        var horarioN = Horario({ /* No ocupa new (?)*/
            nombre: h.nombre,
            horaEntrada: h.horaEntrada,
            horaSalida: h.horaSalida,
            rangoJornada: h.rangoJornada,
            tiempoReceso: h.tiempoReceso,
            tiempoAlmuerzo: h.tiempoAlmuerzo
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
    app.put('/horarioN/:id',autentificado, function(req, res) { /*No lo entiendo cm se relaciona con edit  delete*/

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
    //create marca por sistema
    app.post('/marca', autentificado, function(req, res) {
        var m = req.body;
        var newMarca;
        var d = new Date();
        var epochTime = (d.getTime() - d.getMilliseconds())/1000;
        var fechaActual= new Date(0);
        fechaActual.setUTCSeconds(epochTime);  
        console.log(fechaActual);
        switch (req.body.marca) { //controla el tipo de marca

            case "entrada":
                newMarca = Marca({
                    tipoMarca: "Entrada",
                    epoch: epochTime,
                    codTarjeta: req.user.codTarjeta,
                    fecha: fechaActual
                });

                newMarca.save(function(error, user) {

                    if (error) return res.json(error);

                    res.redirect('/escritorioEmpl');

                });
                break;

            case "salida":
                newMarca = Marca({
                    tipoMarca: "Salida",
                    epoch: epochTime,
                    codTarjeta: req.user.codTarjeta,
                    fecha: fechaActual

                });

                newMarca.save(function(error, user) {

                    if (error) return res.json(error);

                    res.redirect('/escritorioEmpl');

                });
                break;

            case "salidaReceso":

                newMarca = Marca({
                    tipoMarca: "salidaReceso",
                    epoch: epochTime,
                    codTarjeta: req.user.codTarjeta,
                    fecha: fechaActual

                });

                newMarca.save(function(error, user) {

                    if (error) return res.json(error);

                    res.redirect('/escritorioEmpl');

                });
                break;

            case "entradaReceso":

                newMarca = Marca({
                    tipoMarca: "entradaReceso",
                    epoch: epochTime,
                    codTarjeta: req.user.codTarjeta,
                    fecha: fechaActual

                });

                newMarca.save(function(error, user) {

                    if (error) return res.json(error);

                    res.redirect('/escritorioEmpl');

                });
                break;

            case "salidaAlmuerzo":

                newMarca = Marca({
                    tipoMarca: "salidaAlmuerzo",
                    epoch: epochTime,
                    codTarjeta: req.user.codTarjeta,
                    fecha: fechaActual

                });
                newMarca.save(function(error, user) {

                    if (error) return res.json(error);

                    res.redirect('/escritorioEmpl');

                });
                break;

            case "entradaAlmuerzo":

                newMarca = Marca({
                    tipoMarca: "entradaAlmuerzo",
                    epoch: epochTime,
                    codTarjeta: req.user.codTarjeta,
                    fecha: fechaActual

                });

                newMarca.save(function(error, user) {

                    if (error) return res.json(error);

                    res.redirect('/escritorioEmpl');

                });
                break;

            default:
                console.log("hubo un error");
                break;
        }
    });
    //create Justificacion
    app.post('/justificacion', autentificado, function(req, res) { /* No es llamado ---podria servir en justificacion_nueva*/

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
    //create empleado
    app.post('/empleado', autentificado, function(req, res) {
    
            if (req.session.name == "Administrador" || req.session.name == "Supervisor" ) {
                var e = req.body; 

                Usuario.register(new Usuario({

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
                    horario: e.idHorario,
                    }), e.password, function(err, usuario) {
                        console.log('Recibimos nuevo usuario:' + e.username + ' de tipo:' + e.tipo);
                        console.log(e);
                        
                    }
                );

                if (req.session.name == "Administrador"){
                   res.redirect('/configuracionAdmin'); 
                }
                if (req.session.name == "Supervisor"){
                   res.redirect('/configuracion'); 
                }
                
            } else {
                req.logout();
                res.redirect('/');
            }
    });
    //read empleado
    app.get('/empleado', autentificado, function(req, res) {

        console.log('si entra');

        Usuario.find().exec(function(error, empleados) {
            Horario.find().exec(function(error, horarios) {
                Departamento.find().exec(function(error, departamentos) {

                    if (error) return res.json(error);
                    return res.render('empleado', {
                        title: 'Gestionar empleados | SIGUCA',
                        empleados: empleados, 
                        usuario: req.user,
                        horarios: horarios,
                        departamentos: departamentos
                    });
                });
            });
        });
        
    });
    //update empleado
    app.get('/empleado/edit/:id', autentificado, function(req, res) {
        var empleadoId = req.params.id;

        // Usuario.findById(empleadoId, function(error, empleado) { //cambie Empleado por Usuario segun nuevo CRUD

        //     if (error) return res.json(error);

        //     res.render('edit', empleado);

        // });
        
    });
    app.put('/empleado/:id', function(req, res) {/*No lo entiendo cm se relaciona con edit  delete*/

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
    app.post('/departamento',autentificado, function(req, res) {

        var e = req.body;
        var newDepartamento = Departamento({ /*no necesita new ??*/
            nombre: e.nombre
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
    app.put('/departamento/:id',autentificado, function(req, res) {/*No lo entiendo cm se relaciona con edit  delete*/

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



    app.get('/dispositivos', autentificado, function(req, res) { /* No hace nada, para que dispositivos??*/
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