
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
 

module.exports = {
    jobCierreAutomatico : new CronJob({
        //cronTime: '59 59 * * * 1-5', Lunes a Viernes a las 4:25:59
        //cronTime: '00 06 11 * * 1-6',
        cronTime: '* * * * * *',
        onTick: function() {
            if(!once){
                crearCierre(moment().unix(), ejecutarCierre);
            }
            once = true;
        },
        start: false,
        timeZone: "America/Costa_Rica"
    })
}
var once = false;

function ejecutarCierre(_idCierre){
    var hoy = new Date();
    console.log("Actualizando cierre en la fecha '"+hoy+"' y notificando a usuarios");

    //Fechas para encontrar información del día
    var epochMin = moment();
    epochMin.hours(0);
    epochMin.minutes(0);
    epochMin.seconds(0);

    var epochMax = moment();
    epochMax.hours(23);
    epochMax.minutes(59);
    epochMax.seconds(59);

    //Se realiza el cierre para todos los usuarios menos el tipo administrador
    Usuario.find({tipo:{"$ne":"Administrador"}},{_id:1, horario:1}).exec(
        function(err, usuarios){
            if(!err){
                for(usuario in usuarios){
                    if(usuarios[usuario].horario){
                        buscarHorarios(
                            usuarios[usuario].horario,
                            usuarios[usuario]._id,
                            epochMin, epochMax,
                            function(error, horario, _idHorario, _idUser, epochMin, epochMax){
                                if(!error && horario ){
                                    //&& horario.horaEntrada!="0:00"){
                                    //
                                    buscarInformacionUsuarioCierre(
                                        _idCierre, _idUser, 
                                        epochMin, epochMax, 
                                        horario
                                        );
                                    //
                                }
                            });
                    }
                }
            }
        });
}

function buscarInformacionUsuarioCierre(_idCierre, _idUser, epochMin, epochMax, horario){
    Marca.find(
    {
        usuario: _idUser,
        epoch: {
            "$gte": epochMin.unix(), 
            "$lte":epochMax.unix()
        }
    },
    {_id:0,tipoMarca:1,epoch:1}
    ).exec(function(error, arrayMarcas) {
        if (!error && arrayMarcas){

            var marcas = util.clasificarMarcas(arrayMarcas);
            if(!marcas.entrada){
                addJustIncompleta(_idUser, "Omisión de marca de entrada y salida");
                agregarUsuarioACierre(_idCierre, _idUser, {h:-1,m:-1});
            } else if(!marcas.salida){
                addJustIncompleta(_idUser, "Omisión de marca de salida");
                agregarUsuarioACierre(_idCierre, _idUser, util.contarHoras(marcas.entrada));
            } else {
                calculoHoras(_idCierre, _idUser, marcas, horario);
            }
            
        }
    });
}

function calculoHoras(_idCierre, _idUser, marcas, horario){
    var tiempo = util.tiempoTotal(marcas);
    var horas = horario.rangoJornada.split(":")[0];
    var margenMin = 15;

    agregarUsuarioACierre(_idCierre, _idUser, tiempo);
    //Si trabaja más de las horas estipuladas se notifica
    if( (tiempo.h-horas > 0) || 
        (tiempo.h-horas == 0 && tiempo.m > margenMin)
        )
        {addJustIncompleta(_idUser, "Cantidad de horas trabajadas mayor a la jornada asignada");} 
    //Si trabaja menos de las horas estipuladas se notifica
    else if( (horas-tiempo.h > 1) || 
        (horas-tiempo.h == 1 && 60-tiempo.m > margenMin)
        )
        {addJustIncompleta(_idUser, "Cantidad de horas trabajadas menor a la jornada asignada");}
}



function crearCierre(epoch, callback){
    var hoy = new Date();
    var queryCierre = {epoch:epoch};
    CierrePersonal.find(queryCierre).exec(function(error, cierres) {
        if(error) 
            console.log("Error al crear cierre en la fecha '"+hoy+"' Mensaje: "+error);
        if(!cierres || cierres.length==0){
            var nuevoCierre = new CierrePersonal(queryCierre);
            nuevoCierre.save(function (err, cierre) {
                if (err) 
                    console.log("Error al crear cierre en la fecha '"+hoy+"' Mensaje: "+error);
                callback(cierre._id);
            });
        } else{
            callback(cierres[0]._id);
        }
    });
}

function agregarUsuarioACierre(_idCierre, _idUser, tiempo){
    var hoy = new Date();
    var query = {
        "$push":{
            "usuarios":{
                usuario: _idUser,
                tiempo: {
                    horas:tiempo.h,
                    minutos:tiempo.m
                }
            }
        }
    };
    CierrePersonal.findByIdAndUpdate(_idCierre, query, function (err, cierreActualizado) {
        if(err) 
            console.log("Error al actualizar cierre en la fecha '"+hoy+"' Mensaje: "+error);
    });
}

function buscarHorarios(_idHorario, _idUser, epochMin, epochMax, callback){
    crud.loadHorario(_idHorario, function(error, horario){
        callback(error, horario, _idHorario, _idUser, epochMin, epochMax);
    });
}

function addJustIncompleta(_idUser, motivo){
    crud.addJust(
        {id:_idUser, detalle:"", 
        estado:"Incompleto", motivoJust:"otro",
        motivoOtroJust:motivo},
        function(){}
        ); 
}