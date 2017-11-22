/*
 * GET home page.
 * Rutas
 */                 
 var fs = require('fs');
 var mongoose = require('mongoose');
 var nodemailer = require('nodemailer');
 var moment = require('moment');
 var passport = require('passport');

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
 

 var crudHorario = require('./crudHorario');
 var crudMarca = require('./crudMarca');
 var crudDepartamento = require('./crudDepartamento');
 var crudFeriado = require('./crudFeriado');
 var crud = require('./crud');
 var util = require('../util/util');
 var ObjectId = mongoose.Types.ObjectId;

//**********************************************
//Modelos para el manejo de objetos de la base de datos
var Marca = require('../models/Marca');
var Feriado = require('../models/Feriado');
var Usuario = require('../models/Usuario');
var Horario = require('../models/Horario');
var HorarioFijo = require('../models/HorarioFijo');
var HorarioPersonalizado = require('../models/HorarioEmpleado');
var Departamento = require('../models/Departamento');
var Justificaciones = require('../models/Justificaciones');
var Solicitudes = require('../models/Solicitudes');
var Cierre = require('../models/Cierre');
var emailSIGUCA = 'siguca@greencore.co.cr';

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
        res.render('index', {
            usuario: req.user
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
    *  Actualiza una solicitud tipo hora extra
    */
    app.post('/extra/:id', autentificado, solicitud_actions.getExtra);

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
        var estadoreal = 'Pendiente'+solicitud.id;
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
        req.user.tipo = req.session.name;
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
    app.get('/ayuda', autentificado, function (req, res) {
        //Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
        req.user.tipo = req.session.name;
        res.render('ayuda', {
            title: 'Ayuda | SIGUCA',
            usuario: req.user
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
    
    

    /*
    *  Crud de feriados
    */

    app.post('/asignarFeriado',autentificado, crudFeriado.insertarFeriado);

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

    
     app.get('/feriado/editFeriado/:id',function(req,res){
        Feriado.findById(req.params.id,function(err,feriado){
            if (err) return res.json(err);
            else res.json(feriado);
        });
     });


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
