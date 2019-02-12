/*
 * GET home page.
 * Rutas
 */
 var fs = require('fs');
 var mongoose = require('mongoose');
 var nodemailer = require('nodemailer');
 var moment = require('moment');
 var passport = require('passport');
 var enviarCorreo = require('../config/enviarCorreo');

 //**********************************************
 var admin_actions = require('../actions/admin');
 var event_actions = require('../actions/eventos');
 var horas_actions = require('../actions/horas');
 var tareas_actions = require('../actions/tareas');
 var escritorio_actions = require('../actions/escritorio');
 var justificacion_actions = require('../actions/justificacion');
 var solicitud_actions = require('../actions/solicitud');
 var horario_actions = require('../actions/horario');

 //**********************************************
 var crudUsuario = require('./crudUsuario');
 var crudSolicitud = require('./crudSolicitud');
 var crudJustificaciones = require('./crudJustificaciones');

 var crudPeriodo = require('./crudPeriodo');
 var crudHorario = require('./crudHorario');
 var crudMarca = require('./crudMarca');
 var crudDepartamento = require('./crudDepartamento');
 var crudFeriado = require('./crudFeriado');
 var crudContenido = require('./crudContenido');
 var crudConfiguracion = require('./crudConfiguracion');
 var crudCorreo = require('./crudCorreo');
 var crudRed = require('./crudRed');
 var crud = require('./crud');
 var util = require('../util/util');
 var ObjectId = mongoose.Types.ObjectId;

//**********************************************
//Modelos para el manejo de objetos de la base de datos
var Marca = require('../models/Marca');
var HorasTrabajadas = require('../models/CierrePersonal');
var Feriado = require('../models/Feriado');
var Correo = require('../models/Correo');
var Contenido = require('../models/Contenido');
var Red = require('../models/Red');
var Usuario = require('../models/Usuario');
var Horario = require('../models/Horario');
var HorarioFijo = require('../models/HorarioFijo');
var HorarioPersonalizado = require('../models/HorarioEmpleado');
var Departamento = require('../models/Departamento');
var Justificaciones = require('../models/Justificaciones');
var Solicitudes = require('../models/Solicitudes');
var PeriodoUsuario = require('../models/PeriodoUsuario');
var PeriodoSolicitud = require('../models/PeriodoUsuario');
var Cierre = require('../models/Cierre');
var emailSIGUCA = 'siguca@greencore.co.cr';
var Articulo51 = require('../models/Articulo51');
var Configuracion = require('../models/Configuracion');
var Alerta = require('../models/Alerta');
var EventosTeletrabajo = require('../models/EventosTeletrabajo');

//***************************************
//var multer=require('multer');
//var upload = multer({ dest: '' });

var multer  =  require('multer');

//***************************************
var config 			= require('../config');

//************************************
module.exports = function(app, io) {
    /*
    *   Redirecciona a la página principal (index.html)
    */


    app.get('/', function (req, res) {
        Contenido.find({seccion:'Index'},function(err,contenido){
            if (err){
                return res.json(error);
            } else{
                res.render('index', {
                    usuario: req.user,
                    textos:contenido
                });
            }
        });

    });


    app.get('/justificacionesPendientes',function(req,res){

        crudJustificaciones.conteoJustificaciones(req.user,function (conteoJustificaciones){
            if(conteoJustificaciones){
                req.user.tipo = req.session.name;
                res.render('justificacionesPendientes',{
                    usuario:req.user,
                    arrayJustificaciones:conteoJustificaciones,

                })
            }
        });

    });

    //var upload = multer({storage: 'pru/'});
   // app.post('/imagen',upload.single('myimage'),function(req,res,next){
    //    console.log('test :'+ JSON.stringify(req.file));
    //    console.log('test :'+ JSON.stringify(req.files));
    //    res.end('Imagen Cargada en el servidor');
    //});

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
    *  Lleva al escritorio de supervisor
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
    *  Crea un nuevo horario
    */
    app.post('/agregarHorarioPersonalizado', autentificado,function(req,res){
        horario_actions.create(req,res);
     });

    app.post('/horario/get', autentificado, function (req, res) {
        crudHorario.getByUser(req.body.usuario, function (err, horario) {
            if (err) return res.json({error:err});
            res.json(horario);
        });
    });

    app.post('/horario/actualizar/:userId', autentificado, horario_actions.updateByUser);

    //******************************************************************************
    /*
    /*
    *  Carga las justificaciones, solicitudes de horas extra y solicitudes de permisos pendientes,
    *  a cada consulta se le realiza la conversion de epoch a la CST Standard.
    */
    app.get('/gestionarEventos/:filtrado', autentificado, event_actions.filtrarEventos);

    /*
    *  Carga las justificaciones, solicitudes de horas extra y solicitudes de permisos NO pendientes,
    *  a cada consulta se le realiza la conversión de epoch a la CST Standard.
    *
    */

    app.get('/reportes', autentificado, event_actions.filtrarEventos);

    app.post('/reportes', autentificado, event_actions.filtrarEventos);

    //Obtiene el filtrado elegido
    app.get('/reportes/:filtrado', autentificado, event_actions.filtrarEventos);
    app.post('/reportes/:filtrado', autentificado, event_actions.filtrarEventos);

    /*
    *   - Filtra los eventos por usuario y rango de fecha.
    *   - Dependiendo si es reporte o gestión de eventos, filtra los eventos por distintos estados.
    */
    app.post('/filtrarEventos/:filtrado', autentificado, event_actions.filtrarEventos);

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


    app.post('/justificacionEmpleado', autentificado, function(req,res){

        var just={
            id:req.body.identificador,
            usuario:req.user.id,
            detalle:req.body.detalle,
            motivoOtroJust:req.body.motivoOtroJust,
            motivoJust:"otro"

        };
        if(req.session.name!="Supervisor"){
            crudJustificaciones.updateJust(just, function (err){
                res.redirect('/escritorioEmpl');
            });
        }else{
            crudJustificaciones.updateJust(just, function (err){
                res.redirect('/escritorio');
            });
        }

    });


    //justificacion masa
    app.post('/justificacionMasaEmpleado', autentificado, function(req,res){

        if(req.session.name=="Supervisor"){
            for(var i=0;i<req.body.ordenadas.length;i++){
                var just={
                    id:req.body.ordenadas[i].id,
                    usuario:req.user.id,
                    detalle:req.body.ordenadas[i].detalle,
                    motivoOtroJust:req.body.ordenadas[i].motivoOtroJust,
                    motivoJust:"otro"

                };
                crudJustificaciones.updateJust(just, function (err){

                });
            }
            res.json({result:"Supervisor"});

        }else{
            for(var i=0;i<req.body.ordenadas.length;i++){
                var just={
                    id:req.body.ordenadas[i].id,
                    usuario:req.user.id,
                    detalle:req.body.ordenadas[i].detalle,
                    motivoOtroJust:req.body.ordenadas[i].motivoOtroJust,
                    motivoJust:"otro"

                };
                crudJustificaciones.updateJust(just, function (err){

                });
            }
            res.json({result:"Empleado"});
        }
    });

    /*
    *  El supervisor elimina una justificación y se le envia un correo al dueño de la justificación
    */
    app.get('/justificacion/delete/:id', autentificado, justificacion_actions._delete);


    //******************************************************************************
    /*
    *  Crea una solicitud tipo hora extra
    */
    app.post('/solicitud_extra', autentificado, solicitud_actions.nuevoExtra);

    /*
    *  Carga la información de una solicitud tipo hora extra
    */
    app.get('/solicitud/edit/:id', autentificado, solicitud_actions.editar);

    /*
    *  Carga la información de una solicitud de tipo inciso C
    */
    app.get('/solicitud/inciso', autentificado, function (req, res) {
        Solicitudes.find({usuario: req.user.id, "inciso":"incisoC"}).exec(function (err, quantity) {
            console.log(quantity);
            var size = quantity.length;
            res.json({quantity});
        });
    });

    app.get('/horaExtra/edit/:id', autentificado, solicitud_actions.editarExtra);

    /*
    *  Actualiza una solicitud tipo hora extra
    */

    app.post('/guardarHoraExtra/:id', autentificado, solicitud_actions.guardarExtra);

    /*
    *  Crea una solicitud tipo permiso anticipado
    */
    app.post('/solicitud_permisos', autentificado, solicitud_actions.crearPermiso);

    app.post('/justificacionMasa', autentificado, function(req,res){

        for(var i=0;i<req.body.vector.length;i++){
            var justificacion= new Object();
            justificacion.id = req.body.vector[i].id;
            justificacion.estado = req.body.vector[i].estado;
            justificacion.comentarioSupervisor = req.body.vector[i].comentarioSupervisor;

            if(justificacion.estado != 'Pendiente') {
            crudJustificaciones.gestionarJustifcacion(justificacion, function (err, msj) {

            }, req.user.id);
            } else {

            }
        }//end for
        res.json({});

    });


     app.post('/justificacionDeleteMasa', autentificado, function(req,res){

        for(var i=0;i<req.body.vector.length;i++){
            crudJustificaciones.deleteJustMasa(req.body.vector[i].id, function (err, msj) {
		    });
        }//end for
        res.json({});

    });

    /*
    *  Actualiza una solicitud tipo permiso anticipado
    */
    app.post('/permiso/:id', autentificado, solicitud_actions.editarPermiso);

    /*
    *  El supervisor elimina una solicitud y se le envia un correo al dueño de la solicitud
    */
    app.get('/solicitud/delete/:id', autentificado, solicitud_actions.borrarSolicitud);

    //******************************************************************************
    /*
    *  Actualiza el estado y el comentario del supervisor a una solicitud en específico
    */
    app.post('/getionarSolicitudAjax/:id', autentificado, function (req, res) {
        var solicitud = req.body;
        solicitud.id = req.params.id;

        //var estadoreal = 'Pendiente'+solicitud.id;
        var estadoreal = 'Pendiente';

        if(solicitud.estado != estadoreal) {
            crudSolicitud.gestionarSoli(solicitud, function (err, msj) {
                if (err) res.json(err);
                else res.send(msj);
            },req.user.id);
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
            crudJustificaciones.gestionarJust(justificacion, function (err, msj) {
                if (err) res.json(err);
                else res.send(msj);
            }, req.user.id);
        } else {
            res.send('');
        }
    });

    //******************************************************************************
    /*
    *  Crea una nueva marca vía página web
    */
    app.post('/marca', autentificado, function (req, res) {

        crudMarca.addMarca(req.body.ipOrigen,req.session.name,
            {tipoMarca: req.body.marca, usuario: req.user.id,tipoUsuario: req.session.name},
            function(msj, msjJust){
                res.json({result:msj, justificacion:msjJust});
            });
    });

    app.post('/alertaMostrada', autentificado, function (req, res) {

        var alertaActualizada = {
            mostrada : true
        };

        Alerta.findByIdAndUpdate(req.body.id, alertaActualizada, function(err, alerta){
            if (err) console.log(err);
        });

        Usuario.findOne({ _id: req.body.usuario }, function (error, usuario) {
            if(error) console.log(error);
            if (usuario){

                Correo.find({},function(errorCritico, listaCorreos){
                    if (!errorCritico && listaCorreos.length > 0 ) {
                        enviarCorreo.enviar(listaCorreos[0].nombreCorreo, usuario.email, 'Alerta de Validación de Presencia','Estimado(a) funcionario:', 'Usted ha recibido una alerta de validación de presencia en SIGUCA:<br><br>Se le recuerda que debe atender esta solicitud en los proximos ' + req.body.tiempoRespuesta + ' minuto(s).');
                    } else {
                        console.log("error al enviar correo de solicitud de confirmación de conexión");
                    }
                });

                var nombreUsuario = usuario.nombre + ' ' + usuario.apellido1 + ' ' + usuario.apellido2;
                var date = moment();

                var eventosTeletrabajo = new EventosTeletrabajo({
                    usuario: req.body.usuario,
                    nombreUsuario: nombreUsuario,
                    epoch: date.unix()
                });

                eventosTeletrabajo.save(function (err, respuesta) {
                    if (err) console.log(err);
                    res.json({id: respuesta._id});
                });
            }
        });
    });

    app.post('/presente', autentificado, function (req, res) {

        var fechaActual = new Date();
        var eventosTeletrabajo = {
            presente : true,
            fechaAceptacion: fechaActual
        };

        EventosTeletrabajo.findByIdAndUpdate(req.body.id, eventosTeletrabajo, function(err, respuesta){
            if (err) console.log(err);
        });

        res.json({result:"ok"});
    });

    app.post('/validarPresente', autentificado, function (req, res) {

        EventosTeletrabajo.findById(req.body.id, function(err, evento){
            if (err) console.log(err);
            if(!evento.presente){

                Usuario.findById(evento.usuario, function(err, usuario){
                    if (err) console.log(err);
                    if (usuario){
                        usuario.departamentos.forEach(function(departamento) {
                            Usuario.find({departamentos: {$elemMatch: {departamento: ObjectId(departamento.departamento)}}, tipo: "Supervisor"}).exec(function(error, supervisores){
                                if (error) console.log(error);

                                if(supervisores && supervisores.length > 0){
                                    supervisores.forEach(function(supervisor) {

                                        Correo.find({},function(error,listaCorreos){
                                            if (!error && listaCorreos.length > 0 ) {
                                                enviarCorreo.enviar(listaCorreos[0].nombreCorreo, supervisor.email, 'Verificación de presencia fallida','Estimado Funcionario:', 'Usted ha recibido una notificación de no comprobación de presencia en modalidad de teletrabajo del empleado: <br><br>' +  usuario.nombre + ' ' + usuario.apellido1 + ' ' + usuario.apellido2 + '.');
                                            } else {
                                                console.log("error al enviar correo de solicitud de confirmación de conexión");
                                            }
                                        });

                                    });
                                }
                            });

                        });
                    }
                });
            }
        });

        res.json({result:"ok"});
    });

    app.post('/usuarioDisponibleVerAlerta', autentificado, function (req, res) {

        var date = moment();

        date.hours(0);
        date.minutes(0);
        date.seconds(0);

        var epochTime = date.unix();

        // console.log(epochTime);

        Marca.find({usuario: req.user.id, epoch:{"$gte": epochTime}, tipoUsuario: req.session.name}, {_id:0, tipoMarca:1, epoch:1, dispositivo:1, red:1}).exec(
            function(error, marcas) {
                if (error) return res.json(error);

                var estaDisponible = false;

                var entrada = marcas.filter(x => x.tipoMarca === 'Entrada');
                // console.log('entrada: ' + entrada.length);
                var salidaReceso = marcas.filter(x => x.tipoMarca === 'Salida a Receso');
                // console.log('salidaReceso: ' + salidaReceso.length);
                var entradaReceso = marcas.filter(x => x.tipoMarca === 'Entrada de Receso');
                // console.log('entradaReceso: ' + entradaReceso.length);
                var salidaAlmuerzo = marcas.filter(x => x.tipoMarca === 'Salida al Almuerzo');
                // console.log('salidaAlmuerzo: ' + salidaAlmuerzo.length);
                var entradaAlmuerzo = marcas.filter(x => x.tipoMarca === 'Entrada de Almuerzo');
                // console.log('entradaAlmuerzo: ' + entradaAlmuerzo.length);
                var salida = marcas.filter(x => x.tipoMarca === 'Salida');
                // console.log('salida: ' + salida.length);

                if(entrada.length === 1 && salidaReceso.length === entradaReceso.length && salidaAlmuerzo.length === entradaAlmuerzo.length && salida.length === 0){
                    estaDisponible = true;
                }

                res.json({result: estaDisponible});
            }
        );
    });

    app.post('/actualizarAlerta', autentificado, function (req, res) {

        Alerta.findByIdAndUpdate(req.body.id, req.body.alerta, function(err,alerta){
        });
    });

    //check de marcas de usuario
    app.post('/marcaCheck', autentificado, function (req, res) {

        var date = moment().format("DD/MM/YYYY");
        date=date.split("/");
        var epochGte = moment();
        epochGte.year(date[2]).month(date[1]-1).date(date[0]);
        epochGte.hour(0).minutes(0).seconds(0);
        var epochLte = moment();
        epochLte.year(date[2]).month(date[1]-1).date(date[0]);
        epochLte.hour(23).minutes(59).seconds(59);
        crudMarca.find({
            usuario:req.user.id,
            tipoUsuario: req.session.name,
            epoch:{
            "$gte":epochGte.unix(),
            "$lte":epochLte.unix()
        }},function(msj, marcas){
            var m ="ok";
            if(msj) m = msj;
            var mcs = [];
            var ml = util.unixTimeToRegularDate(marcas);
            for(x in ml){
                var obj = {};
                obj.fecha = ml[x].fecha;
                obj.tipoMarca = ml[x].tipoMarca;
                mcs.push(obj);
            }
            res.json({result:m, marcas:mcs});
        });


    });

    app.post('/rango/get', autentificado, function (req, res) {
        if(req.body.fecha.inicio && req.body.fecha.inicio.split("/").length == 3 &&
        req.body.fecha.final && req.body.fecha.final.split("/").length == 3){

            var inicio = req.body.fecha.inicio.split("/");
            var final = req.body.fecha.final.split("/");

            var epochGte = moment();
            epochGte.year(inicio[2]).month(inicio[1]-1).date(inicio[0]);
            epochGte.hour(0).minutes(0).seconds(0);

            var epochLte = moment();
            epochLte.year(final[2]).month(final[1]-1).date(final[0]);
            epochLte.hour(23).minutes(59).seconds(59);

            HorasTrabajadas.find({
                usuario:req.user.id,
                tipoUsuario: req.session.name,
                epoch:{
                "$gte":epochGte.unix(),
                "$lte":epochLte.unix()
                }
            },function(error,cierres){
                if(!error && cierres.length>0){
                    var lista=new Array();
                    for(var i=0;i<cierres.length;i++){
                        var obj=new Object();
                        obj.minutos=cierres[i].tiempo.minutos;
                        obj.horas=cierres[i].tiempo.horas;
                        lista.push(obj);
                    }
                    res.json({result:"ok", lista:lista});

                }else{
                    res.json({result:"fail"});
                }
            });

        }

    });


    /*
    *  Traer marcas
    */
    app.post('/marca/get', autentificado, function (req, res) {
        if(req.body.date && req.body.date.split("/").length == 3){
            var date = req.body.date.split("/");
            var epochGte = moment();
            epochGte.year(date[2]).month(date[1]-1).date(date[0]);
            epochGte.hour(0).minutes(0).seconds(0);
            var epochLte = moment();
            epochLte.year(date[2]).month(date[1]-1).date(date[0]);
            epochLte.hour(23).minutes(59).seconds(59);
            crudMarca.find({
                usuario:req.user.id,
                tipoUsuario: req.session.name,
                epoch:{
                "$gte":epochGte.unix(),
                "$lte":epochLte.unix()
            }},function(msj, marcas){
                var m ="ok";
                if(msj) m = msj;
                var mcs = [];
                var ml = util.unixTimeToRegularDate(marcas);
                for(x in ml){
                    var obj = {};
                    obj.fecha = ml[x].fecha;
                    obj.tipoMarca = ml[x].tipoMarca;
                    mcs.push(obj);
                }
                res.json({result:m, marcas:mcs});
            });
        }
        else res.json({result:"error", marcas:[]});
    });


    /*
    *  Elimina una marca en específico si fue creada hace menos de 10 minutos
    */
    app.get('/marca/delete/:id/:tipoMarca', autentificado, function (req, res) {
        crudMarca.deleteMarca(req.params.id,req.params.tipoMarca,req.user.id, req.session.name, function (msj) {
            res.send(msj);
        });
    });

    //******************************************************************************
    /*
    *  Cálculo de las horas trabajadas en un día
    */
    app.get('/horas/actualizar', autentificado, horas_actions.horasTrabajadas);


    //******************************************************************************
    /*
    *  Redirecciona a la configuración de empleado
    */
    app.get('/configuracion', autentificado, function (req, res) {
        //Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
        Contenido.find({},function(error,textos){
            if(!error && textos){
                req.user.tipo = req.session.name;
                res.render('configuracion', {
                    title: 'Configuración | SIGUCA',
                    usuario: req.user,
                    texto:textos
                });
            }else{
                req.user.tipo = req.session.name;
                res.render('configuracion', {
                    title: 'Configuración | SIGUCA',
                    usuario: req.user,
                    texto:textos
                });
            }
        });

    });

    app.post('/asignarContenido', autentificado, function (req, res){

          var content =new Contenido({
              seccion:req.body.seccion,
              titulo:req.body.titulo,
              llave:req.body.llave
          });
          console.log(content);
          content.save(function (err, user) {
              if (err) console.log(err);
              console.log("El usuario se creo ");
          });
          res.redirect('/escritorioAdmin');
      });

    /*
    *  Crea marca desde RFID
    */
    app.get('/rfidReader', function (req, res) {
            //pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta=123&tipoMarca=6
            //var pwd1 = req.param('pwd1');
            //var pwd2 = req.param('pwd2');
            var codTarjeta = req.param('codTarjeta');
            var tipoMarca = req.param('tipoMarca');
            var tipoUsuario = req.param('tipo');
            var ip = req.param('ipv4');
            //if(pwd1 == 'ooKa6ieC' && pwd2 == 'of2Oobai' ) {

            crudMarca.rfidReader(tipoUsuario,codTarjeta, tipoMarca, ip, function (msj) {
            res.send(msj);
                });
            //}
        });

    /*
    *  Redirecciona a la página de ayuda
    */
    app.get('/Ayuda', autentificado, function (req, res) {
        //Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
        Contenido.find({seccion:'Ayuda'},function(err,contenido){
            if (err){
                return res.json(error);
            } else{

                req.user.tipo = req.session.name;
                res.render('ayuda', {
                    title: 'Ayuda | SIGUCA',
                    usuario: req.user,
                    textos:contenido
                });
            }


            });
        });

    app.post('/verificarEmpleadoActualizar',autentificado,function(req,res){

        Usuario.find({$or:[{'username' :  req.body.empleado.username},{'cedula':req.body.empleado.cedula},{'codTarjeta':req.body.empleado.codTarjeta}]}, function (err, user) {
            if (err){
                res.json(err);
            }
            else{

                if(user.length>1){
                    res.json("El usuario ya existe");
                }else{
                    var contador=0;
                    for(var h=0;h<user.length;h++){
                        if(user[h]._id==req.body.empleado._id){
                            contador++;
                        }


                    }
                    if(contador>0){
                        res.json("Correcto");
                    }
                    else{
                        res.json("El usuario ya existe");
                    }
                }
            }
        });
    });

    app.post('/verificarEmpleado',autentificado,function(req,res){
        Usuario.findOne({ $or:[{'username' :  req.body.empleado.username},{'cedula':req.body.empleado.cedula},{'codTarjeta':req.body.empleado.codTarjeta}]}, function (err, user) {
            if (err){
                res.json(err);
            }
            if (!user) {
                res.json("Correcto");
            }else if(user){
                res.json("usuario existe");
            }
        });
    });

    //******************************************************************************
    /*
    *  Crea un nuevo usuario
    */
    app.post('/empleado', autentificado, function (req, res) {
        if (req.session.name == "Administrador") {
            crudUsuario.addUsuario(req.body, function() {
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
        crudUsuario.listUsuarios(function (err, listaUsuarios){
            if (err) return res.json(err);
            //Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
            req.user.tipo = req.session.name;
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
        crudUsuario.updateUsuario(data, function() {
            res.redirect('/empleado');
        });
    });

    app.get('/admin/reset',function () {crudUsuario.reset(function() {});});


    /*
    *  Modifica el estado de Activo a Inactivo de un usuario en específico
    */
    app.get('/empleado/delete/:id', autentificado, function (req, res) {
        crudUsuario.deleteUsuario(req.params.id, function (err, msj) {
            if (err) res.json(err);
            res.send(msj);
        });
    });

    /*
    *  Obtiene un usuario
    */
    app.post('/empleado/tipo/get', function (req, res) {
        Usuario.findOne({username:req.body.username2,estado:"Activo"}, function (err, user) {
            if (err || (user && !user.validPassword(req.body.password2))) { return res.json(err) }
            res.json(user);
        });
    });
    //******************************************************************************
    //Periodos de un usuario
    /*
    *  Crea un nuevo periodo
    */
    app.post('/periodo/:id', autentificado, function (req, res) {
        console.log("post de periodo mandando el id " + req.params.id);
        //console.log("ESTE ES usuario dentro del post     " + req.user);
        if (req.session.name == "Administrador") {
            req.body.usuario = req.params.id;
            crudPeriodo.addPeriodo(req.body, function() {
                if (req.session.name == "Administrador"){
                    res.redirect('/periodo/'+ req.params.id);
                }
            });//Busca Usuario
        } else {
            req.logout();
            res.redirect('/');
        }
    });

    /*
    */
    app.get('/periodo/:id', autentificado, function (req, res) {
        PeriodoUsuario.find({usuario: req.params.id}).sort({numeroPeriodo: 1}).exec(function(err, periodos){
            if(err){
                return res.json(err);
            }else{
                req.user.tipo = req.session.name;
                Usuario.findById(req.params.id, function (err, empleado) {
                    console.log("NOMBRE USUARIO    " + empleado.nombre);
                    if (err) return res.json(err);
                    else{
                        return res.render('periodo', {
                            title: 'Nuevo Periodo | SIGUCA',
                            periodo:periodos,
                            usuario:req.params.id,
                            nombreUsuario: empleado.nombre,
                            moment: moment
                        });
                    }
                });
            }
        });
    });

    /*
   *  Modifica el estado de Activo a Inactivo de un periodo en específico
   */
    app.get('/periodo/delete/:id', autentificado, function (req, res) {
        console.log("ESTE ES id a eliminar   " + req.params.id);
        crudPeriodo.deletePeriodo(req.params.id, function (err, msj) {
            if (err) res.json(err);
            res.send(msj);
        });
    });

    app.get('/periodo/editPeriodo/:id',function(req,res){
        PeriodoUsuario.findById(req.params.id,function(err,periodo){
            if (err) return res.json(err);
            else res.json(periodo);
        });
    });

    /*
    */

    app.get('/periodos/numero/:id', autentificado, function (req, res) {
        PeriodoVacaciones.findOne({usuario: req.params.id}).sort('-numeroPeriodo').exec(function(err,periodo){
            if (err) return res.json(err);
            else res.json(periodo);
        });
    });

    app.post('/periodoUpdate/:id',autentificado, crudPeriodo.actualizarPeriodo);

    app.get('/periodos/vacacionesAcumuladas/:id', autentificado, function (req, res) {
        crudPeriodo.vacacionesAcumuladas(req.params.id, function (err, acumulado) {
            if (err) res.json(err);
            else res.json(acumulado);
        });
    });

    app.get('/periodos/cantidadVacaciones/:id', autentificado, function (req, res) {
        crudPeriodo.cantidadVacacionesPorUsuario(req.params.id, function (err, msj) {
            if (err) res.json(err);
            res.send(msj);
        });
    });

    //******************************************************************************
    /*
    *  Crea un nuevo departamento
    */
    app.post('/departamento',autentificado, function (req, res) {
        crudDepartamento.addDepa(req.body, function() {
            if (req.session.name == "Administrador") {
                res.redirect('/escritorioAdmin');
            }
        });
    });

    /*
    *  Lista todos los departamentos creados
    */
    app.get('/departamento', autentificado, function (req, res) {
        crudDepartamento.listDepa(function (err, departamentos) {
            if (err) return res.json(err);
            //Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
            req.user.tipo = req.session.name;
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
        crudDepartamento.loadDepa(req.params.id, function (departamento) {
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
        crudDepartamento.updateDepa(data, function() {
            res.redirect('/departamento');
        });
    });

    /*
    *  Elimina un departamento en específico
    */
    app.get('/departamento/delete/:id', autentificado, function (req, res) {
        crudDepartamento.deleteDepa(req.params.id, function (msj) {
            res.send(msj);
        });
    });

    //******************************************************************************
    /*
    *  En caso de tener varias sedes, se pueden crear dispositivos para especificar en cual
    *  sede se crearon las marcas manuales.
    */
    app.get('/dispositivos', autentificado, function (req, res) {
        //Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
        req.user.tipo = req.session.name;
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
            crudUsuario.changeUsername(user, function() {
                res.redirect('/configuracion');
            });
        }
    });



 //  var storage = multer.diskStorage({
   //     destination: function(req, file, cb) {
    //        cb(null, './uploads/');
    //    },
    //    filename: function(req, file, cb) {
    //        var ext = file.originalname.split('.').pop();
    //        cb(null, file.fieldname + '-' + Date.now() + '.' + ext);
    //    }
   // });

   // upload = multer({ storage: storage });
   // app.post('/IMAGENXD/:id', autentificado,upload.single('upl'), function (req, res,next) {
   //    //console.log('body', req.body);
        //console.log('file', req.file);
    //    console.log('file', req.files);
    //    res.redirect('/configuracion');
    //});


// Funcionalidad para cargar la imagen en el servidor, con la validacionde  png , la ruta donde  se  guarda
// se define en /config/express.js
    app.post('/IMAGEN/:id', autentificado, function(req, res) {


        var extension=String(req.files.upl.type);
        var extension = extension.substring(6);
        console.log(extension);
        if(extension!=="png"){
            res.send("Solo se aceptan .png");
        }
        else{
        var tmp_path = String(req.files.upl.path);
        var target_path = '/usr/local/bin/siguca/imagenes/'+req.body.codigo+'.'+extension;
        fs.rename(tmp_path, target_path, function(err) {
            if (err) throw err;
            fs.unlink(tmp_path, function() {
                if (err) throw err;
            });
        });
        res.redirect('/configuracion');
    }
    });



    /*
    *   Cambia la contraseña de los usuarios
    */
    app.post('/cambioPassword/:id', autentificado, function (req, res) {
        var user = req.body;
        user.id = req.params.id;
        crudUsuario.changePassword(user, function () {
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
            } else if (req.session.name == "Empleado" || req.session.name == config.empleadoProfesor) {
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
        //Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
        req.user.tipo = req.session.name;
        res.render('dispositivos', {
            title: 'Dispositivos | SIGUCA',
            usuario: req.username
        });
    });


//******************************************************************************
//Este tipo de horario está obsoleto, pero se mantiene para dar soporte a los
//empleado a los que no se les ha asignado un horario personalizado.
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

    app.post('/horarioFijo', autentificado, function (req, res) {
       crud.addHorarioFIjo(req.body,function(){
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
            //Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
            req.user.tipo = req.session.name;

            HorarioFijo.find(function(error,horarioFijo){
                HorarioPersonalizado.find(function(error,personalizado){
                    return res.render('horarioN', {
                        title: 'Nuevo Horario | SIGUCA',
                        horarios: horarios,
                        usuario: req.user,
                        horarioFijo:horarioFijo,
                        horarioPersonalizado:personalizado
                    });
                });

            });
        });
    });

    /*
    *  Carga los datos de un horarioLibre en específico
    */
    app.get('/horarioN/editHorario/:id', autentificado, function (req, res) {
        crud.loadHorario(req.params.id, function (err, horario) {
            if (err) return res.json(err);
            else res.json(horario);
        });
    });

    //Carga los datos de un horarioFijo en especiifico

    app.get('/horarioFijo/editHorario/:id', autentificado, function (req, res) {
        crud.loadHorarioFijo(req.params.id, function (err, horario) {
            if (err) return res.json(err);
            else res.json(horario);
        });
    });


    //Carga los datos de un horarioFijo en especiifico

    app.get('/horarioN/buscarPersonalizado/:id', autentificado, function (req, res) {
        crud.loadHorarioEmpleado(req.params.id, function (err, horario) {
            if (err) return res.json(err);
            else res.json(horario);
        });
    });

    /*
    *  Actualiza los datos de un horario libre en específico
    */
    app.post('/horarioN/:id',autentificado, function (req, res) {
        var data = { horario: req.body, id: req.params.id };
        crud.updateHorario(data, function (err, horarios) {
            if (err) return res.json(err);
            res.redirect('/horarioN');
        });
    });

    app.post('/formUpdatePersonalizado/:id',autentificado, function (req, res) {


        var data = { horario: req.body, id: req.params.id };
        crud.updateHorarioPersonalizado(data, function (err, horarios) {
            if (err) return res.json(err);
            res.redirect('/horarioN');
        });

    });

    //Actualiza los datos de un horario fijo en especifico
     app.post('/horarioFijoN/:id',autentificado, function (req, res) {
        var data = { horario: req.body, id: req.params.id };
        crud.updateHorarioFijo(data, function (err, horarios) {
            if (err) return res.json(err);
            res.redirect('/horarioN');
        });
    });

    /*
    *  Elimina un horario libre
    */
    app.get('/horarioN/delete/:id', autentificado, function (req, res) {
        crud.deleteHorario(req.params.id, function (err, msj) {
            if (err) return res.json(err);
            else res.send(msj);
        });
    });
    //Elimina un horario fijo
    app.get('/horarioFijo/delete/:id', autentificado, function (req, res) {
        crud.deleteHorarioFijo(req.params.id, function (err, msj) {
            if (err) return res.json(err);
            else res.send(msj);
        });
    });

    //eliminar horario personalizado
    app.get('/horarioPersonalizado/delete/:id', autentificado, function (req, res) {
        crud.deleteHorarioPersonalizado(req.params.id, function (err, msj) {
            if (err) return res.json(err);
            else res.send(msj);
        });
    });

    //horarioMasa
    app.get('/horarioMasa',autentificado,function(req,res){
        crudUsuario.listUsuarios(function (err, listaUsuarios){
            if (err) return res.json(err);
            //Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
            req.user.tipo = req.session.name;
            listaUsuarios.usuario = req.user;
            return res.render('horarioMasa', listaUsuarios);
        });

    });

    app.post('/horarioMasaLibre',autentificado,function(req,res){

        for(var i=0;i<req.body.vector.length;i++){

            Usuario.update({_id:req.body.vector[i].id},{ $set:{"horario":req.body.vector[i].idHorario}},function(err,horario){});
            Usuario.update({_id:req.body.vector[i].id},{ $unset:{horarioFijo:""}},function(error,correcto){});
            Usuario.update({_id:req.body.vector[i].id},{ $unset:{horarioEmpleado:""}},function(error,correcto){});
        }
        res.json({});

    });

    app.post('/horarioMasaPersonalizado',autentificado,function(req,res){
            for(var i=0;i<req.body.vector.length;i++){

                Usuario.update({_id:req.body.vector[i].id},{ $set:{"horarioEmpleado":req.body.vector[i].idHorario}},function(err,horario){});
                Usuario.update({_id:req.body.vector[i].id},{ $unset:{horarioFijo:""}},function(error,correcto){});
                Usuario.update({_id:req.body.vector[i].id},{ $unset:{horario:""}},function(error,correcto){});
            }
            res.json({});

    });


    app.post('/horarioMasaFijo',autentificado,function(req,res){

            for(var i=0;i<req.body.vector.length;i++){

                Usuario.update({_id:req.body.vector[i].id},{ $set:{"horarioFijo":req.body.vector[i].idHorario}},function(err,horario){});
                Usuario.update({_id:req.body.vector[i].id},{ $unset:{horario:""}},function(error,correcto){});
                Usuario.update({_id:req.body.vector[i].id},{ $unset:{horarioEmpleado:""}},function(error,correcto){});
            }
            res.json({});

    });

    app.post('/horarioMasaSinHorario',autentificado,function(req,res){

            for(var i=0;i<req.body.vector.length;i++){
                Usuario.update({_id:req.body.vector[i].id},{ $unset:{horarioEmpleado:""}},function(error,correcto){});
                Usuario.update({_id:req.body.vector[i].id},{ $unset:{horario:""}},function(error,correcto){});
                Usuario.update({_id:req.body.vector[i].id},{ $unset:{horarioFijo:""}},function(error,correcto){});
            }
            res.json({});

    });

    //asignarCorreo
    app.post('/asignarCorreo',autentificado, crudCorreo.insertarCorreo);


    app.get('/correo',autentificado,function(req,res){
        Correo.find(function(err,correos){
            if(err){
                return res.jason(err);
            }else{
                req.user.tipo = req.session.name;
                return res.render('correo', {
                title: 'Nuevo correo | SIGUCA',
                correo:correos,
                usuario:req.user
            });
            }
        });
    });


    //asignarRed
    app.post('/asignarRed',autentificado, crudRed.insertarRed);

    app.get('/red',autentificado,function(req,res){
        Red.find(function(err,redes){
            if(err){
                return res.jason(err);
            }else{
                req.user.tipo = req.session.name;
                return res.render('red', {
                title: 'Nueva Red | SIGUCA',
                red:redes,
                usuario:req.user
            });
            }
        });
    });

    app.get('/red/delete/:id', autentificado, function (req, res) {
        crudRed.deleteRed(req.params.id, function (err, msj) {
            if (err) return res.json(err);
            else res.send(msj);
        });
    });


    app.get('/red/editRed/:id',function(req,res){
        Red.findById(req.params.id,function(err,red){
            if (err) return res.json(err);
            else res.json(red);
        });
     });


    app.post('/redUpdate/:id',autentificado, crudRed.actualizarRed);

    /*
    *  Crud de feriados
    */

    app.post('/asignarFeriado',autentificado, crudFeriado.insertarFeriado);


    //Contenido
    //lista la lista de contenidos creados.
    app.get('/contenido',autentificado,function(req,res){
        Contenido.find(function(err,contenido){
            if(err){
                return res.jason(err);
            }else{

                req.user.tipo = req.session.name;

                return res.render('Contenido', {
                title: 'Nuevo Contenido | SIGUCA',
                contenido:contenido,
                usuario:req.user
            });
            }
        });
    });

    app.get('/contenido/editContenido/:id',function(req,res){
        Contenido.findById(req.params.id,function(err,feriado){
            if (err) return res.json(err);
            else res.json(feriado);
        });
    });

    app.post('/contenidoUpdate/:id',autentificado, crudContenido.actualizarContenido);

    //configuracionAlertas
    //lista la lista de configuracion de Alertas.
    app.get('/configuracionAlertas',autentificado,function(req,res){
        Configuracion.find(function(err,configuraciones){
            if(err){
                return res.jason(err);
            }else{

                req.user.tipo = req.session.name;

                return res.render('configuracionAlertas', {
                    title: 'Nuevo Contenido | SIGUCA',
                    configuraciones:configuraciones,
                    usuario:req.user
                });
            }
        });
    });

    app.get('/reporteConfirmacionPresencia',autentificado,function(req,res){
        EventosTeletrabajo.find(function(err,eventosTeletrabajo){
            if (err) {
                return res.jason(err);
            } else {

                req.user.tipo = req.session.name;

                return res.render('reporteConfirmacionPresencia', {
                    title: 'Reporte Confirmación Presencia | SIGUCA',
                    eventosTeletrabajo: eventosTeletrabajo,
                    usuario:req.user,
                    moment: require( 'moment' )
                });
            }
        });
    });

    app.get('/configuracionAlertas/editConfiguracion/:id',function(req,res){
        Configuracion.findById(req.params.id,function(err,configuracion){
            if (err) return res.json(err);
            else res.json(configuracion);
        });
    });

    app.post('/configuracionAlertasUpdate/:id',autentificado, crudConfiguracion.actualizarConfiguracion);

    //lista la lista de feriados creado.
    app.get('/feriado',autentificado,function(req,res){
        Feriado.find(function(err,feriados){
            if(err){
                return res.jason(err);
            }else{
                var feriadosArreglado = new Array();
                for (var i=0;i<feriados.length;i++){
                    var obj=new Object();
                    obj._id=feriados[i]._id;
                    obj.nombreFeriado=feriados[i].nombreFeriado;
                    obj.epoch=moment.unix(feriados[i].epoch).format("DD/MM/Y");
                    feriadosArreglado.push(obj);
                }
                req.user.tipo = req.session.name;


                return res.render('feriado', {
                title: 'Nuevo Feriado | SIGUCA',
                feriado:feriadosArreglado,
                usuario:req.user
            });
            }
        });
    });

    app.get('/feriado/delete/:id', autentificado, function (req, res) {
        crudFeriado.deleteFeriado(req.params.id, function (err, msj) {
            if (err) return res.json(err);
            else res.send(msj);
        });
    });

    app.get('/correo/delete/:id', autentificado, function (req, res) {
        crudCorreo.deleteCorreo(req.params.id, function (err, msj) {
            if (err) return res.json(err);
            else res.send(msj);
        });
    });

    app.get('/correo/editCorreo/:id',function(req,res){
        Correo.findById(req.params.id,function(err,feriado){
            if (err) return res.json(err);
            else res.json(feriado);
        });
     });


     app.get('/feriado/editFeriado/:id',function(req,res){
        Feriado.findById(req.params.id,function(err,feriado){
            if (err) return res.json(err);
            else res.json(feriado);
        });
     });



    app.post('/correoUpdate/:id',autentificado, crudCorreo.actualizarCorreo);

    app.post('/feriadoUpdate/:id',autentificado, crudFeriado.actualizarFeriado);

    io.sockets.on('connection', function(socket){

        socket.on('connected', function (){
            var date = new Date();
            var epoch = (date.getTime() - date.getMilliseconds())/1000;
            socket.emit('connected', epoch);
        });



        /* Recibe la orden de lista y filtra cierres por tipo de usuario
        socket.on('listar', function (departamentoId){
            var option = departamentoId.split(',');
            if(option[0] == "Supervisor")
                listarSupervisor(departamentoId);
            else
                listarEmpleado(departamentoId);
        });


         //Filtra cierres por departamento
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
                Cierre.find({tipo: "General", departamento: option[1]}).exec(function(){
                    if (err) console.log('error al cargar los cierres: ' + err);
                    else {
                        socket.emit('listaCierre', cierre);
                    }
                });
            }
        }
        //Filtra cierres por evento (justificaciones, solicitudes y marcas)
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
        */


    });

};

tareas_actions.cierreAutomatico.start();
