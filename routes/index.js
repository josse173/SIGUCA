/*
 * GET home page.
 * Rutas
 */

 var mongoose = require('mongoose');
 var nodemailer = require('nodemailer');
 var moment = require('moment');
 var passport = require('passport');

 //**********************************************
 var actions = require('../actions/reportes');
 var admin_actions = require('../actions/admin');
 var event_actions = require('../actions/eventos');
 var horas_actions = require('../actions/horas');
 var tareas_actions = require('../actions/tareas');
 var escritorio_actions = require('../actions/escritorio');
 var justificacion_actions = require('../actions/justificacion');
 //**********************************************

 var crud = require('./crud');
 var util = require('../util/util');
 var ObjectId = mongoose.Types.ObjectId;

//Modelos para el manejo de objetos de la base de datos
var Marca = require('../models/Marca');
var Usuario = require('../models/Usuario');
var Horario = require('../models/Horario');
var Departamento = require('../models/Departamento');
var Justificaciones = require('../models/Justificaciones');
var Solicitudes = require('../models/Solicitudes');
var Cierre = require('../models/Cierre');
/*var Temporal = require('../models/Temporal');
var Auxiliar = require('../models/Auxiliar');*/

var emailSIGUCA = 'siguca@greencore.co.cr';
/*
Marca.find().populate('usuario').exec(
    function(error, just) {
        for(j in just){
            if(!just[j].usuario){
                console.log(just[j].usuario);
                console.log(just[j]._id);
                crud.deleteMarca(just[j]._id, function(err, msg){
                    console.log(msg);
                });
            }
        }
});
*/
module.exports = function(app, io) {
    /*
    *   Redirecciona a la página principal (index.html)
    */
    app.get('/', function (req, res) {
        res.render('index', {
            usuario: req.user
        });
    });

    //******************************************************************************
    /*
    *   Redirecciona a la página necesaria dependiendo del tipo de usuario
    */
    app.post('/login', 
        passport.authenticate('login', {failureRedirect: '/'}), 
        admin_actions.login
        );

    /*
    *   Cierra sessión de usuario
    */
    app.get('/logout',autentificado, admin_actions.logout);


    //******************************************************************************
    /*
    *  Se cuentan las solicitudes y justificaciones pendientes y se filtran por supervisor
    */
    app.get('/escritorio', autentificado, escritorio_actions.escritorio);

    /*
    *  Ruta de la página para empleados regulares
    */
    app.get('/escritorioEmpl', autentificado, escritorio_actions.escritorioEmpl);

    /*
    *  Envia los departamentos y horarios al escritorio del administrador, 
    *  para la posterior creación de usuarios 
    */
    app.get('/escritorioAdmin', autentificado, escritorio_actions.escritorioAdmin);


    //******************************************************************************
    /*
    /*
    *  Carga las justificaciones, solicitudes de horas extra y solicitudes de permisos pendientes, 
    *  a cada consulta se le realiza la conversion de epoch a la CST Standard.
    */
    app.get('/gestionarEventos', autentificado, event_actions.filtrarEventos);

    /*
    *  Carga las justificaciones, solicitudes de horas extra y solicitudes de permisos NO pendientes,
    *  a cada consulta se le realiza la conversión de epoch a la CST Standard.
    *  
    */
    app.get('/reportes', autentificado, event_actions.filtrarEventos);

    app.post('/reportes', autentificado, event_actions.filtrarEventos);

    /*
    *   - Filtra los eventos por usuario y rango de fecha. 
    *   - Dependiendo si es reporte o gestión de eventos, filtra los eventos por distintos estados.
    */
    app.post('/filtrarEventos', autentificado, event_actions.filtrarEventos);

    /*
    *  Carga los eventos realizados por un empleado en específico
    */
    app.get('/eventos', autentificado, event_actions.eventos);

    /*
    *  Filtra los eventos de un usuario en específico por rango de fecha
    */
    app.post('/filtrarEventosEmpl', autentificado, event_actions.filtrarEventosEmpl);


    //******************************************************************************
    /*
    *  Crea una justificación
    */
    app.post('/justificacion_nueva', autentificado, justificacion_actions.nueva);

    /*
    *  Carga la información de una justificación
    */
    app.get('/justificacion/edit/:id', autentificado, justificacion_actions.edit);

    /*
    *  Actualiza una justificación
    */
    app.post('/justificacion/:id', autentificado, justificacion_actions.actualiza);

    /*
    *  El supervisor elimina una justificación y se le envia un correo al dueño de la justificación
    */
    app.get('/justificacion/delete/:id', autentificado, justificacion_actions._delete);


    //******************************************************************************
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
    *  Crea marca desde RFID  
    */
    app.get('/rfidReader', function (req, res) {
            //pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta=123&tipoMarca=6
            var pwd1 = req.param('pwd1');
            var pwd2 = req.param('pwd2');
            var codTarjeta = req.param('codTarjeta');
            var tipoMarca = req.param('tipoMarca');
            if(pwd1 == 'ooKa6ieC' && pwd2 == 'of2Oobai' ) {
                crud.rfidReader(codTarjeta, tipoMarca, function (msj) {
                    res.send(msj);
                });
            }
        });

    /*
    *  Redirecciona a la página de ayuda
    */
    app.get('/ayuda', autentificado, function (req, res) {
        res.render('ayuda', {
            title: 'Ayuda | SIGUCA',
            usuario: req.user
        });
    });


    //******************************************************************************
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

    //******************************************************************************
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

    //******************************************************************************
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
        var data = { horario: req.body, id: req.params.id };
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

    //******************************************************************************
    /*
    *  Crea una nueva marca vía página web
    */
    app.post('/marca', autentificado, function (req, res) {
        crud.addMarca(
            {tipoMarca: req.body.marca, usuario: req.user.id}, function(msj){
                //console.log(msj);
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

    //******************************************************************************
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
        crud.listUsuarios(function (err, listaUsuarios){
            if (err) return res.json(err);
            listaUsuarios.usuario = req.user;
            return res.render('empleado', listaUsuarios);
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

    //******************************************************************************
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

    //******************************************************************************
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
        
    //******************************************************************************
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



    //******************************************************************************
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
        //
    });
    //

    app.get('/dispositivos', autentificado, function (req, res) { 
        res.render('dispositivos', {
            title: 'Dispositivos | SIGUCA',
            usuario: req.username
        });
    });

    app.get('/horas/actualizar', autentificado, horas_actions.horasTrabajadas);


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
                    //console.log('consulta sin errores');
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


//tareas_actions.cronJob.start();
//tareas_actions.jobCierreAutomatico.start();

/*
var fecha = new moment();
console.log(fecha.unix());
fecha.utc().year(2016);
fecha.utc().date(4);
fecha.utc().month(4);
fecha.utc().hours(8);
fecha.utc().minutes(47);
fecha.utc().seconds(17);
console.log(fecha.unix());
console.log(fecha.utc().unix());*/