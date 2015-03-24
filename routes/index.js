
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
var Justificaciones = require('../models/Justificaciones');
var Solicitudes = require('../models/Solicitudes');
var Cierre = require('../models/Cierre');
var CronJob = require('cron').CronJob;


module.exports = function(app, io) {


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
                Justificaciones.find({estado:'Pendiente'}).count().exec(function(error, justificaciones) {
                    Solicitudes.find({estado:'Pendiente'}).count().exec(function(error, solicitudes) {
                       
                        if (error) return res.json(error);
                        return res.render('escritorio', {
                            title: 'Escritorio Supervisor | SIGUCA',
                            empleados: empleados, 
                            justificaciones: justificaciones, 
                            solicitudes: solicitudes,
                            usuario: req.user
                        });
                    });
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
            Justificaciones.find({estado:'Pendiente'}).populate('usuario').exec(function(error, justificaciones) {
                Solicitudes.find({tipoSolicitudes:'Extras', estado:'Pendiente'}).populate('usuario').exec(function(error, extras) {
                    Solicitudes.find({tipoSolicitudes:'Permisos', estado:'Pendiente'}).populate('usuario').exec(function(error, permisos) {

                        justificaciones.forEach(function(justificacion){
                            var epochTime = justificacion.fechaCreada;
                            var fecha= new Date(0);
                            fecha.setUTCSeconds(epochTime); 
                            justificacion.usuario.fechaCreacion = fecha;
                        });//each
                        extras.forEach(function(extra){
                            var epochTime = extra.fechaCreada;
                            var fecha= new Date(0);
                            fecha.setUTCSeconds(epochTime); 
                            extra.usuario.fechaCreacion = fecha;
                        });//each
                        permisos.forEach(function(permiso){
                            var epochTime = permiso.fechaCreada;
                            var fecha= new Date(0);
                            fecha.setUTCSeconds(epochTime); 
                            permiso.usuario.fechaCreacion = fecha;
                        });//each
                        //console.log(justificaciones);
                        if (error) return res.json(error);
                        return res.render('configuracion', {
                            title: 'Configuración | SIGUCA',
                            usuario: req.user,
                            justificaciones: justificaciones,
                            extras: extras,
                            permisos: permisos
                        });
                    });
                });
            });
        } else {
            req.logout();
            res.redirect('/');
        }
    });
    app.get('/configuracionEmpl', autentificado, function(req, res) /* Redirecciona*/{
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
    app.get('/justificaciones', autentificado, function(req, res) { /* Redirecciona*/
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
    //Lista justificaciones a empleado
    app.get('/justificacionesEmpl', autentificado, function(req, res) {
        if (req.session.name == "Empleado") {
            
            Justificaciones.find({usuario: req.user.id}).populate('usuario').exec(function(error, justificaciones) {
                Solicitudes.find({usuario: req.user.id, tipoSolicitudes:'Extras'}).populate('usuario').exec(function(error, extras) {
                    Solicitudes.find({usuario: req.user.id, tipoSolicitudes:'Permisos'}).populate('usuario').exec(function(error, permisos) {

                        justificaciones.forEach(function(justificacion){
                            var epochTime = justificacion.fechaCreada;
                            var fecha= new Date(0);
                            fecha.setUTCSeconds(epochTime); 
                            justificacion.usuario.fechaCreacion = fecha;
                        });//each
                        extras.forEach(function(extra){
                            var epochTime = extra.fechaCreada;
                            var fecha= new Date(0);
                            fecha.setUTCSeconds(epochTime); 
                            extra.usuario.fechaCreacion = fecha;
                        });//each
                        permisos.forEach(function(permiso){
                            var epochTime = permiso.fechaCreada;
                            var fecha= new Date(0);
                            fecha.setUTCSeconds(epochTime); 
                            permiso.usuario.fechaCreacion = fecha;
                        });//each
                        //console.log(justificaciones);
                        if (error) return res.json(error);
                        return res.render('justificacionesEmpl', {
                            title: 'Solicitudes/Justificaciones | SIGUCA',
                            usuario: req.user,
                            justificaciones: justificaciones,
                            extras: extras,
                            permisos: permisos
                        });
                    });
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
        var e = req.body; 
        var newjustificacion = Justificaciones({
            usuario: req.user.id,
            fechaCreada: epochTime,
            motivo: e.motivo,
            detalle: e.detalle,
            comentarioSupervisor: ""
        });
        newjustificacion.save(function(error, user) {

            if (error) return res.json(error);

            res.redirect('/justificacionesEmpl');

        });
    });
    //create solicitud hora extra
    app.post('/solicitud_extra', autentificado, function(req, res) {
        var d = new Date();
        var epochTime = (d.getTime() - d.getMilliseconds())/1000; 
        var e = req.body; 
        var newSolicitud = Solicitudes({
            fechaCreada: epochTime,
            tipoSolicitudes: "Extras",
            diaInicio: e.diaInicio,
            horaFinal: e.horaFinal,
            motivo: e.motivo,
            usuario: req.user.id
        });
        newSolicitud.save(function(error, user) {

            if (error) return res.json(error);

            if (req.session.name == "Empleado") {

                res.redirect('/escritorioEmpl');
            } else res.redirect('/escritorio');

        });
    });
    //create solicitud de permisos
    app.post('/solicitud_permisos', autentificado, function(req, res) {
        var d = new Date();
        var epochTime = (d.getTime() - d.getMilliseconds())/1000; 
        var e = req.body; 
        var newSolicitud = Solicitudes({
            fechaCreada: epochTime,
            tipoSolicitudes: "Permisos",
            diaInicio: e.diaInicio,
            diaFinal: e.diaFinal,
            motivo: e.motivo,
            usuario: req.user.id
        });
        newSolicitud.save(function(error, user) {

            if (error) return res.json(error);

            if (req.session.name == "Empleado") {

                res.redirect('/escritorioEmpl');
            } else res.redirect('/escritorio');

        });
    });
    //update solicitud
    app.post('/getionarSolicitud/:id', autentificado, function(req, res) {
        var solicitud = req.body,
            solicitudId = req.params.id;

        delete solicitud.id;
        delete solicitud._id;

        Solicitudes.findByIdAndUpdate(solicitudId, {estado: solicitud.estado}, function(error, solicitudes) { //cambie Empleado por Usuario segun nuevo CRUD

            if (error) return res.json(error);

            res.redirect('/configuracion');

        });
    });
    //update justificación
    app.post('/getionarJustificacion/:id', autentificado, function(req, res) {
        var justificacion = req.body,
            justificacionId = req.params.id;

        delete justificacion.id;
        delete justificacion._id;

        Justificaciones.findByIdAndUpdate(justificacionId, {estado: justificacion.estado, comentarioSupervisor: justificacion.comentarioSupervisor}, function(error, justificaciones) { //cambie Empleado por Usuario segun nuevo CRUD

            if (error) return res.json(error);

            res.redirect('/configuracion');

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
    //fill form to update Horario
    app.get('/horarioN/editHorario/:id', autentificado, function(req, res) { 
        var horarioId = req.params.id;

        Horario.findById(horarioId, function(error, horario) {

            if (error) return res.json(error);

            res.render('editHorario', horario);

        });
    });
    //update Horario
    app.post('/horarioN/:id',autentificado, function(req, res) { 

        var horario = req.body,
            horarioId = req.params.id;

        delete horario.id;
        delete horario._id;

        console.log(horario);
        console.log(horarioId);

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
                    usuario: req.user.id,
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
                    usuario: req.user.id,
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
                    usuario: req.user.id,
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
                    usuario: req.user.id,
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
                    usuario: req.user.id,
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
                    usuario: req.user.id,
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
    //create empleado
    app.post('/empleado', autentificado, function(req, res) {
    
        if (req.session.name == "Administrador") {
            var e = req.body; 
            var array = [];
            var d = e.idDepartamento;
            
            for( var i in d){
                array.push({departamento:d[i]}); 
            }
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
                departamentos: array,
                horario: e.idHorario,
                }), e.password, function(err, usuario) {
                    console.log('Recibimos nuevo usuario:' + e.username + ' de tipo:' + e.tipo);
                }
            );

            if (req.session.name == "Administrador"){
               res.redirect('/configuracionAdmin'); 
            }
        } else {
            req.logout();
            res.redirect('/');
        }
    });
    //read empleado
    app.get('/empleado', autentificado, function(req, res) {

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
    //fill form to update empleado
    app.get('/empleado/edit/:id', autentificado, function(req, res) {
        var empleadoId = req.params.id;

        Usuario.findById(empleadoId, function(error, empleado) { //cambie Empleado por Usuario segun nuevo CRUD
            Horario.find().exec(function(error, horarios) {
                Departamento.find().exec(function(error, departamentos) {
                    if (error) return res.json(error);

                    res.render('edit', {
                        empleado: empleado, 
                        usuario: req.user,
                        horarios: horarios,
                        departamentos: departamentos
                    });

                });
            });
        });
        
    });
    //update empleado
    app.post('/empleado/:id', function(req, res) {

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

        Usuario.findByIdAndUpdate(empleadoId, {estado:'Inactivo'}, function(error, empleados) { //cambie Empleado por Usuario segun nuevo CRUD

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
    //fill form to update departamento
    app.get('/departamento/editDepartamento/:id', autentificado, function(req, res) {
        var departamentoId = req.params.id;

        Departamento.findById(departamentoId, function(error, departamento) {

            if (error) return res.json(error);

            res.render('editDepartamento', departamento);

        });
    });
    //update departamento
    app.post('/departamento/:id',autentificado, function(req, res) {
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

    app.post('/cambioPassword', function(req, res) {
        Usuario.virtual('password').set(function(password) {
            this._password = password;
            this.salt = this.makeSalt();
            this.hashed_password = this.encryptPassword(password);
        }).get(function() {
            return this._password;
        });
    });

    var job = new CronJob({
        cronTime: '00 48 15 * * 0-6',//'00 00 23 * * 0-6',
        onTick: function() {
            // Runs every weekday
            // at 12:00:00 AM.
            var today = new Date()
                yesterday = new Date(today);
            yesterday.setDate(today.getDate()-1);

            var epochToday = (today.getTime() - today.getMilliseconds())/1000;
            var epochYesterday = (yesterday.getTime() - yesterday.getMilliseconds())/1000;
            
            var estad = 0;//Math.floor(Math.random()*10);
            Justificaciones.find({fechaCreada:{"$gte": epochYesterday, "$lt": epochToday}, estado:{"$nin": ['Aceptada']}}).count().exec(function(error, justificaciones) {
                estad += justificaciones;
                Solicitudes.find({fechaCreada:{"$gte": epochYesterday, "$lt": epochToday}, estado:{"$nin": ['Aceptada']}}).count().exec(function(error, solicitudes) {
                    estad += (solicitudes * 2);
                    Marca.find({epoch:{"$gte": epochYesterday, "$lt": epochToday}, tipoMarca:"Entrada"})
                    .deepPopulate('usuario.horario').exec(function(error, marcaHorario) {
                        marcaHorario.forEach(function(marca){
                            var epochTime = marca.epoch;
                            var fechaActual= new Date(0);
                            fechaActual.setUTCSeconds(epochTime);  
                            var hora = fechaActual.getHours();
                            if(marca.usuario.horario.horaEntrada - hora < 0){
                                estad -= 1;     
                            }//if
                        });//each
                        var newCierre = Cierre({
                                        estado: estad,
                                        epoch: epochToday
                                    });

                        newCierre.save(function(error, user) {

                            if (error) console.log(error);
                            else console.log("exito al guardar");
                        });//cierre
                    });//marcas
                });//solicitudes
            }); //justificaciones
        }, //funcion
        start: false,
        timeZone: "America/Costa_Rica"
    });
    job.start();

    //Iniciamos la conexión.
    io.sockets.on('connection', function(socket){
        //Emitimos nuestro evento connected
        //socket.emit('connected');
        console.log('connected');

        Cierre.find().exec(function(err, cierre) {
            if (err) {
                console.log('error saving user prefs '+err);
            }
            console.log('consulta sin errores');
            //console.log(cierre);
            socket.emit('listaCierre', cierre);
        });

    });

};