
var moment = require('moment');
var Marca = require('../models/Marca');
var Usuario = require('../models/Usuario');
var Horario = require('../models/Horario');
var Departamento = require('../models/Departamento');
var Justificaciones = require('../models/Justificaciones');
var Solicitudes = require('../models/Solicitudes');
var Cierre = require('../models/Cierre');
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
        cronTime: '59 25 16 * * 1-5', //Lunes a Viernes
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
                                        //
                                    });
                                    //
                                });
                                //
                            });
                            //
                        }
                    };
                } else {
                    query = {_id: {'$nin': array}, estado: "Activo", tipo: {'$nin': ['Administrador']} }
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
    })
}