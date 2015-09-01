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
/*var Temporal = require('../models/Temporal');
var Auxiliar = require('../models/Auxiliar');*/
var Cierre = require('../models/Cierre');
var CronJob = require('cron').CronJob;
var nodemailer = require('nodemailer');
var moment = require('moment');
var crud = require('./crud');

var emailSIGUCA = 'siguca@greencore.co.cr';

module.exports = function(app, io) {

/*
*   Redirecciona al index
*/
    app.get('/', function (req, res) {
        res.render('index', {
            usuario: req.user
        });
    });

/*
*   Verifica el login dependiendo del tipo de usuario
*/
    app.post('/login', passport.authenticate('login', 
            {
                failureRedirect: '/'
            }
        ), 
        function (req, res) {
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
        }
    );


/*
*   Cierra sessión de usuario
*/
    app.get('/logout',autentificado, function (req, res) {
        req.logout();
        res.redirect('/');
    });

/*
*  Se cuentan las solicitudes y justificaciones pendientes y se filtran por supervisor
*/
    app.get('/escritorio', autentificado, function (req, res) {
        if (req.session.name == "Supervisor") {
            var epochGte = moment().hours(0).minutes(0).seconds(0);

            var epochYesterday = moment().subtract(1, 'days').hours(23).minutes(59).seconds(59);

            Marca.find({usuario: req.user.id, epoch:{"$gte": epochGte.unix()}},{_id:0,tipoMarca:1,epoch:1}).exec(function(error, marcas) {
                Justificaciones.find({estado:'Pendiente'}).populate('usuario').exec(function(error, justificaciones) {
                    Solicitudes.find({estado:'Pendiente'}).populate('usuario').exec(function(error, solicitudes) {                        
                        Usuario.find({_id:req.user.id},{_id:0,departamentos: 1}).populate('departamentos.departamento').exec(function(error, result){
                            Cierre.find({usuario: req.user.id, epoch:{"$gte": epochYesterday.unix() }},{_id:0,horasSemanales:1}).exec(function(err, cierres) {

                                result.forEach(function(supervisor){
                                    var sup = {departamentos: [1]};
                                    
                                    var arrayMarcas = eventosAjuste(marcas, sup, "escritorioEmpl");

                                    var array = [];
                                    for(var y = 0; y < req.user.departamentos.length; y++){
                                        array.push(req.user.departamentos[y].departamento);
                                    }

                                    just = eventosAjuste(justificaciones, req.user, "count");
                                    soli = eventosAjuste(solicitudes, req.user, "count");
                                    
                                    var horasSemanales;
                                    (epochGte.day() === 1) ? horasSemanales = 0 : (cierres.length == 0) ? horasSemanales = '' : horasSemanales = cierres[0].horasSemanales;

                                    if (error) return res.json(error);
                                    return res.render('escritorio', {
                                        title: 'Escritorio Supervisor | SIGUCA',
                                        departamentos: supervisor.departamentos, 
                                        justificaciones: just, 
                                        solicitudes: soli,
                                        todos: array,
                                        usuario: req.user,
                                        marcas: marcas,
                                        horasSemanales: horasSemanales
                                    });
                                });//Supervisor
                            });//Horas Semanales
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
    app.get('/escritorioEmpl', autentificado, function (req, res) {
        if (req.session.name == "Empleado") {
            var epochGte = moment();
            epochGte.hours(0);
            epochGte.minutes(0);
            epochGte.seconds(0);

            Marca.find({usuario: req.user.id, epoch:{"$gte": epochGte.unix()}},{_id:0,tipoMarca:1,epoch:1}).exec(function(error, marcas) {
                
                var supervisor = {departamentos: [1]};

                var arrayMarcas = eventosAjuste(marcas, supervisor, "escritorioEmpl");

                if (error) return res.json(error);
                return res.render('escritorio', {
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
    app.get('/escritorioAdmin', autentificado, function (req, res) {
        if (req.session.name ==="Administrador") {
            Horario.find().exec(function(error, horarios) {
                Departamento.find().exec(function(error, departamentos) {

                    if (error) return res.json(error);
                    return res.render('escritorio', {
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
* 
*  para la posterior creación de usuarios 
*/
    app.get('/rfidReader', function (req, res) {
        //pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta=123&tipoMarca=6
        var pwd1 = req.param('pwd1');
        var pwd2 = req.param('pwd2');
        var codTarjeta = req.param('codTarjeta');
        var tipoMarca = req.param('tipoMarca');
        if(pwd1 == 'ooKa6ieC' && pwd2 == 'of2Oobai' ) {
            crud.rfidReader(codTarjeta, tipoMarca, function (msj) {
                console.log(msj);
                res.send(msj);
            });
        }
    });

/*
*  Redirecciona a las distintas páginas de ayuda, dependiendo del tipo de usuario
*/
    app.get('/ayuda', autentificado, function (req, res) {
        res.render('ayuda', {
            title: 'Ayuda | SIGUCA',
            usuario: req.user
        });
    });

/*
*  Carga las justificaciones, solicitudes de horas extra y solicitudes de permisos pendientes, 
*  a cada consulta se le realiza la conversion de epoch a la CST Standard.
*/
    app.get('/gestionarEventos', autentificado, function (req, res) {
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
    app.get('/reportes', autentificado, function (req, res) {
        if (req.session.name == "Supervisor") {
            var epochGte = moment().hours(0).minutes(0).seconds(0);
            var inicioMes = moment().date(1);//primer dia del mes

            Usuario.find({tipo:{"$nin": ['Administrador']}}).exec(function(error, usuarios) {
                Marca.find({epoch:{"$gte": epochGte.unix()}}).populate('usuario').exec(function(error, marcas) {
                    Justificaciones.find({estado:{"$nin": ['Pendiente']}}).populate('usuario').exec(function(error, justificaciones) {
                        Solicitudes.find({tipoSolicitudes:'Extras', estado:{"$nin": ['Pendiente']}}).populate('usuario').exec(function(error, extras) {
                            Solicitudes.find({tipoSolicitudes:'Permisos', estado:{"$nin": ['Pendiente']}}).populate('usuario').exec(function(error, permisos) {
                                Usuario.find({_id:req.user.id},{_id:0,departamentos: 1}).populate('departamentos.departamento').exec(function(error, supervisor){
                                    Cierre.find({tipo: 'Personal', epoch: {'$gte' : inicioMes.unix()}}).populate('usuario').exec(function(error, cierres) {
                                        var array = [];
                                        for(var y = 0; y < req.user.departamentos.length; y++){
                                            array.push(req.user.departamentos[y].departamento);
                                        }

                                        var arrayUsuario = eventosAjuste(usuarios, req.user, "reportes");
                                        var arrayJust = eventosAjuste(justificaciones, req.user, "reportes");
                                        var arrayExtras = eventosAjuste(extras, req.user, "reportes");
                                        var arrayPermisos = eventosAjuste(permisos, req.user, "reportes");
                                        var arrayMarcas = eventosAjuste(marcas, req.user, "reportes");
                                        var arrayCierres = eventosAjuste(cierres, {departamentos: [1]}, "reportes");
                                       
                                        if (error) return res.json(error);
                                        return res.render('reportes', {
                                            title: 'Reportes | SIGUCA',
                                            usuario: req.user,
                                            justificaciones: arrayJust,
                                            extras: arrayExtras,
                                            permisos: arrayPermisos,
                                            usuarios: arrayUsuario,
                                            departamentos: supervisor[0].departamentos,
                                            todos: array, 
                                            marcas: arrayMarcas,
                                            empleado: 'Todos los usuarios',
                                            horasSemanales: cierres
                                        });//res.render

                                    });//HorasSemanales
                                });//Supervisor
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
                        var m = fecha.getMinutes(),
                            s = fecha.getSeconds();

                        evento[x].fecha = fecha.getHours();
                        m < 10 ? evento[x].fecha += ":0" + m : evento[x].fecha += ":" + m ;
                        s < 10 ? evento[x].fecha += ":0" + s : evento[x].fecha += ":" + s ;
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
                        if("reportes" == query){
                            if(JSON.stringify(evento[x].usuario.departamentos[0].departamento) === JSON.stringify(supervisor.departamentos[y].departamento) 
                                && notFound){
                                array.push(evento[x]);
                                count++;
                                notFound = false;
                            } 
                            if(JSON.stringify(evento[x].usuario.tipo) === JSON.stringify("Supervisor") 
                                && notFound){
                                array.push(evento[x]);
                                count++;
                                notFound = false;
                            }
                        } else {
                            if(JSON.stringify(evento[x].usuario.departamentos[0].departamento) === JSON.stringify(supervisor.departamentos[y].departamento) 
                                && JSON.stringify(evento[x].usuario._id) != JSON.stringify(supervisor._id) && notFound){
                                array.push(evento[x]);
                                count++;
                                notFound = false;
                            } 
                            if(JSON.stringify(evento[x].usuario.tipo) === JSON.stringify("Supervisor") 
                                && JSON.stringify(evento[x].usuario._id) != JSON.stringify(supervisor._id) && notFound){
                                array.push(evento[x]);
                                count++;
                                notFound = false;
                            }
                        }
                    } else {
                        /*
                        *   - Filtra los usuarios por supervisor, sin mostrarse el mismo.
                        *   - Se utiliza en los reportes.
                        */
                        if("reportes" == query){
                            if(JSON.stringify(evento[x].departamentos[0].departamento) === JSON.stringify(supervisor.departamentos[y].departamento) 
                                && notFound){
                                array.push(evento[x]);
                                notFound = false;
                            } 
                            if(JSON.stringify(evento[x].tipo) === JSON.stringify("Supervisor") 
                                && notFound){
                                array.push(evento[x]);
                                notFound = false;
                            }
                        } else {
                            if(JSON.stringify(evento[x].departamentos[0].departamento) === JSON.stringify(supervisor.departamentos[y].departamento) 
                                && JSON.stringify(evento[x]._id) != JSON.stringify(supervisor._id) && notFound){
                                array.push(evento[x]);
                                notFound = false;
                            } 
                            if(JSON.stringify(evento[x].tipo) === JSON.stringify("Supervisor") 
                                && JSON.stringify(evento[x]._id) != JSON.stringify(supervisor._id) && notFound){
                                array.push(evento[x]);
                                notFound = false;
                            }
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
    app.post('/filtrarEventos', autentificado, function (req, res) {
        if (req.session.name == "Supervisor") {

            var usuarios = req.body.filtro;
            var option = usuarios.split('|');

            usuarioId = option[0];
            
            var justQuery = {};
            var extraQuery = {tipoSolicitudes:'Extras'};
            var permisosQuery = {tipoSolicitudes:'Permisos'};
            var marcaQuery = {};
            var cierresQuery = {tipo: 'Personal'};

            if(usuarioId != 'todos'){
                justQuery.usuario = extraQuery.usuario = permisosQuery.usuario = marcaQuery.usuario = cierresQuery.usuario = usuarioId;
            } 
            var epochDesde, epochHasta;
            if(req.body.fechaDesde != '' && req.body.fechaHasta != ''){
                var splitDate1 = req.body.fechaDesde.split('/');
                var date1 = new Date(splitDate1[2], splitDate1[1]-1, splitDate1[0]);
                var epochDesde = (date1.getTime() - date1.getMilliseconds())/1000;

                var splitDate2 = req.body.fechaHasta.split('/');
                var date2 = new Date(splitDate2[2], splitDate2[1]-1, parseInt(splitDate2[0])+1);
                var epochHasta = (date2.getTime() - date2.getMilliseconds())/1000;

                var fechaCreada = {
                    '$gte': epochDesde, 
                    '$lte': epochHasta
                }

                justQuery.fechaCreada = extraQuery.fechaCreada = permisosQuery.fechaCreada =  cierresQuery.epoch = fechaCreada;  

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

             marcaQuery.epoch = {'$gte': epochDesde, '$lte': epochHasta};

            var titulo, estado;
            if(option[1] === 'reportes'){
                estado = {
                    '$nin': ['Pendiente']
                }
                titulo = 'Reportes | SIGUCA';
            } else {
                estado = 'Pendiente';
                titulo = 'Gestionar eventos | SIGUCA';
            }
            justQuery.estado = estado;
            extraQuery.estado = estado;
            permisosQuery.estado = estado;

            Usuario.find({tipo:{'$nin': ['Administrador']}}).exec(function(error, usuarios) {
                Marca.find(marcaQuery).populate('usuario').exec(function(error, marcas) {
                    Justificaciones.find(justQuery).populate('usuario').exec(function(error, justificaciones) {
                        Solicitudes.find(extraQuery).populate('usuario').exec(function(error, extras) {
                            Solicitudes.find(permisosQuery).populate('usuario').exec(function(error, permisos) {
                                Usuario.find({_id:req.user.id},{_id:0,departamentos: 1}).populate('departamentos.departamento').exec(function(error, supervisor){
                                    Cierre.find(cierresQuery).populate('usuario').exec(function (err, cierres) { 

                                        var array = [];
                                        for(var y = 0; y < req.user.departamentos.length; y++){
                                            array.push(req.user.departamentos[y].departamento);
                                        }
                                        var arrayUsuario = eventosAjuste(usuarios, req.user, 'reportes')
                                        var arrayJust = eventosAjuste(justificaciones, req.user, 'reportes');
                                        var arrayExtras = eventosAjuste(extras, req.user, 'reportes');
                                        var arrayPermisos = eventosAjuste(permisos, req.user, 'reportes');
                                        var arrayMarcas = eventosAjuste(marcas, req.user, 'reportes');
                                        var arrayCierres = eventosAjuste(cierres, req.user, 'reportes');

                                        var filtro = {
                                            title: titulo,
                                            usuario: req.user,
                                            justificaciones: arrayJust,
                                            extras: arrayExtras,
                                            permisos: arrayPermisos,
                                            usuarios: arrayUsuario,
                                            departamentos: supervisor[0].departamentos,
                                            todos: array,
                                            marcas: arrayMarcas,
                                            horasSemanales: cierres
                                        };


                                        if(usuarioId != 'todos'){
                                            console.log(usuarioId)
                                            Usuario.find({'_id':usuarioId}).exec(function(error, usuario) {
                                                if (error) return res.json(error);
                                                console.log(usuario)
                                                filtro.empleado = usuario[0].apellido1 + ' ' + usuario[0].apellido2 + ', ' + usuario[0].nombre;
                                                return (option[1] === 'reportes') ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro); 
                                            });
                                        } else {
                                            filtro.empleado = 'Todos los usuarios';

                                            if (error) return res.json(error);
                                            return (option[1] === 'reportes') ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro); 
                                        }
                                    });//Cierres
                                });//Supervisor
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
    app.get('/configuracion', autentificado, function (req, res) {
        res.render('configuracion', {
            title: 'Configuración | SIGUCA',
            usuario: req.user
        });
    });

/*
*  Carga los eventos realizados por un empleado en específico
*/
    app.get('/eventos', autentificado, function (req, res) {
        var inicioMes = moment().date(1);
        if (req.session.name != "Administrador") {
            Marca.find({usuario: req.user.id, epoch: {'$gte' : inicioMes.unix()}}).exec(function(error, marcas) {
                Justificaciones.find({usuario: req.user.id}).exec(function(error, justificaciones) {
                    Solicitudes.find({usuario: req.user.id, tipoSolicitudes:'Extras'}).exec(function(error, extras) {
                        Solicitudes.find({usuario: req.user.id, tipoSolicitudes:'Permisos'}).exec(function(error, permisos) {

                            var supervisor = {departamentos: [1]};

                            var arrayMarcas = eventosAjuste(marcas,supervisor,"eventosEmpl");
                            var arrayJust = eventosAjuste(justificaciones,supervisor,"eventosEmpl");
                            var arrayExtras = eventosAjuste(extras,supervisor,"eventosEmpl");
                            var arrayPermisos = eventosAjuste(permisos,supervisor,"eventosEmpl");


                            if (error) return res.json(error);
                                
                            return res.render('eventos', {
                                title: 'Solicitudes/Justificaciones | SIGUCA',
                                usuario: req.user,
                                justificaciones: arrayJust,
                                extras: arrayExtras,
                                permisos: arrayPermisos,
                                marcas: marcas
                            });
                        });
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
    app.post('/filtrarEventosEmpl', autentificado, function (req, res) {
        if (req.session.name != "Administrador") {
            
            var marcaQuery = {usuario: req.user.id};
            var justQuery = {usuario: req.user.id};
            var extraQuery = {usuario: req.user.id, tipoSolicitudes:'Extras'};
            var permisosQuery = {usuario: req.user.id, tipoSolicitudes:'Permisos'};

            if(req.body.fechaDesde != '' && req.body.fechaHasta != ''){
                var splitDate1 = req.body.fechaDesde.split('/');
                var date1 = new Date(splitDate1[2], splitDate1[1]-1, splitDate1[0]);
                var epochDesde = (date1.getTime() - date1.getMilliseconds())/1000;

                var splitDate2 = req.body.fechaHasta.split('/');
                var date2 = new Date(splitDate2[2], splitDate2[1]-1, parseInt(splitDate2[0])+1);
                var epochHasta = (date2.getTime() - date2.getMilliseconds())/1000;

                var fechaCreada = {
                    "$gte": epochDesde, 
                    "$lt": epochHasta
                }

                marcaQuery.epoch = {"$gte": epochDesde, "$lt": epochHasta};
                justQuery.fechaCreada = fechaCreada;
                extraQuery.fechaCreada = fechaCreada;
                permisosQuery.fechaCreada = fechaCreada;  
            } 
            Marca.find(marcaQuery).exec(function(error, marcas) {
                Justificaciones.find(justQuery).exec(function(error, justificaciones) {
                    Solicitudes.find(extraQuery).exec(function(error, extras) {
                        Solicitudes.find(permisosQuery).exec(function(error, permisos) {
                            
                            var supervisor = {departamentos: [1]};

                            var arrayMarcas = eventosAjuste(marcas,supervisor,"eventosEmpl");
                            var arrayJust = eventosAjuste(justificaciones,supervisor,"filtrarEventosEmpl");
                            var arrayExtras = eventosAjuste(extras,supervisor,"filtrarEventosEmpl");
                            var arrayPermisos = eventosAjuste(permisos,supervisor,"filtrarEventosEmpl");

                            if (error) return res.json(error);
                            return res.render('eventos', {
                                title: 'Solicitudes/Justificaciones | SIGUCA',
                                usuario: req.user,
                                justificaciones: arrayJust,
                                extras: arrayExtras,
                                permisos: arrayPermisos,
                                marcas: marcas
                            });//render
                        });//Permisos
                    });//Extras
                });//Justificaciones
            });
        } else {
            req.logout();
            res.redirect('/');
        }
    });

/*
*  Crea una justificación
*/
    app.post('/justificacion_nueva', autentificado, function (req, res) {
        var just = req.body; 
        just.id = req.user.id;
        crud.addJust(just, function (){
            if (req.session.name == "Empleado") {
                res.redirect('/escritorioEmpl');
            } else res.redirect('/escritorio');
        });//verificar
    });

/*
*  Carga la información de una justificación
*/
    app.get('/justificacion/edit/:id', autentificado, function (req, res) {
        crud.loadJust(req.params.id, function(just) { 
            res.json(just);
        }); 
    });

/*
*  Actualiza una justificación
*/
    app.post('/justificacion/:id', autentificado, function (req, res) {
        var just = req.body; 
        just.id = req.params.id;
        crud.updateJust(just, function (err){
            res.redirect('/eventos');
        });
    });

/*
*  El supervisor elimina una justificación y se le envia un correo al dueño de la justificación
*/
    app.get('/justificacion/delete/:id', autentificado, function (req, res) {
        var id = req.params.id;
        crud.deleteJust(id, function (err, msj) {
            if(err) res.json(err);
            else res.send(msj);
        });
    });

/*
*  Crea una solicitud tipo hora extra
*/
    app.post('/solicitud_extra', autentificado, function (req, res) {
        var extra = req.body; 
        extra.id = req.user.id;
        crud.addExtra(extra, function(){
            if (req.session.name == "Empleado") {
                res.redirect('/escritorioEmpl');
            } else res.redirect('/escritorio');
        });
    });

/*
*  Carga la información de una solicitud tipo hora extra
*/
    app.get('/solicitud/edit/:id', autentificado, function (req, res) {
        crud.loadSoli(req.params.id, function(soli) { 
            res.json(soli);
        }); 
    });

/*
*  Actualiza una solicitud tipo hora extra
*/
    app.post('/extra/:id', autentificado, function (req, res) {
        var extra = req.body;
        extra.id = req.params.id;
        crud.updateExtra(extra, function (err) { 
            res.redirect('/eventos');
        });
    });

/*
*  Crea una solicitud tipo permiso anticipado
*/
    app.post('/solicitud_permisos', autentificado, function (req, res) {
        var permiso = req.body; 
        permiso.usuario = req.user;
        crud.addPermiso(permiso, function (){
            if (req.session.name == "Empleado") {
                res.redirect('/escritorioEmpl');
            } else res.redirect('/escritorio');  
        });
    });

/*
*  Actualiza una solicitud tipo permiso anticipado
*/
    app.post('/permiso/:id', autentificado, function (req, res) {
        var permiso = req.body;
        permiso.id = req.params.id;
        crud.updatePermiso(permiso, function (err) { 
            res.redirect('/eventos');
        });
    });

/*
*  El supervisor elimina una solicitud y se le envia un correo al dueño de la solicitud
*/
    app.get('/solicitud/delete/:id', autentificado, function (req, res) {
        crud.deleteSoli(req.params.id, function (err, msj) { 
            if (err) res.json(err);
            else res.send(msj);
        });
    });

/*
*  Actualiza el estado y el comentario del supervisor a una solicitud en específico
*/
    app.post('/getionarSolicitudAjax/:id', autentificado, function (req, res) {
        var solicitud = req.body;
        solicitud.id = req.params.id;
        if(solicitud.estado != 'Pendiente') {
            crud.gestionarSoli(solicitud, function (err, msj) { 
                if (err) res.json(err);
                else res.send(msj);
            });
        } else {
            res.send('');
        }
    });

/*
*  Actualiza el estado y el comentario del supervisor a una justificacion en específico
*/
    app.post('/getionarJustificacionAjax/:id', autentificado, function (req, res) {
        var justificacion = req.body;
        justificacion.id = req.params.id;
        if(justificacion.estado != 'Pendiente') {
            crud.gestionarJust(justificacion, function (err, msj) { 
                if (err) res.json(err);
                else res.send(msj);
            });
        } else {
            res.send('');
        }
    });

/*
*  Crea un nuevo horario
*/
    app.post('/horarioN', autentificado, function (req, res) {
        crud.addHorario(req.body, function() {
            if (req.session.name == "Administrador") {
                res.redirect('/escritorioAdmin');
            } 
        });
    });

/*
*  Lista todos los horarios creados
*/
    app.get('/horarioN', autentificado, function (req, res) {
        crud.listHorario(function (err, horarios) {
            if (err) return res.json(err);
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
    app.get('/horarioN/editHorario/:id', autentificado, function (req, res) { 
        crud.loadHorario(req.params.id, function (err, horario) {
            if (err) return res.json(err);
            else res.json(horario);
        });
    });

/*
*  Actualiza los datos de un horario en específico
*/
    app.post('/horarioN/:id',autentificado, function (req, res) { 
        var data = { horario: req.body, id: req.params.id }
        crud.updateHorario(data, function (err, horarios) {
            if (err) return res.json(err);
            res.redirect('/horarioN');
        });
    });

/*
*  Elimina un horario en específico
*/
    app.get('/horarioN/delete/:id', autentificado, function (req, res) { 
        crud.deleteHorario(req.params.id, function (err, msj) {
            if (err) return res.json(err);
            else res.send(msj);
        });
    });

/*
*  Crea una nueva marca vía página web
*/
    app.post('/marca', autentificado, function (req, res) {
        crud.addMarca({tipoMarca: req.body.marca, usuario: req.user.id}, function(msj){
            if(req.session.name == "Empleado"){
                res.redirect('/escritorioEmpl');
            } else {
                res.redirect('/escritorio')
            }
        });
    });

/*
*  Elimina una marca en específico si fue creada hace menos de 10 minutos
*/
    app.get('/marca/delete/:id', autentificado, function (req, res) {
        crud.deleteMarca(req.params.id, function (msj) {
            res.send(msj);
        });
    });

/*
*  Crea un nuevo usuario
*/
    app.post('/empleado', autentificado, function (req, res) {
        if (req.session.name == "Administrador") {
            crud.addUsuario(req.body, function() {
                if (req.session.name == "Administrador"){
                   res.redirect('/escritorioAdmin'); 
                }
            });//Busca Usuario
        } else {
            req.logout();
            res.redirect('/');
        }
    });

/*
*  Lista todos los usuarios creados
*/
    app.get('/empleado', autentificado, function (req, res) {
        crud.listUsuarios(function (err, render){
            if (err) return res.json(err);
            render.usuario = req.user;
            return res.render('empleado', render);
        });       
    });

/*
*  Carga los datos de un usuario en específico, además los horarios y departamentos creados
*/
    app.get('/empleado/edit/:id', autentificado, function (req, res) {
        Usuario.findById(req.params.id, function (err, empleado) { 
            if (err) return res.json(err);
            else res.json(empleado);
        });        
    });

/*
*  Actualiza los datos de un usuario en específico
*/
    app.post('/empleado/:id', function (req, res) {
        var data = {
            id: req.params.id,
            empleado: req.body
        };
        crud.updateUsuario(data, function() { 
            res.redirect('/empleado');
        });
    });

/*
*  Modifica el estado de Activo a Inactivo de un usuario en específico
*/
    app.get('/empleado/delete/:id', autentificado, function (req, res) {
        crud.deleteUsuario(req.params.id, function (err, msj) { 
            if (err) res.json(err);
            res.send(msj);
        });
    });

/*
*  Crea un nuevo departamento
*/
    app.post('/departamento',autentificado, function (req, res) {
        crud.addDepa(req.body, function() {
            if (req.session.name == "Administrador") {
                res.redirect('/escritorioAdmin');
            }
        });
    });

/*
*  Lista todos los departamentos creados
*/
    app.get('/departamento', autentificado, function (req, res) {
        crud.listDepa(function (err, departamentos) {
            if (err) return res.json(err);
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
    app.get('/departamento/editDepartamento/:id', autentificado, function (req, res) {
        crud.loadDepa(req.params.id, function (departamento) {
            res.json(departamento);
        });
    });

/*
*  Actualiza los datos de un departamento en específico
*/
    app.post('/departamento/:id',autentificado, function (req, res) {
        var data = {
            departamento: req.body,
            id: req.params.id
        };
        crud.updateDepa(data, function() {
            res.redirect('/departamento');
        });
    });

/*
*  Elimina un departamento en específico
*/
    app.get('/departamento/delete/:id', autentificado, function (req, res) {
        crud.deleteDepa(req.params.id, function (msj) {
            res.send(msj);
        });
    });

/*
*  En caso de tener varias sedes, se pueden crear dispositivos para especificar en cual
*  sede se crearon las marcas manuales.
*/
    app.get('/dispositivos', autentificado, function (req, res) { 
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
    app.post('/cambioUsername/:id', autentificado, function (req, res) {
        if(req.session.name != "Administrador"){
            var user = {
                id: req.params.id,
                username: req.body.username
            };
            crud.changeUsername(user, function() { 
                res.redirect('/configuracion');
            });
        }
    });

/*
*   Cambia la contraseña de los usuarios
*/
    app.post('/cambioPassword/:id', autentificado, function (req, res) {
        var user = req.body;
        user.id = req.params.id;
        crud.changePassword(user, function () {
            res.redirect('/configuracion');
        });
    });



/*
*   Detalla los eventos del calendario por día.
*/
    app.get('/reportarEventos', autentificado, function (req, res) {
        var diaGte = new Date(req.query.dia);
        var diaLt = new Date(diaGte);
        diaLt.setDate(diaGte.getDate() + 1);

            Marca.find({usuario: req.user.id, epoch:{"$gte": epochGte, "$lt": epochLt}},{_id:0,tipoMarca:1,epoch:1})
        var epochGte = (diaGte.getTime() - diaGte.getMilliseconds())/1000,
            epochLt = (diaLt.getTime() - diaLt.getMilliseconds())/1000;

        Marca.find({usuario: req.query.id, epoch:{"$gte": epochGte, "$lt": epochLt}},{_id:0,tipoMarca:1,epoch:1}).exec(function (err, marcasPersonales){

            if (req.session.name == "Supervisor") {

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
                            res.json({
                                justificaciones: justificaciones,
                                solicitudes: solicitudes,
                                marcas: marcas,
                                marcasPersonales: marcasPersonales 
                            });
                        }
                    });
                } else {
                    Cierre.find({tipo: "General", departamento: option[1], epoch:{"$gte": epochGte, "$lt": epochLt}}).exec(function(err, cierres) {
                        var justificaciones = 0,
                            solicitudes = 0,
                            marcas = 0;

                        if (err) console.log('error al cargar los cierres: ' + err);
                        else {
                            for(var i = 0; i < cierres.length; i++){
                                    justificaciones += cierres[i].justificaciones;
                                    solicitudes += cierres[i].solicitudes;
                                    marcas += cierres[i].marcas;
                            }
                        }
                        
                        res.json({
                            justificaciones: justificaciones,
                            solicitudes: solicitudes,
                            marcas: marcas,
                            marcasPersonales: marcasPersonales 
                        });
                    });
                }
            } else if (req.session.name == "Empleado") {
                res.json({ marcasPersonales: marcasPersonales });
            } else {
                req.logout();
                res.redirect('/');
            }
        });
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
        cronTime: '59 59 23 * * 1-5', //Lunes a Viernes
        onTick: function() {
            var epochToday = moment().unix(),
                epochYesterday = epochToday - 86400,
                array = [];
            console.log('Entro')
            Cierre.find({tipo: "Personal", epoch: {'$gte': epochYesterday}}).populate('usuario').exec(function (cierresPersonales) {
                var query = { }
                if(cierresPersonales) {
                    query = { estado: "Activo", tipo: {'$nin': ['Administrador']} }
                    console.log('Hay cierres Iniciados')
                    for (var i = 0; i < cierresPersonales.length; i++) {
                        var cierre = cierresPersonales[i];
                        array.push(cierre.usuario._id);
                        if(cierre.etapa == 0) {
                            Justificaciones.find({usuario: cierre.usuario._id, fechaCreada: {'$gte': cierre.epoch}}).count().exec(function (err, just) {
                                Solicitudes.find({usuario: cierre.usuario._id, fechaCreada: {'$gte': cierre.epoch}}).count().exec(function (err, soli) {
                                    Cierre.find({usuario: marca.usuario._id, tipo: 'Personal', etapa: 1}).sort({_id: -1}).limit(1).exec(function (err, cierreAnterior) {
                                        var cierrePersonal = {
                                                marcas : 1,
                                                solicitudes : soli,
                                                justificaciones : just,
                                                estado : just + soli + 1,
                                                etapa : 1,
                                                horasSemanales: 0,
                                                horasDiarias: 0
                                            },
                                            esLunes =  moment(cierre.epoch); 
                                            if(esLunes.day() != 1){
                                                cierrePersonal.horasSemanales = cierreAnterior.horasSemanales;
                                            }
                                        Cierre.findByIdAndUpdate(cierre._id, cierrePersonal, function (err, cierre){
                                            var transporter = nodemailer.createTransport();
                                            transporter.sendMail({
                                                from: emailSIGUCA,
                                                to: cierre.usuario.email,
                                                subject: 'Omisión de marca en SIGUCA',
                                                text: " Estimado(a) " + cierre.usuario.nombre + " " + cierre.usuario.apellido1 + " " + cierre.usuario.apellido2
                                                    + " \r\n El día de hoy omitió realizar la marca de salida, por lo que no "
                                                    + "se pudo calcular las horas trabajadas de este día, favor comunicarse con su "
                                                    + "supervisor y enviar una justificación indicando la hora exacta de salida."
                                                    + " \r\n\r\n Saludos cordiales."
                                            });
                                        });
                                    });
                                });
                            });
                        }
                    };
                } else {
                    query = {_id: {'$nin': array}, estado: "Activo", tipo: {'$nin': ['Administrador']} }
                }
                
                Usuario.find(query).exec(function (err, usuarios) {
                    console.log('Hay Ausentes')
                    for (var i = 0; i < usuarios.length; i++) {
                        console.log(i + ") " + usuarios[i])
                        var usuario = usuarios[i];
                        Justificaciones.find({usuario: usuario._id, fechaCreada: {'$gte': epochYesterday}}).count().exec(function (err, just) {
                            Solicitudes.find({usuario: usuario._id, fechaCreada: {'$gte': epochYesterday}}).count().exec(function (err, soli) {
                                Cierre.find({usuario: usuario._id, tipo: 'Personal', etapa: 1}).sort({_id: -1}).limit(1).exec(function (err, cierreAnterior) {
                                    var newCierre =  new Cierre({
                                        usuario: usuario._id, 
                                        epoch: epochToday, 
                                        departamento: usuario.departamentos[0].departamento, 
                                        tipo: 'Personal',
                                        etapa: 1,
                                        marcas : 1,
                                        solicitudes : soli,
                                        justificaciones : just,
                                        estado : just + soli + 1,
                                        etapa : 1,
                                        horasSemanales: 0,
                                        horasDiarias: 0
                                    }),
                                    esLunes =  moment(epochToday); 
                                    if(esLunes.day() != 1){
                                        newCierre.horasSemanales = cierreAnterior.horasSemanales;
                                    }
                                    newCierre.save();
                                });
                            });
                        });
                    }
                });
            });
            Cierre.find({etapa:0, tipo: "General", epoch: {'$gte': epochYesterday}}, function (err, cierresGenerales){
                console.log('No hay cierres Generales ?')
                if(cierresGenerales) {
                    for (var i = 0; i < cierresGenerales.length; i++) {
                        Cierre.findByIdAndUpdate(cierresGenerales[i]._id, {etapa:1}, function (err, cierre){});
                    };
                }
            });
                  
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
        socket.on('connected', function (){
            var date = new Date();
            var epoch = (date.getTime() - date.getMilliseconds())/1000;
            socket.emit('connected', epoch);
        });
    
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