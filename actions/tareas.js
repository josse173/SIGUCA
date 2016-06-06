
var moment = require('moment');
var Marca = require('../models/Marca');
var Usuario = require('../models/Usuario');
var CierrePersonal = require('../models/CierrePersonal');
var util = require('../util/util');
var CronJob = require('cron').CronJob;
var crud = require('../routes/crud');
var crudHorario = require('../routes/crudHorario');
var crudSolicitud = require('../routes/crudSolicitud');
var crudJustificaciones = require('../routes/crudJustificaciones');


module.exports = {
    cierreAutomatico : new CronJob({
        cronTime: '* * * * * *',
        //cronTime: '00 50 23 * * 0-7',
        onTick: function() {
            if(!once){
                ejecutarCierre();
            }
            once = true;
        },
        start: false,
        timeZone: "America/Costa_Rica"
    })
}
var once = false;

function crearCierre(epoch, ejecutar){
    var hoy = new Date();
    var queryCierre = {epoch:epoch};
    var nuevoCierre = new CierrePersonal(queryCierre);
    nuevoCierre.save(function (err, cierre) {
        if (err) 
            console.log("Error al crear cierre en la fecha '"+hoy+"' Mensaje: "+error);
        ejecutar(cierre._id);
    });
}

function ejecutarCierre(){
    var hoy = new Date();
    console.log("Realizando cierre en la fecha '"+hoy+"' y notificando a usuarios");

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
    Usuario.find({tipo:{"$ne":"Administrador"}},{_id:1, nombre:1, horarioEmpleado:1}).exec(
        function(err, usuarios){
            if(!err){
                for(usuario in usuarios){
                    //console.log(usuarios[usuario]);
                    //Solo se hacen los cierres para quien tenga el horario personalizado hecho
                    if(usuarios[usuario].horarioEmpleado && usuarios[usuario].horarioEmpleado!=""){
                        //console.log(usuarios[usuario].horarioEmpleado);
                        buscarHorario(usuarios[usuario]._id, 
                            epochMin, epochMax, usuarios[usuario].horarioEmpleado); 
                    }
                }
            } 
        });
}

function buscarHorario(_idUser, epochMin, epochMax, horarioEmpleado){
    crudHorario.getById(horarioEmpleado, 
        function(error, horario){
            if(!error && horario){
                buscarInformacionUsuarioCierre(
                 _idUser,epochMin, epochMax, horario);
            }
        });
}



function buscarInformacionUsuarioCierre( _idUser, epochMin, epochMax, horario){
    Marca.find(
    {
        usuario: _idUser,
        epoch: {
            "$gte": epochMin.unix(), 
            "$lte":epochMax.unix()
        }
    },
    {_id:0,tipoMarca:1,epoch:1}
    ).exec(function(error, marcasDelDia) {
        if (!error && marcasDelDia){
            var today = moment();
            var dia = ["domingo", "lunes", "martes", "miercoles", 
            "jueves", "viernes", "sabado"][today.day()];
            var marcas = util.clasificarMarcas(marcasDelDia);
            var tiempoDia = horario[dia];
            //Si entra a las 00:00 no contará ese día, en caso de ser así
            //el horario debería entrar como mínimo a las 00:01
            if((tiempoDia.entrada.hora!=0 || tiempoDia.entrada.minutos!=0)
                && (
                    tiempoDia.salida.hora>tiempoDia.entrada.hora ||
                    (tiempoDia.salida.hora==tiempoDia.entrada.hora
                        && tiempoDia.salida.minutos>tiempoDia.entrada.minutos)
                    )
                ){
                    //
                registroHorasRegulares(_idUser, marcas, tiempoDia, horario);
                
                if(!marcas.entrada){
                    //console.log("Omisión de marca de entrada");
                    addJustIncompleta(_idUser, "Omisión de marca de entrada", "");
                    agregarUsuarioACierre(_idUser, {h:-1,m:-1});
                } 
                //Solo se genera una notificación de omisión de marca de salida si
                //el usuario incumplió las horas de trabajo
                else if(!marcas.salida){
                    //console.log("Omisión de marca de salida");
                    addJustIncompleta(_idUser, "Omisión de marca de salida", "");
                    agregarUsuarioACierre(_idUser, {h:-1,m:-1});
                }
            }
        }
    });
}

function registroHorasRegulares(_idUser, marcas, tiempoDia, horario){
    var tiempo = util.tiempoTotal(marcas);
    var hIn = {
        h:tiempoDia.entrada.hora,
        m:tiempoDia.entrada.minutos,
    };
    var hOut = {
        h:tiempoDia.salida.hora,
        m:tiempoDia.salida.minutos,
    };
    var almuerzoT = {
        h:horario.tiempoAlmuerzo.hora,
        m:horario.tiempoAlmuerzo.minutos,
    };
    var recesoT = {
        h:horario.tiempoReceso.hora,
        m:horario.tiempoReceso.minutos,
    };
    var totalJornada = util.ajustarHoras(hOut, hIn);
    console.log("Calculando jornada de: "+_idUser);
    console.log(totalJornada);
    console.log(almuerzoT);
    totalJornada = util.ajustarHoras(totalJornada, almuerzoT);
    console.log(totalJornada);
    console.log(recesoT);
    totalJornada = util.ajustarHoras(totalJornada, recesoT);
    console.log(totalJornada);
    console.log(tiempo);
    var comparaH = util.compararHoras(totalJornada.h, totalJornada.m, tiempo.h, tiempo.m);
    agregarUsuarioACierre(_idUser, {h:tiempo.h,m:tiempo.m});
    //No importa la hora que salió, lo importante es que cumpla la jornada
    if(comparaH==1){
        console.log("Jornada laborada menor que la establecida");
        addJustIncompleta(_idUser, "Jornada laborada menor que la establecida", 
            "Horas trabajadas: "+ util.horaStr(tiempo.h, tiempo.m)+
            " - Horas establecidas: "+ util.horaStr(totalJornada.h, totalJornada.m));
    }
}

function agregarUsuarioACierre(_idUser, tiempo){
    var obj = {
        usuario: _idUser,
        tiempo: {
            horas:tiempo.h,
            minutos:tiempo.m
        },
        epoch: moment().unix()
    };
    var cierre = CierrePersonal(obj);
    cierre.save(function (err, cierreActualizado) {
        if(err) 
            console.log("Error al crear cierre en la fecha '"+hoy+"' => Mensaje: "+error);
    });
    /*var hoy = new Date();
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
            console.log("Error al actualizar cierre en la fecha '"+hoy+"' => Mensaje: "+error);
    });*/
}

function addJustIncompleta(_idUser, motivo, informacion){
    crudJustificaciones.addJust(
        {id:_idUser, detalle:"", informacion: informacion,
        estado:"Incompleto", motivoJust:"otro",
        motivoOtroJust:motivo},
        function(){}
        ); 
}
