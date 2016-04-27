
var moment = require('moment');
var Marca = require('../models/Marca');
var Usuario = require('../models/Usuario');
var Horario = require('../models/Horario');
var Departamento = require('../models/Departamento');
var Justificaciones = require('../models/Justificaciones');
var Solicitudes = require('../models/Solicitudes');
var Cierre = require('../models/Cierre');
var CierrePersonal = require('../models/CierrePersonal');
var util = require('../util/util');
var CronJob = require('cron').CronJob;
var crud = require('../routes/crud');
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

module.exports = {
    cronJob : new CronJob({ 
        cronTime: '59 25 16 * * 1-5', //Lunes a Viernes a las 4:25:59
        onTick: function() {
            var epochToday = moment().unix(),
            epochYesterday = epochToday - 86400,
            array = []; //Array con IDs de usuario
            console.log('Entro');
            Cierre.find(
                {tipo: "Personal", epoch: {'$gte': epochYesterday}}).populate('usuario').exec(
                function (cierresPersonales) {
                    var query = { };
                    if(!cierresPersonales) {
                        query = {_id: {'$nin': array}, estado: "Activo", tipo: {'$nin': ['Administrador']} };
                    }
                    else {
                        query = { estado: "Activo", tipo: {'$nin': ['Administrador']} };
                        console.log('Hay cierres Iniciados');
                        for (var i = 0; i < cierresPersonales.length; i++) {
                            var cierre = cierresPersonales[i];
                            array.push(cierre.usuario._id);
                            if(cierre.etapa == 0) {
                                //-----------------------------------------------
                                Justificaciones.find({usuario: cierre.usuario._id, fechaCreada: {'$gte': cierre.epoch}}).count().exec(
                                    function (err, just) {
                                        //-----------------------------------------------
                                        Solicitudes.find({usuario: cierre.usuario._id, fechaCreada: {'$gte': cierre.epoch}}).count().exec(
                                            function (err, soli) {
                                                //-----------------------------------------------
                                                Cierre.find({usuario: marca.usuario._id, tipo: 'Personal', etapa: 1}).sort({_id: -1}).limit(1).exec(
                                                    function (err, cierreAnterior) {
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
                                                            //
                                                        });
                                                        //
                                                    });
                                                //
                                            });
                                            //
                                        });
                                //
                            }
                        };
                    }

                    Usuario.find(query).exec(function (err, usuarios) {
                        console.log('Hay Ausentes')
                        for (var i = 0; i < usuarios.length; i++) {
                        //console.log(i + ") " + usuarios[i])
                        //
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
                                //
                            });
                            //
                        });
                        //
                    }
                });
                //
            });
            //
            Cierre.find({etapa:0, tipo: "General", epoch: {'$gte': epochYesterday}}, function (err, cierresGenerales){
                console.log('No hay cierres Generales ?')
                if(cierresGenerales) {
                    for (var i = 0; i < cierresGenerales.length; i++) {
                        Cierre.findByIdAndUpdate(cierresGenerales[i]._id, {etapa:1}, function (err, cierre){});
                    };
                }
            });
        },
        start: false,
        timeZone: "America/Costa_Rica"
    }),
//En la noche se busca si hay una marca no registrada antes de la hora estipulada
jobMarcasNoRegistradas : new CronJob({
    //cronTime: '59 59 * * * 1-5', Lunes a Viernes a las 4:25:59
    //cronTime: '* 50 23 * * 1-5',
    cronTime: '* * * * * *',
    onTick: function() {
        var hoy = new Date();
        if(!once){
            console.log("Actualizando cierre en la fecha: '"+hoy+"' y notificando a usuarios");
            var epochMin = moment();
            epochMin.hours(0);
            epochMin.minutes(0);
            epochMin.seconds(0);
            var epochMax = moment();
            epochMax.hours(23);
            epochMax.minutes(59);
            epochMax.seconds(59);
            //var epochYesterday = (epochToday.unix()-86400*30);
            Usuario.find(null,{_id:1, horario:1}).exec(
                function(err, usuarios){
                    if(!err){
                        for(usuario in usuarios){
                            if(usuarios[usuario].horario){
                                buscarHorarios(
                                    usuarios[usuario].horario,
                                    usuarios[usuario]._id,
                                    epochMin, epochMax
                                    );
                            }
                        }
                    }
                });
                //
            }
            once =true;
        },
        start: false,
        timeZone: "America/Costa_Rica"
    })
}
var once = false;

function buscarHorarios(_idHorario, _idUser, epochMin, epochMax){
    //console.log("buscarHorarios: "+_idUser);
    crud.loadHorario(_idHorario, function(error, horario){
        if(!error && horario ){//&& horario.horaEntrada!="0:00"){
        buscarMarcasNoRegistradas(
            _idUser, epochMin, epochMax, horario
            );
    }
});
}

function buscarMarcasNoRegistradas(_idUser, epochMin, epochMax, horario){
    Marca.find(
    {
        usuario: _idUser,
        epoch:{"$gte": epochMin.unix(), "$lte":epochMax.unix()}
    },
    {_id:0,tipoMarca:1,epoch:1}
    ).exec(function(error, arrayMarcas) {
        if (!error&&arrayMarcas){
            ///--------------------------------------------------//
            var marcas = util.clasificarMarcas(arrayMarcas);
           //console.log(marcas);
           if(!marcas.entrada){
                //
                crud.addJust(
                    {id:_idUser, detalle:"", 
                    estado:"Incompleto", motivoJust:"otro",
                    motivoOtroJust:"Omisión de marca de entrada y salida"},
                    function(){}
                    );  
            } else if(!marcas.salida){
                //
                crud.addJust(
                    {id:_idUser, detalle:"", 
                    estado:"Incompleto", motivoJust:"otro",
                    motivoOtroJust:"Omisión de marca de salida"},
                    function(){}
                    );  
                var tiempoTotal = util.contarHoras(marcas.entrada);
                agregarCierreAUsuario(_idUser,getHoraInicioCierreSemanal(), tiempoTotal);
            } else {
                var tiempoTotal = util.contarHoras(marcas.entrada, marcas.salida);
                var tiempoAlmuerzo = util.contarHoras(marcas.almuerzoOut, marcas.almuerzoIn);
                //var tiempoReceso = util.contarHoras(marcas.recesoOut, marcas.recesoIn);
                tiempoTotal = util.ajustarHoras(tiempoTotal, tiempoAlmuerzo);
                //tiempoTotal = util.ajustarHoras(tiempoTotal, tiempoReceso);
                var horas = horario.rangoJornada.split(":")[0];
                var margenMin = 15;
                if( (tiempoTotal.h-horas > 0) || 
                    (tiempoTotal.h-horas == 0 && tiempoTotal.m > margenMin)
                    ){
                    crud.addJust(
                        {id:_idUser, detalle:"", 
                        estado:"Incompleto", motivoJust:"otro",
                        motivoOtroJust:"Cantidad de horas trabajadas mayor a la jornada asignada"},
                        function(){}
                        );
                    //
                } else if( (horas-tiempoTotal.h > 1) || 
                    (horas-tiempoTotal.h == 1 && 60-tiempoTotal.m > margenMin)
                    ){
                    crud.addJust(
                        {id:_idUser, detalle:"", 
                        estado:"Incompleto", motivoJust:"otro",
                        motivoOtroJust:"Cantidad de horas trabajadas menor a la jornada asignada"},
                        function(){}
                        );
                }
            }
        }
    });
}

function getHoraInicioCierreSemanal(_idUser, tiempoTotal){
    //
    var fechaInicioCierre = new Date();
    fechaInicioCierre.setHours(23);
    fechaInicioCierre.setMinutes(59);
    fechaInicioCierre.setSeconds(59);
    fechaInicioCierre.setMilliseconds(59);

    //************************************************************
    //Ajustar días para que el query sea del lunes
    /*var unDia = 1000*60*60*24;
    var cantDias = fechaInicioCierre.getDay();
    if(cantDias==0) cantDias = 7;
    else if(cantDias==1) cantDias = 0;
    var xDiasEpoch = unDia*(cantDias-1);
    var fechaInicioCierre = new Date(fechaInicioCierre.getTime()-xDiasEpoch);*/
    //************************************************************

    return fechaInicioCierre.getTime();
}

function agregarCierreAUsuario(_id, epoch, tiempoTotal){
    var hoy = new Date();
    var queryCierreUser = {usuario:_id, epoch:epoch};
    var data = {
        usuario:_id, epoch:epoch, 
        tiempo:{
            horas:tiempoTotal.h,
            minutos:tiempoTotal.m
        }
    };
    CierrePersonal.find(queryCierreUser).exec(function(error, cierres) {
        if(error) 
            console.log("Error al crear cierre en la fecha '"+hoy+"' Mensaje: "+error);
        if(cierres.length==0){
            var nuevoCierre = new CierrePersonal(data);
            nuevoCierre.save(function (err, cierre) {
                if (err) 
                    console.log("Error al crear cierre en la fecha '"+hoy+"' Mensaje: "+error);
            });
        }
    });
}

function actualizarCierreUsuario(_id, data){
    var hoy = new Date();
    CierrePersonal.findByIdAndUpdate(_id, data, function (err, cierreActualizado) {
        if(err) 
            console.log("Error al actualizar cierre en la fecha '"+hoy+"' Mensaje: "+error);
    });
}