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

    /*
    *   Redirecciona al index
    */
    app.get('/', function (req, res) {
        res.render('index');
    });

    /*
    *   Verifica el login dependiendo del tipo de usuario
    */
    app.post('/login', passport.authenticate('login'), function(req, res) {
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

    /*
    *   Cierra sessión de usuario
    */
    app.get('/logout',autentificado, function(req, res) {
        req.logout();
        res.redirect('/');
    });

    /*
    *  Se cuentan las solicitudes y justificaciones pendientes y se filtran por supervisor
    */
    app.get('/escritorio', autentificado, function(req, res) {
        if (req.session.name == "Supervisor") {
            var diaGte = new Date(),
                diaLt = new Date();
            diaGte.setHours(0);
            diaGte.setMinutes(1);
            diaGte.setSeconds(0);
            diaGte.setMilliseconds(0);
            var epochGte = (diaGte.getTime() - diaGte.getMilliseconds())/1000,
                epochLt = (diaLt.getTime() - diaLt.getMilliseconds())/1000;

            Marca.find({usuario: req.user.id, epoch:{"$gte": epochGte, "$lt": epochLt}},{_id:0,tipoMarca:1,epoch:1}).exec(function(error, marcas) {
                Justificaciones.find({estado:'Pendiente'}).populate('usuario').exec(function(error, justificaciones) {
                    Solicitudes.find({estado:'Pendiente'}).populate('usuario').exec(function(error, solicitudes) {                        
                        Usuario.find({_id:req.user.id},{_id:0,departamentos: 1}).populate('departamentos.departamento').exec(function(error, result){
                            
                            result.forEach(function(supervisor){
                                var arrayMarcas = eventosAjuste(marcas, req.user, "escritorioEmpl");

                                var array = [];
                                for(var y = 0; y < req.user.departamentos.length; y++){
                                    array.push(req.user.departamentos[y].departamento);
                                }

                                just = eventosAjuste(justificaciones, req.user, "count");
                                soli = eventosAjuste(solicitudes, req.user, "count");
                                
                                if (error) return res.json(error);
                                return res.render('escritorio', {
                                    title: 'Escritorio Supervisor | SIGUCA',
                                    departamentos: supervisor.departamentos, 
                                    justificaciones: just, 
                                    solicitudes: soli,
                                    todos: array,
                                    usuario: req.user,
                                    marcas: marcas
                                });
                            });//Supervisor
                        });//Departamentos    
                    });//solicitudes
                });//Justificaciones
            });//Marcas

        } else {
            req.logout();
            res.redirect('/');
        }
    });

    /*
    *  Redirecciona al escritorio del empleado
    */
    app.get('/escritorioEmpl', autentificado, function(req, res) {
        if (req.session.name == "Empleado") {
            var diaGte = new Date(),
                diaLt = new Date();
            diaGte.setHours(0);
            diaGte.setMinutes(1);
            diaGte.setSeconds(0);
            diaGte.setMilliseconds(0);
            var epochGte = (diaGte.getTime() - diaGte.getMilliseconds())/1000,
                epochLt = (diaLt.getTime() - diaLt.getMilliseconds())/1000;

            Marca.find({usuario: req.user.id, epoch:{"$gte": epochGte, "$lt": epochLt}},{_id:0,tipoMarca:1,epoch:1}).exec(function(error, marcas) {
                
                var supervisor = {departamentos: [1]};

                var arrayMarcas = eventosAjuste(marcas, supervisor, "escritorioEmpl");

                if (error) return res.json(error);
                return res.render('escritorioEmpl', {
                    title: 'Escritorio Empleado | SIGUCA',
                    usuario: req.user, 
                    marcas: arrayMarcas
                });
            });
        } else {
            req.logout();
            res.redirect('/');
        }
    });

    /*
    *  Envia los departamentos y horarios al escritorio del administrador, 
    *  para la posterior creación de usuarios 
    */
    app.get('/escritorioAdmin', autentificado, function(req, res) {
        if (req.session.name ==="Administrador") {
            Horario.find().exec(function(error, horarios) {
                Departamento.find().exec(function(error, departamentos) {

                    if (error) return res.json(error);
                    return res.render('escritorioAdmin', {
                        title: 'Escritorio Administrador | SIGUCA',
                        usuario: req.user,
                        horarios: horarios,
                        departamentos: departamentos
                    });
                });
            });
        } else {
            req.logout();
            res.redirect('/');
        }
    });

    /*
    *  Redirecciona a las distintas paginas de ayuda, dependiendo del tipo de usuario
    */
    app.get('/ayuda', autentificado, function(req, res) {
        if (req.session.name == "Supervisor"){
            res.render('ayuda', {
                title: 'Ayuda | SIGUCA',
                usuario: req.user
            });
        } else {
            if(req.session.name == "Administrador"){
                res.render('ayudaAdmin', {
                    title: 'Ayuda | SIGUCA',
                    usuario: req.user
                });
            } else {
                res.render('ayudaEmpl', {
                    title: 'Ayuda | SIGUCA',
                    usuario: req.user
                });
            }
        } 
    });

    /*
    *  Carga las justificaciones, solicitudes de horas extra y solicitudes de permisos pendientes, 
    *  a cada consulta se le realiza la conversion de epoch a la CST Standard.
    */
    app.get('/gestionarEventos', autentificado, function(req, res) {
        if (req.session.name == "Supervisor") {
            Usuario.find({tipo:{"$nin": ['Administrador']}}).exec(function(error, usuarios) {
                Justificaciones.find({estado:'Pendiente'}).populate('usuario').exec(function(error, justificaciones) {
                    Solicitudes.find({tipoSolicitudes:'Extras', estado:'Pendiente'}).populate('usuario').exec(function(error, extras) {
                        Solicitudes.find({tipoSolicitudes:'Permisos', estado:'Pendiente'}).populate('usuario').exec(function(error, permisos) {
                        
                            var arrayDepa = [];
                            req.user.departamentos.forEach(function (departamento){
                                arrayDepa.push(departamento.departamento);
                            });
                            var arrayUsuario = eventosAjuste(usuarios, req.user,"gestionar");
                            var arrayJust = eventosAjuste(justificaciones, req.user,"gestionar");
                            var arrayExtras = eventosAjuste(extras, req.user,"gestionar");
                            var arrayPermisos = eventosAjuste(permisos, req.user,"gestionar");
                           
                            if (error) return res.json(error);
                            return res.render('gestionarEventos', {
                                title: 'Gestionar eventos | SIGUCA',
                                usuario: req.user,
                                justificaciones: arrayJust,
                                extras: arrayExtras,
                                permisos: arrayPermisos,
                                usuarios: arrayUsuario,
                                departamentos: arrayDepa,
                                empleado: 'Todos los usuarios'
                            });//res.render
                        });//Permisos
                    });//Extras
                });//Justificaciones
            });//Usuarios
        } else {
            req.logout();
            res.redirect('/');
        }
    });

    /*
    *  Carga las justificaciones, solicitudes de horas extra y solicitudes de permisos NO pendientes,
    *  a cada consulta se le realiza la conversion de epoch a la CST Standard.
    *  
    */
    app.get('/reportes', autentificado, function(req, res) {
        if (req.session.name == "Supervisor") {
            var diaGte = new Date(),
                diaLt = new Date();
            diaGte.setHours(0);
            diaGte.setMinutes(1);
            diaGte.setSeconds(0);
            diaGte.setMilliseconds(0);
            var epochGte = (diaGte.getTime() - diaGte.getMilliseconds())/1000,
                epochLt = (diaLt.getTime() - diaLt.getMilliseconds())/1000;

            Usuario.find({tipo:{"$nin": ['Administrador']}}).exec(function(error, usuarios) {
                Marca.find({epoch:{"$gte": epochGte, "$lt": epochLt}}).populate('usuario').exec(function(error, marcas) {
                    Justificaciones.find({estado:{"$nin": ['Pendiente']}}).populate('usuario').exec(function(error, justificaciones) {
                        Solicitudes.find({tipoSolicitudes:'Extras', estado:{"$nin": ['Pendiente']}}).populate('usuario').exec(function(error, extras) {
                            Solicitudes.find({tipoSolicitudes:'Permisos', estado:{"$nin": ['Pendiente']}}).populate('usuario').exec(function(error, permisos) {
                            
                                var arrayDepa = [];
                                req.user.departamentos.forEach(function (departamento){
                                    arrayDepa.push(departamento.departamento);
                                });

                                var arrayUsuario = eventosAjuste(usuarios, req.user, "reportes");
                                var arrayJust = eventosAjuste(justificaciones, req.user, "reportes");
                                var arrayExtras = eventosAjuste(extras, req.user, "reportes");
                                var arrayPermisos = eventosAjuste(permisos, req.user, "reportes");
                                var arrayMarcas = eventosAjuste(marcas, req.user, "reportes");
                               
                                if (error) return res.json(error);
                                return res.render('reportes', {
                                    title: 'Reportes | SIGUCA',
                                    usuario: req.user,
                                    justificaciones: arrayJust,
                                    extras: arrayExtras,
                                    permisos: arrayPermisos,
                                    usuarios: arrayUsuario,
                                    departamentos: arrayDepa,
                                    marcas: arrayMarcas,
                                    empleado: 'Todos los usuarios'
                                });//res.render
                            });//Permisos
                        });//Extras
                    });//Marcas
                });//Justificaciones
            });//Usuarios
        } else {
            req.logout();
            res.redirect('/');
        }
    });

    /*
    *  Resultados de configuracion y reportes se filtran por supervisor, finalmente se direcciona a la página 
    *  correspondiente, donde se gestionaran cada uno de los resultados. 
    */
    function eventosAjuste(evento, supervisor, query){
        var notFound = true;
        var array = [];
        var count = 0;

        for(var x = 0; x < evento.length; x++){
            for(var y = 0; y < supervisor.departamentos.length; y++){
                /*
                *   - Busca cada evento en cada departamento, convierte el epoch a fecha estándar
                *    y convierte el epoch de la cantidad de horas a formato hh:mm.
                */
                if("fechaCreada" in evento[x]){
                    var epochTime = evento[x].fechaCreada;
                    var fecha = new Date(0);
                    fecha.setUTCSeconds(epochTime); 
                    evento[x].fecha = fecha;
                }
                if("cantidadHoras" in evento[x]){
                    var  s = evento[x].cantidadHoras;
                    var h  = Math.floor( s / ( 60 * 60 ) );
                        s -= h * ( 60 * 60 );
                    var m  = Math.floor( s / 60 );
                    if(m < 10)
                        evento[x].cantHoras = h + ":0" + m;
                    else
                        evento[x].cantHoras = h + ":" + m;
                    
                } 
                if("epoch" in evento[x]){
                    var epochTime = evento[x].epoch;
                    var fecha = new Date(0);
                    fecha.setUTCSeconds(epochTime);
                    if("escritorioEmpl" === query){
                        evento[x].fecha = fecha.getHours() + ":" + fecha.getMinutes() + ":" + fecha.getSeconds();
                    } else{
                        evento[x].fecha = fecha;
                    }
                }

                if("eventosEmpl" != query && "filtrarEventosEmpl" != query && "escritorioEmpl" != query){
                    if("usuario" in evento[x]){
                        /*
                        *   - Si el evento y el departamento coinciden y además el evento y el supervisor
                        *   no coinciden, muestra el evento.
                        *   - Si el evento es de un supervisor y no coinciden el evento y el supervisor,
                        *   muestra el evento.
                        */
                        if(JSON.stringify(evento[x].usuario.departamentos[0].departamento) === JSON.stringify(supervisor.departamentos[y].departamento) 
                            && JSON.stringify(evento[x].usuario._id) != JSON.stringify(supervisor._id)
                            && notFound){
                            array.push(evento[x]);
                            count++;
                            notFound = false;
                        } 
                        if(JSON.stringify(evento[x].usuario.tipo) === JSON.stringify("Supervisor") 
                            && JSON.stringify(evento[x].usuario._id) != JSON.stringify(supervisor._id)
                            && notFound){
                            array.push(evento[x]);
                            count++;
                            notFound = false;
                        }
                    } else {
                        /*
                        *   - Filtra los usuarios por supervisor, sin mostrarse el mismo.
                        *   - Se utiliza en los reportes.
                        */
                        if(JSON.stringify(evento[x].departamentos[0].departamento) === JSON.stringify(supervisor.departamentos[y].departamento) 
                            && JSON.stringify(evento[x]._id) != JSON.stringify(supervisor._id)
                            && notFound){
                            array.push(evento[x]);
                            notFound = false;
                        } 
                        if(JSON.stringify(evento[x].tipo) === JSON.stringify("Supervisor") 
                            && JSON.stringify(evento[x]._id) != JSON.stringify(supervisor._id)
                            && notFound){
                            array.push(evento[x]);
                            notFound = false;
                        }
                    }
                } else {
                    array.push(evento[x]);
                }
            }//for
            notFound = true;
        }//for
        if("count" === query){
            return count;
        }
        return array;
    }

    /*
    *   - Filtra los eventos por usuario y rango de fecha. 
    *   - Dependiendo si es reporte o gestión de eventos, filtra los eventos por distintos estados.
    */
    app.post('/filtrarEventos', autentificado, function(req, res) {
        if (req.session.name == "Supervisor") {

            var usuarios = req.body.filtro;
            var option = usuarios.split('|');
            
            var opt = option[1].split(',');
            var arrayDepa = [];
                for (var i = 0; i < opt.length; i++) {
                    arrayDepa.push({departamento:opt[i]});
                };

            var supervisor = {
                _id: option[0],
                departamentos: arrayDepa
            } 
            
            usuarioId = option[2];
            
            var justQuery = {};
            var extraQuery = {tipoSolicitudes:'Extras'};
            var permisosQuery = {tipoSolicitudes:'Permisos'};
            var marcaQuery = {};

            if(usuarioId != "todos"){
                justQuery.usuario = usuarioId;
                extraQuery.usuario = usuarioId;
                permisosQuery.usuario = usuarioId;
                marcaQuery.usuario = usuarioId;
            } 
            var epochDesde, epochHasta;
            if(req.body.fechaDesde != '' && req.body.fechaHasta != ''){
                var splitDate1 = req.body.fechaDesde.split('/');
                var date1 = new Date(splitDate1[2], splitDate1[1]-1, splitDate1[0]);
                var epochDesde = (date1.getTime() - date1.getMilliseconds())/1000;

                var splitDate2 = req.body.fechaHasta.split('/');
                var date2 = new Date(splitDate2[2], splitDate2[1]-1, splitDate2[0]);
                var epochHasta = (date2.getTime() - date2.getMilliseconds())/1000;

                var fechaCreada = {
                    "$gte": epochDesde, 
                    "$lt": epochHasta
                }

                justQuery.fechaCreada = fechaCreada;
                extraQuery.fechaCreada = fechaCreada;
                permisosQuery.fechaCreada = fechaCreada;  
            } else {
                var diaGte = new Date(),
                    diaLt = new Date();
                diaGte.setHours(0);
                diaGte.setMinutes(1);
                diaGte.setSeconds(0);
                diaGte.setMilliseconds(0);
                epochDesde = (diaGte.getTime() - diaGte.getMilliseconds())/1000;
                epochHasta = (diaLt.getTime() - diaLt.getMilliseconds())/1000;
            }

             marcaQuery.epoch = {"$gte": epochDesde, "$lt": epochHasta};

            var titulo;
            if(option[3] === "reportes"){
                var estado = {
                    "$nin": ['Pendiente']
                }
                justQuery.estado = estado;
                extraQuery.estado = estado;
                permisosQuery.estado = estado;
                titulo = 'Reportes | SIGUCA';
            } else {
                var estado = 'Pendiente';
                justQuery.estado = estado;
                extraQuery.estado = estado;
                permisosQuery.estado = estado;
                titulo = 'Gestionar eventos | SIGUCA';
            }

            Usuario.find({tipo:{"$nin": ['Administrador']}}).exec(function(error, usuarios) {
                Marca.find(marcaQuery).populate('usuario').exec(function(error, marcas) {
                    Justificaciones.find(justQuery).populate('usuario').exec(function(error, justificaciones) {
                        Solicitudes.find(extraQuery).populate('usuario').exec(function(error, extras) {
                            Solicitudes.find(permisosQuery).populate('usuario').exec(function(error, permisos) {
                               
                                var arrayUsuario = eventosAjuste(usuarios, supervisor, "filtro")
                                var arrayJust = eventosAjuste(justificaciones, supervisor, "filtro");
                                var arrayExtras = eventosAjuste(extras, supervisor, "filtro");
                                var arrayPermisos = eventosAjuste(permisos, supervisor, "filtro");
                                var arrayMarcas = eventosAjuste(marcas, supervisor, "filtro");
                               
                                var filtro = {
                                    title: titulo,
                                    usuario: req.user,
                                    justificaciones: arrayJust,
                                    extras: arrayExtras,
                                    permisos: arrayPermisos,
                                    usuarios: arrayUsuario,
                                    departamentos: option[1],
                                    marcas: arrayMarcas
                                };

                                if(usuarioId != "todos"){
                                    Usuario.find({"_id":usuarioId},{"nombre":1, "apellido1":1,"apellido2":1, "_id":0}).exec(function(error, usuario) {
                                        filtro.empleado = usuario[0].apellido1 + ' ' + usuario[0].apellido2 + ', ' + usuario[0].nombre;
                                        
                                        if (error) return res.json(error);
                                        return (option[3] === "reportes") ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro); 
                                    });
                                } else {
                                    filtro.empleado = 'Todos los usuarios';

                                    if (error) return res.json(error);
                                    return (option[3] === "reportes") ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro); 
                                }
                            });//Permisos
                        });//Extras
                    });//Justificaciones
                });//Marcas
            });//Usuarios 
        } else {
            req.logout();
            res.redirect('/');
        } 
    });

    /*
    *  Redirecciona a la configuración de empleado
    */
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

    /*
    *  Carga los eventos realizados por un empleado en específico
    */
    app.get('/eventosEmpl', autentificado, function(req, res) {
        if (req.session.name != "Administrador") {
            Justificaciones.find({usuario: req.user.id}).exec(function(error, justificaciones) {
                Solicitudes.find({usuario: req.user.id, tipoSolicitudes:'Extras'}).exec(function(error, extras) {
                    Solicitudes.find({usuario: req.user.id, tipoSolicitudes:'Permisos'}).exec(function(error, permisos) {

                        var supervisor = {departamentos: [1]};

                        var arrayJust = eventosAjuste(justificaciones,supervisor,"eventosEmpl");
                        var arrayExtras = eventosAjuste(extras,supervisor,"eventosEmpl");
                        var arrayPermisos = eventosAjuste(permisos,supervisor,"eventosEmpl");

                        if (error) return res.json(error);
                            if(req.session.name == "Empleado"){
                                return res.render('eventosEmpl', {
                                    title: 'Solicitudes/Justificaciones | SIGUCA',
                                    usuario: req.user,
                                    justificaciones: arrayJust,
                                    extras: arrayExtras,
                                    permisos: arrayPermisos
                                });
                            } else {
                                return res.render('eventos', {
                                    title: 'Solicitudes/Justificaciones | SIGUCA',
                                    usuario: req.user,
                                    justificaciones: arrayJust,
                                    extras: arrayExtras,
                                    permisos: arrayPermisos
                                });
                            }
                    });
                });
            });
            
        } else {
            req.logout();
            res.redirect('/');
        }
    });

    /*
    *  Filtra los eventos de un usuario en específico por rango de fecha
    */
    app.post('/filtrarEventosEmpl', autentificado, function(req, res) {
        if (req.session.name != "Administrador") {
            
            var justQuery = {usuario: req.user.id};
            var extraQuery = {usuario: req.user.id, tipoSolicitudes:'Extras'};
            var permisosQuery = {usuario: req.user.id, tipoSolicitudes:'Permisos'};

            if(req.body.fechaDesde != '' && req.body.fechaHasta != ''){
                var splitDate1 = req.body.fechaDesde.split('/');
                var date1 = new Date(splitDate1[2], splitDate1[1]-1, splitDate1[0]);
                var epochDesde = (date1.getTime() - date1.getMilliseconds())/1000;

                var splitDate2 = req.body.fechaHasta.split('/');
                var date2 = new Date(splitDate2[2], splitDate2[1]-1, splitDate2[0]);
                var epochHasta = (date2.getTime() - date2.getMilliseconds())/1000;

                var fechaCreada = {
                    "$gte": epochDesde, 
                    "$lt": epochHasta
                }

                justQuery.fechaCreada = fechaCreada;
                extraQuery.fechaCreada = fechaCreada;
                permisosQuery.fechaCreada = fechaCreada;  
            } 
            Justificaciones.find(justQuery).exec(function(error, justificaciones) {
                Solicitudes.find(extraQuery).exec(function(error, extras) {
                    Solicitudes.find(permisosQuery).exec(function(error, permisos) {
                        
                        var supervisor = {departamentos: [1]};

                        var arrayJust = eventosAjuste(justificaciones,supervisor,"filtrarEventosEmpl");
                        var arrayExtras = eventosAjuste(extras,supervisor,"filtrarEventosEmpl");
                        var arrayPermisos = eventosAjuste(permisos,supervisor,"filtrarEventosEmpl");

                        if (error) return res.json(error);
                        if(req.session.name == "Empleado"){
                            return res.render('eventosEmpl', {
                                title: 'Solicitudes/Justificaciones | SIGUCA',
                                usuario: req.user,
                                justificaciones: arrayJust,
                                extras: arrayExtras,
                                permisos: arrayPermisos
                            });
                        } else {
                            return res.render('eventos', {
                                title: 'Solicitudes/Justificaciones | SIGUCA',
                                usuario: req.user,
                                justificaciones: arrayJust,
                                extras: arrayExtras,
                                permisos: arrayPermisos
                            });//render
                        }//else
                    });//Permisos
                });//Extras
            });//Justificaciones
        } else {
            req.logout();
            res.redirect('/');
        }
    });

    /*
    *  Crea una justificación
    */
    app.post('/justificacion_nueva', autentificado, function(req, res) {
        var d = new Date();
        var epochTime = (d.getTime() - d.getMilliseconds())/1000;
        var e = req.body; 
        var newjustificacion = Justificaciones({
            usuario: req.user.id,
            fechaCreada: epochTime,
            detalle: e.detalle,
            comentarioSupervisor: ""
        });

        if(e.motivoJust == 'otro')
            newjustificacion.motivo = e.motivoOtroJust;
        else
            newjustificacion.motivo = e.motivoJust;
        newjustificacion.save(function(error, user) {

            if (error) return res.json(error);

            if (req.session.name == "Empleado") {

                res.redirect('/escritorioEmpl');
            } else res.redirect('/escritorio');

        });
    });

    /*
    *  Crea una solicitud tipo hora extra
    */
    app.post('/solicitud_extra', autentificado, function(req, res) {
        var d = new Date();
        var epochTime = (d.getTime() - d.getMilliseconds())/1000; 
        var e = req.body; 

        var hmsInicio = e.horaInicio; 
        var aInicio = hmsInicio.split(':'); 
        var sInicio = (+aInicio[0]) * 60 * 60 + (+aInicio[1]) * 60 + 00; 

        var hmsFinal = e.horaFinal; 
        var aFinal = hmsFinal.split(':'); 
        var sFinal = (+aFinal[0]) * 60 * 60 + (+aFinal[1]) * 60 + 00; 

        var cantHoras = sFinal - sInicio;

        var newSolicitud = Solicitudes({
            fechaCreada: epochTime,
            tipoSolicitudes: "Extras",
            diaInicio: e.diaInicio,
            horaInicio: e.horaInicio,
            horaFinal: e.horaFinal,
            cantidadHoras: cantHoras,
            motivo: e.motivo,
            usuario: req.user.id,
            comentarioSupervisor: ""
        });
        newSolicitud.save(function(error, user) {

            if (error) return res.json(error);

            if (req.session.name == "Empleado") {

                res.redirect('/escritorioEmpl');
            } else res.redirect('/escritorio');

        });
    });

    /*
    *  Crea una solicitud tipo permiso anticipado
    */
    app.post('/solicitud_permisos', autentificado, function(req, res) {
        var d = new Date();
        var epochTime = (d.getTime() - d.getMilliseconds())/1000; 
        var e = req.body; 

        var date1 = new Date(e.diaInicio);
        var date2 = new Date(e.diaFinal);
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        

        var newSolicitud = Solicitudes({
            fechaCreada: epochTime,
            tipoSolicitudes: "Permisos",
            diaInicio: e.diaInicio,
            diaFinal: e.diaFinal,
            cantidadDias: e.cantidadDias,
            detalle: e.detalle,
            usuario: req.user.id,
            comentarioSupervisor: ""
        });
        if(e.motivo == 'otro')
            newSolicitud.motivo = e.motivoOtro;
        else
            newSolicitud.motivo = e.motivo;
        newSolicitud.save(function(error, user) {

            if (error) return res.json(error);

            if (req.session.name == "Empleado") {

                res.redirect('/escritorioEmpl');
            } else res.redirect('/escritorio');

        });
    });

    /*
    *  Actualiza el estado y el comentario del supervisor a una solicitud en específico
    */
    app.post('/getionarSolicitud/:id', autentificado, function(req, res) {
        var solicitud = req.body,
            solicitudId = req.params.id;

        delete solicitud.id;
        delete solicitud._id;

        Solicitudes.findByIdAndUpdate(solicitudId, {estado: solicitud.estado, comentarioSupervisor: solicitud.comentarioSupervisor}, function(error, solicitudes) { 

            if (error) return res.json(error);

            res.redirect('/gestionarEventos');

        });
    });

    /*
    *  Actualiza el estado y el comentario del supervisor a una justificacion en específico
    */
    app.post('/getionarJustificacion/:id', autentificado, function(req, res) {
        var justificacion = req.body,
            justificacionId = req.params.id;

        delete justificacion.id;
        delete justificacion._id;

        Justificaciones.findByIdAndUpdate(justificacionId, {estado: justificacion.estado, comentarioSupervisor: justificacion.comentarioSupervisor}, function(error, justificaciones) { 

            if (error) return res.json(error);

            res.redirect('/gestionarEventos');

        });
    });

    /*
    *  Crea un nuevo horario
    */
    app.post('/horarioN', autentificado, function(req, res) {

        var h = req.body;
        var horarioN = Horario({ 
            nombre: h.nombre,
            tipo: h.tipo,
            horaEntrada: h.horaEntrada,
            horaSalida: h.horaSalida,
            rangoJornada: h.rangoJornada,
            tiempoReceso: h.tiempoReceso,
            tiempoAlmuerzo: h.tiempoAlmuerzo
        });
        horarioN.save(function(error, user) {

            if (error) res.json(error);
            if (req.session.name == "Administrador") {

                res.redirect('/escritorioAdmin');
            } 

        });
    });

    /*
    *  Lista todos los horarios creados
    */
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

    /*
    *  Carga los datos de un horario en específico
    */
    app.get('/horarioN/editHorario/:id', autentificado, function(req, res) { 
        var horarioId = req.params.id;

        Horario.findById(horarioId, function(error, horario) {

            if (error) return res.json(error);
            
            res.render('editHorario', {
                title: 'Editar Horario | SIGUCA',
                horario: horario,
                usuario: req.user});

        });
    });

    /*
    *  Actualiza los datos de un horario en específico
    */
    app.post('/horarioN/:id',autentificado, function(req, res) { 

        var horario = req.body,
            horarioId = req.params.id;

        delete horario.id;
        delete horario._id;

        Horario.findByIdAndUpdate(horarioId, horario, function(error, horarios) {

            if (error) return res.json(error);

            res.redirect('/horarioN');

        });
    });

    /*
    *  Elimina un horario en específico
    */
    app.get('/horarioN/deleteHorario/:id', autentificado, function(req, res) {

        var horarioId = req.params.id;


        Horario.findByIdAndRemove(horarioId, function(error, horarios) {

            if (error) return res.json(error);

            res.redirect('/horarioN');

        });
    });

    /*
    *  Crea una nueva marca vía página web
    */
    app.post('/marca', autentificado, function(req, res) {
        var d = new Date();
        var epochTime = (d.getTime() - d.getMilliseconds())/1000;
        var fechaActual= new Date(0);
        fechaActual.setUTCSeconds(epochTime); 
        var newMarca = Marca({
                    tipoMarca: req.body.marca,
                    epoch: epochTime,
                    usuario: req.user.id,
                    fecha: fechaActual
                });
        newMarca.save(function(error, user) {

            if (error) return res.json(error);

            if(req.session.name == "Empleado"){
                res.redirect('/escritorioEmpl');
            } else {
                res.redirect('/escritorio')
            }

        });
    });

    /*
    *  Crea un nuevo usuario
    */
    app.post('/empleado', autentificado, function(req, res) {
    
        if (req.session.name == "Administrador") {
            var e = req.body; 
            var array = [];
            
            if(e.idDepartamento instanceof Array){
                for( var i in e.idDepartamento){
                   array.push({departamento: e.idDepartamento[i]}); 
                }
            } else {
                array.push({departamento: e.idDepartamento});
            }

            Usuario.findOne({ 'username' :  e.username }, function(err, user) {
                if (err) return res.json(error);
                if (!user) {
                    var newUser = new Usuario({
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
                    });

                    newUser.password = Usuario.generateHash(e.password);

                    newUser.save(function(err) {
                        if (err) return res.json(error);
                        
                    });//Crea Usuario
                }
            });//Busca Usuario
            if (req.session.name == "Administrador"){
               res.redirect('/escritorioAdmin'); 
            }
        } else {
            req.logout();
            res.redirect('/');
        }
    });

    /*
    *  Lista todos los usuarios creados
    */
    app.get('/empleado', autentificado, function(req, res) {

        Usuario.find().populate('departamentos.departamento').populate('horario').exec(function(error, empleados){
            if (error) return res.json(error);
            return res.render('empleado', {
                title: 'Gestionar empleados | SIGUCA',
                empleados: empleados, 
                usuario: req.user
            });
        });        
    });

    /*
    *  Carga los datos de un usuario en específico, además los horarios y departamentos creados
    */
    app.get('/empleado/edit/:id', autentificado, function(req, res) {
        var empleadoId = req.params.id;

        Usuario.findById(empleadoId, function(error, empleado) { 
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

    /*
    *  Actualiza los datos de un usuario en específico
    */
    app.post('/empleado/:id', function(req, res) {

        var empleadoId = req.params.id,
            empleado = req.body;

        delete empleado.id;
        delete empleado._id;
        delete empleado.password;

        empleado.password = Usuario.generateHash(req.body.password);
        var array = [];
        if(empleado.departamentos instanceof Array && empleado.tipo == "Supervisor"){
            for( var i in req.body.departamentos){
                array.push({departamento:req.body.departamentos[i]});
            }
        } else {
            array.push({departamento:req.body.departamentos});
        }
        empleado.departamentos = array;

        Usuario.findByIdAndUpdate(empleadoId, empleado, function(error, empleados) { 

            if (error) console.log(error);
            else console.log("Se actualizo con exito");

            res.redirect('/empleado');

        });
    });

    /*
    *  Modifica el estado de Activo a Inactivo de un usuario en específico
    */
    app.get('/empleado/delete/:id', autentificado, function(req, res) {

        var empleadoId = req.params.id;

        Usuario.findByIdAndUpdate(empleadoId, {estado:'Inactivo'}, function(error, empleados) { 

            if (error) return res.json(error);

            res.redirect('/empleado');

        });
    });

    /*
    *  Crea un nuevo departamento
    */
    app.post('/departamento',autentificado, function(req, res) {

        var e = req.body;
        var newDepartamento = Departamento({ 
            nombre: e.nombre
        });
        newDepartamento.save(function(error, user) {

            if (error) res.json(error);
            if (req.session.name == "Administrador") {

                res.redirect('/escritorioAdmin');
            }
        });
    });

    /*
    *  Lista todos los departamentos creados
    */
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

    /*
    *  Carga los datos de un departamento en específico
    */
    app.get('/departamento/editDepartamento/:id', autentificado, function(req, res) {
        var departamentoId = req.params.id;

        Departamento.findById(departamentoId, function(error, departamento) {

            if (error) return res.json(error);

            res.render('editDepartamento', {
                title: 'Editar Departamento | SIGUCA',
                departamento: departamento,
                usuario: req.user
            });

        });
    });

    /*
    *  Actualiza los datos de un departamento en específico
    */
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

    /*
    *  Elimina un departamento en específico
    */
    app.get('/departamento/deleteDepartamento/:id', autentificado, function(req, res) {

        var departamentoId = req.params.id;


        Departamento.findByIdAndRemove(departamentoId, function(error, departamentos) {

            if (error) return res.json(error);

            res.redirect('/departamento');

        });
    });

    /*
    *  En caso de tener varias sedes, se pueden crear dispositivos para especificar en cual
    *  sede se crearon las marcas manuales.
    */
    app.get('/dispositivos', autentificado, function(req, res) { 
        res.render('dispositivos', {
            title: 'Dispositivos | SIGUCA',
            usuario: req.user
        });
    });

    /*
    *   Verifica si el usuario es valido, utiliza una función de passport
    */
    function autentificado(req, res, next) {
        // Si no esta autentificado en la sesion, que prosiga con el enrutamiento 
        if (req.isAuthenticated())
            return next();

        // redireccionar al home en caso de que no
        res.redirect('/');
    }

    /*
    *   Cambia el username de los usuarios
    */
    app.post('/cambioUsername/:id', autentificado, function(req, res) {
        var userId = req.params.id;

        var user = {};
        user.username = req.body.username;

        Usuario.findByIdAndUpdate(userId, user, function(error, user) { 
            if (error) return res.json(error);
            res.redirect('/configuracionEmpl');
        });
    });

    /*
    *   Cambia la contraseña de los usuarios
    */
    app.post('/cambioPassword/:id', autentificado, function(req, res) {
        var userId = req.params.id,
            currentPassword = Usuario.generateHash(req.body.currentPassword);

        Usuario.findById(userId, function(error, user){
            if(!user.validPassword(currentPassword)){
                if(req.body.newPassword != "" && req.body.newPassword != null && req.body.newPassword === req.body.repeatNewPassword){
                    
                    var user = {};
                    user.password = Usuario.generateHash(req.body.newPassword);

                    Usuario.findByIdAndUpdate(userId, user, function(error, user) { 
                        if (error) return res.json(error);
                        console.log("Se actualizo la contraseña con exito");
                    });
                } else console.log("Nueva contraseña inválida.");
            } else console.log("Contraseña inválida.");
        });
        res.redirect('/configuracionEmpl');
    });


    /*
    *   Detalla los eventos del calendario por día.
    */
    app.get('/reportarEventos', autentificado, function(req, res) {
        if (req.session.name == "Supervisor") {
            var diaGte = new Date(req.query.dia);
            var diaLt = new Date(diaGte);
            diaLt.setDate(diaGte.getDate() + 1);

            var epochGte = (diaGte.getTime() - diaGte.getMilliseconds())/1000,
                epochLt = (diaLt.getTime() - diaLt.getMilliseconds())/1000;

            var option = req.query.departamentoId.split(',');
            if(option[1] == "todos"){
                var or = [];
                for (var i = 2; i < option.length; i++) {
                    or.push({departamento:option[i]});
                };
                var queryOr = {
                    "tipo": "General",
                    "$or": or,
                    "epoch":{
                        "$gte": epochGte, 
                        "$lt": epochLt
                    }
                }
                Cierre.find(queryOr).exec(function(err, cierres) {
                    var justificaciones = 0,
                        solicitudes = 0,
                        marcas = 0;
                    for(var i = 0; i < cierres.length; i++){
                            justificaciones += cierres[i].justificaciones;
                            solicitudes += cierres[i].solicitudes;
                            marcas += cierres[i].marcas;
                    }

                    if (err) console.log('error al cargar los cierres: ' + err);
                    else {
                        res.send(
                            '<tr><td> Justificaciones </td><td>' + justificaciones+  '</td></tr>' +
                            '<tr><td> Solicitudes </td><td>' + solicitudes +  '</td></tr>' +
                            '<tr><td> Ausencias o Tardías </td><td>' + marcas + '</td></tr>'
                        );
                    }
                });
            } else {
                Cierre.find({tipo: "General", departamento: option[1], epoch:{"$gte": epochGte, "$lt": epochLt}}).exec(function(err, cierres) {
                    var justificaciones = 0,
                        solicitudes = 0,
                        marcas = 0;
                    for(var i = 0; i < cierres.length; i++){
                            justificaciones += cierres[i].justificaciones;
                            solicitudes += cierres[i].solicitudes;
                            marcas += cierres[i].marcas;
                    }

                    if (err) console.log('error al cargar los cierres: ' + err);
                    else {
                        res.send(
                            '<tr><td> Justificaciones </td><td>' + justificaciones+  '</td></tr>' +
                            '<tr><td> Solicitudes </td><td>' + solicitudes +  '</td></tr>' +
                            '<tr><td> Ausencias o Tardías </td><td>' + marcas + '</td></tr>'
                        );
                    }
                });
            }
        } else {
            req.logout();
            res.redirect('/');
        }
    });

    /*
    *   A una hora determinada de lunes a sábado se crearán los estados de cierre general 
    *   por cada departamento y los estados de cierre personales por cada usuario.
    *   ****************************************************************************
    *   Se utiliza MapReduce de mongoDB para simular los joins de SQL.
    *   Los map filtraran cada collection. El emit consiste en enviar 2 valores,
    *       El primero indicara cual sera la llave primaria de la nueva collection, el 
    *       segundo incica cuales son los field de cada collection que se enviarán.
    *   Los reduce organizarán cada emit realizado por los maps.
    *   ****************************************************************************
    *   Para crear los cierres personales se necesita organizar el resultado por usuario,
    *   pero por el modelo de base de datos, primero se organizan los usuarios por horario. 
    *   De esta manera se obtienen la hora y minutos de inicio de jornada, seguidamente se 
    *   organizan las justificaciones, solicitudes y marcas por usuario; se valora si el 
    *   usuario presenta una tardía o una ausencia. Finalmente se crea un cierre por cada 
    *   usuario.
    *   Para crear los cierres generales se necesita organizar el resultado por departamento,
    *   por lo tanto se utiliza el mismo resultado de los cierres personales, pero en esta 
    *   ocación emplea el método Aggregate de mongoDB, el cual organizá las collections a 
    *   gusto del desarrollador. Finalmente se crea un cierre por cada departamento.
    */
    var job = new CronJob({ 
        cronTime: '00 00 23 * * 0-6',//'00 00 23 * * 0-6',
        onTick: function() {
            // Runs every weekday
            // at 12:00:00 AM.
            var today = new Date(),
                yesterday = new Date(today);
            yesterday.setDate(today.getDate()-1);

            var epochToday = (today.getTime() - today.getMilliseconds())/1000,
                epochYesterday = (yesterday.getTime() - yesterday.getMilliseconds())/1000;

            var mapJustificacion = function () {
                var output= {
                    detalle:this.detalle
                }
                emit(this.usuario, output);
            };
            var mapSolicitud = function () {
                var output= {
                    diaInicio: this.diaInicio
                }
                emit(this.usuario, output);
            };
            var mapMarca = function () {
                if(this.tipoMarca === 'Entrada'){
                    var output= {
                        epochEntrada: this.epoch
                    }
                    emit(this.usuario, output);
                } else {
                    var output= {
                        epochSalida: this.epoch
                    }
                    emit(this.usuario, output);
                }
            };
            var mapHorario = function () {
                if(this.tipo === 'Fijo'){
                    var split = this.horaEntrada.split(':');
                    var output= {
                        hora: split[0],
                        min: split[1],
                        tipo: this.tipo
                    }
                    emit(this._id, output);
                } else {
                    var split = this.rangoJornada.split(':');
                    var output= {
                        hora: split[0],
                        min: split[1],
                        tipo: this.tipo
                    }
                    emit(this._id, output);
                }
            };
            var mapUsuario = function() {
                var values = {
                    departamentos: this.departamentos,
                    _id: this._id,
                    count: 0
                };
                emit(this.horario, values);
            };
            var mapHoraUs = function() {
                for (var x = 0; x < this.value.count; x++){
                    emit(this.value.usuario[x]._id, {hora: this.value.hora, min: this.value.min, tipo: this.value.tipo, departamento: this.value.usuario[x].departamentos[this.value.usuario[x].count].departamento}); 
                }
            };
            var reduceHoraUsuario =  function(k, values) {
                var result = {};
                values.forEach(function(value) {
                var field;
                    if ("departamentos" in value) {
                        if (!("usuario" in result)) {
                            result.usuario = [];
                        }
                        result.usuario.push(value);
                        if (!("count" in result)) {
                            result.count = 0;
                        }
                        result.count += 1;
                    } else {
                          for (field in value) {
                              if (value.hasOwnProperty(field) ) {
                                      result[field] = value[field];
                              }//if
                          };//for 
                    }//else
                });
                return result;
            };
            var reduceJustUsuario =  function(k, values) {
                var result = {};
                values.forEach(function(value) {
                var field;
                    if ("detalle" in value) {
                        if (!("justificaciones" in result)) {
                            result.justificaciones = 0;
                        }
                        result.justificaciones += 1;
                    } else {
                        if ("diaInicio" in value) {
                            if (!("solicitudes" in result)) {
                                result.solicitudes = 0;
                            }
                            result.solicitudes += 1;
                        } else {
                            for (field in value) {
                                if (value.hasOwnProperty(field) ) {
                                    result[field] = value[field];
                                }//if
                            };//for 
                        }//2do else
                   }//else
                });
                return result;
            };

            var o = {};
            o.map = mapHorario;
            o.reduce = reduceHoraUsuario;
            o.out = {"reduce": "Auxiliar"};
            Horario.mapReduce(o);

            o.map = mapUsuario;
            o.query = {"tipo": {"$nin": ["Administrador"]}, "estado": "Activo"};

            Usuario.mapReduce(o, function (err, Auxiliar) {
                var o = {};
                o.map = mapHoraUs;
                o.reduce = reduceJustUsuario;
                o.out = {"reduce": "Temporal"};
                Auxiliar.mapReduce(o);

                o.map = mapMarca;
                o.query = {tipoMarca:{"$in": ["Entrada", "Salida"]}, epoch:{"$gte": epochYesterday, "$lt": epochToday}};
                Marca.mapReduce(o);

                o.map = mapSolicitud;
                o.query = {fechaCreada:{"$gte": epochYesterday, "$lt": epochToday}, estado:{"$nin": ['Aceptada']}};
                Solicitudes.mapReduce(o);

                o.map = mapJustificacion;
                Justificaciones.mapReduce(o, function (err, Temporal) {

                    Temporal.find().exec(function (err, temporal){
                        temporal.forEach(function (usuario){
                            var cierrePersonal = {
                                usuario: usuario._id,
                                departamento: usuario.value.departamento,
                                epoch: epochToday,
                                tipo: "Personal"
                            }
                            if("justificaciones" in usuario.value){
                                cierrePersonal.justificaciones = usuario.value.justificaciones;
                            } else cierrePersonal.justificaciones = 0
                            if("solicitudes" in usuario.value){
                                cierrePersonal.solicitudes = usuario.value.solicitudes;
                            } else cierrePersonal.solicitudes = 0;

                            cierrePersonal.marcas = 0;
                            if("marcas" in usuario.value){
                                if(usuario.tipo === 'Fijo'){
                                    var epochTime = usuario.epochEntrada;
                                    var fechaEpoch= new Date(0);
                                    fechaEpoch.setUTCSeconds(epochTime);  
                                    var hora = fechaEpoch.getHours();
                                    var min = fechaEpoch.getMinutes();
                                    var sInicio = (+horaEntrada) * 60 * 60 + (+minEntrada) * 60 + 00; 
                                    var sHorarioEntrada = (+usuario.hora) * 60 * 60 + (+usuario.minutos) * 60 + 00; 

                                    if(sHorarioEntrada < sInicio){
                                        cierrePersonal.marcas += 1;   
                                    }//if
                                } else {
                                    var epochEntrada = user.epochEntrada;
                                    var fechaEntrada= new Date(0);
                                    fechaEntrada.setUTCSeconds(epochEntrada);  
                                    var horaEntrada = fechaEntrada.getHours();
                                    var minEntrada = fechaEntrada.getMinutes();
                                    var sInicio = (+horaEntrada) * 60 * 60 + (+minEntrada) * 60 + 00; 

                                    var epochSalida = user.epochSalida;
                                    var fechaSalida= new Date(0);
                                    fechaSalida.setUTCSeconds(epochSalida);  
                                    var horaSalida = fechaSalida.getHours();
                                    var minSalida = fechaSalida.getMinutes();
                                    var sFinal = (+horaSalida) * 60 * 60 + (+minSalida) * 60 + 00; 

                                    var seg = sFinal - sInicio;

                                    var sJornada = (+user.hora) * 60 * 60 + (+user.minutos) * 60 + 00; 
                                    if(sJornada > seg){
                                        estado += 1;   
                                    }//if
                                }
                            } else cierrePersonal.marcas = 1;

                            cierrePersonal.estado = cierrePersonal.justificaciones + cierrePersonal.solicitudes + cierrePersonal.marcas;;
                            var newCierre = Cierre(cierrePersonal);

                            newCierre.save(function(error, user) {

                                if (error) console.log(error);
                                else console.log("exito al guardar cierre personal");
                            });
                        });
                    });
                    var pipeline = [
                        {
                            "$group" : {
                                "_id" : "$value.departamento",
                                "justificaciones" : {
                                    "$sum" : "$value.justificaciones"
                                },
                                "solicitudes" : {
                                    "$sum" : "$value.solicitudes"
                                },
                                "usuarios" : {
                                    "$push" : {
                                        "marcaEntrada" : "$value.epochEntrada",
                                        "marcaSalida" : "$value.epochSalida",
                                        "hora" : "$value.hora",
                                        "minutos" : "$value.min",
                                        "tipo" : "$value.tipo"
                                    }
                                }
                            }
                        }
                    ];
                    Temporal.aggregate(pipeline).exec(function (err, temporal){
                        temporal.forEach(function (departamento){
                            var estado = 0;
                            departamento.usuarios.forEach(function (user){
                                if("marca" in user){
                                    if(user.tipo === 'Fijo'){
                                        var epochTime = user.epochEntrada;
                                        var fechaEpoch= new Date(0);
                                        fechaEpoch.setUTCSeconds(epochTime);  
                                        var hora = fechaEpoch.getHours();
                                        var min = fechaEpoch.getMinutes();
                                        var sInicio = (+horaEntrada) * 60 * 60 + (+minEntrada) * 60 + 00; 
                                        var sHorarioEntrada = (+user.hora) * 60 * 60 + (+user.minutos) * 60 + 00; 

                                        if(sHorarioEntrada < sInicio){
                                            estado += 1;   
                                        }//if
                                    } else {
                                        var epochEntrada = user.epochEntrada;
                                        var fechaEntrada= new Date(0);
                                        fechaEntrada.setUTCSeconds(epochEntrada);  
                                        var horaEntrada = fechaEntrada.getHours();
                                        var minEntrada = fechaEntrada.getMinutes();
                                        var sInicio = (+horaEntrada) * 60 * 60 + (+minEntrada) * 60 + 00; 

                                        var epochSalida = user.epochSalida;
                                        var fechaSalida= new Date(0);
                                        fechaSalida.setUTCSeconds(epochSalida);  
                                        var horaSalida = fechaSalida.getHours();
                                        var minSalida = fechaSalida.getMinutes();
                                        var sFinal = (+horaSalida) * 60 * 60 + (+minSalida) * 60 + 00; 

                                        var seg = sFinal - sInicio;

                                        var sJornada = (+user.hora) * 60 * 60 + (+user.minutos) * 60 + 00; 
                                        if(sJornada > seg){
                                            estado += 1;   
                                        }//if
                                    }
                                } else {
                                    estado += 1;
                                } 
                            });//for each usuario
                            
                            var marcas = estado;
                            estado += departamento.justificaciones;
                            estado += departamento.solicitudes;

                            var newCierre = Cierre({
                                        estado: estado,
                                        epoch: epochToday,
                                        departamento: departamento,
                                        justificaciones: departamento.justificaciones,
                                        solicitudes: departamento.solicitudes,
                                        marcas: marcas 
                                    });

                            newCierre.save(function(error, user) {

                                if (error) console.log(error);
                                else console.log("exito al guardar");
                            });//cierre
                            epochToday++;
                        });// for each departamento
                    });//Aggregate
                 });//MapReduce
            });//mapReduce
                     
        }, //funcion
        start: false,
        timeZone: "America/Costa_Rica"
    });
    job.start();

    /*
    *   Envia los resultados de los cierres a la función calendario.
    *   Se inicia la conexión.
    */
    io.sockets.on('connection', function(socket){
        /*
        *   Emitimos nuestro evento connected
        */
        socket.emit('connected');

        /*
        *   Recibe la orden de lista y filtra cierres por tipo de usuario
        */
        socket.on('listar', function (departamentoId){
            var option = departamentoId.split(',');
            if(option[0] == "Supervisor")
                listarSupervisor(departamentoId);
            else
                listarEmpleado(departamentoId);
        });

        /*
        *   Filtra cierres por departamento
        */
        function listarSupervisor(departamentoId){
            var option = departamentoId.split(',');
            if(option[1] == "todos"){
                var or = [];
                for (var i = 2; i < option.length; i++) {
                    or.push({departamento:option[i]});
                };
                var queryOr = {
                    "tipo": "General",
                    "$or": or
                }
                Cierre.find(queryOr).exec(function(err, cierre) {
                    if (err) console.log('error al cargar los cierres: ' + err);
                    else {
                        socket.emit('listaCierre', cierre);
                    }
                });
            } else {
                Cierre.find({tipo: "General", departamento: option[1]}).exec(function(err, cierre) {
                    if (err) console.log('error al cargar los cierres: ' + err);
                    else {
                        socket.emit('listaCierre', cierre);
                    }
                });
            }
        }

        /*
        *   Filtra cierres por evento (justificaciones, solicitudes y marcas)
        */
        function listarEmpleado(departamentoId){
            var option = departamentoId.split(',');
            Cierre.find({usuario: option[2]}).exec(function(err, cierre) {
                if (err) console.log('error al cargar los cierres: ' + err);
                else {
                    console.log('consulta sin errores');
                    var result = {
                        cierre: cierre
                    }
                    if(option[1] == "todos"){
                        result.tipo = "general";
                    } else {
                        if(option[1] == "justificaciones")
                            result.tipo = "justificaciones";
                        else {
                            if(option[1] == "solicitudes")
                                result.tipo = "solicitudes";
                            else
                                result.tipo = "marcas";
                        }
                    }
                    socket.emit('listaCierreEmpleado', result);  
                }
            });
        }
    });//io.sockets

};//modules