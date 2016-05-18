
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
var crudHorario = require('../routes/crudHorario');


module.exports = {
    cierreAutomatico : new CronJob({
        //cronTime: '59 59 * * * 1-5', Lunes a Viernes a las 4:25:59
        //cronTime: '* * * * * *',
        cronTime: '00 50 23 * * 0-7',
        onTick: function() {
            //if(!once){
                crearCierre(moment().unix(), ejecutarCierre);
            /*}
            once = true;*/
        },
        start: false,
        timeZone: "America/Costa_Rica"
    })
}
var once = false;

function crearCierre(epoch, ejecutar){
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
                ejecutar(cierre._id);
            });
        } else{
            ejecutar(cierres[0]._id);
        }
    });
}

function ejecutarCierre(_idCierre){
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
                    if(usuarios[usuario].horarioEmpleado && usuarios[usuario].horarioEmpleado!=""){
                        //console.log(usuarios[usuario].horarioEmpleado);
                        buscarHorario(_idCierre, usuarios[usuario]._id, 
                            epochMin, epochMax, usuarios[usuario].horarioEmpleado); 
                    }
                }
            } 
        });
}

function buscarHorario(_idCierre, _idUser, epochMin, epochMax, horarioEmpleado){
    crudHorario.getById(horarioEmpleado, 
        function(error, horario){
            if(!error && horario){
                buscarInformacionUsuarioCierre(
                    _idCierre, _idUser,epochMin, epochMax, horario);
            }
        });
}



function buscarInformacionUsuarioCierre(_idCierre, _idUser, epochMin, epochMax, horario){
    //console.log(horario);
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
            var comparaH = 0;
            //Si entra a las 00:00 no contará ese día, en caso de ser así
            //el horario debería entrar como mínimo a las 00:01
            if(tiempoDia.entrada.hora>=0 && tiempoDia.entrada.minutos>0
                && (
                    tiempoDia.salida.hora>tiempoDia.entrada.hora ||
                    (tiempoDia.salida.hora==tiempoDia.entrada.hora
                        && tiempoDia.salida.minutos>tiempoDia.entrada.minutos)
                    )
                ){
                    //

                if(marcas.entrada){
                    var mIn = moment.unix(marcas.entrada.epoch);
                    var mReal = tiempoDia.entrada;
                    if(compararHoras(mIn.hour(), mIn.minutes(),mReal.hora,mReal.minutos)==1){
                        //console.log("Entrada tardía");
                        addJustIncompleta(_idUser, "Entrada tardía", 
                            "Hora de entrada: "+horaStr(mReal.hora, mReal.minutos)+
                            " - Hora de marca: "+horaStr(mIn.hour(), mIn.minutes()));
                    }
                } 
                if(marcas.salida){
                    //Si hubiera que reponer horas, contarlas aquí para que no 
                    //genere una justificación si se sabe que debe trabajar más ese día
                    var mOut= moment.unix(marcas.salida.epoch);
                    var mReal = tiempoDia.salida;
                    if(compararHoras(mOut.hour(), mOut.minutes(),mReal.hora,mReal.minutos)==-1){
                        //console.log("Salida antes de hora establecida");
                        addJustIncompleta(_idUser, "Salida antes de hora establecida", 
                            "Hora de salida: "+horaStr(mReal.hora, mReal.minutos)+
                            " - Hora de marca: "+horaStr(mOut.hour(), mOut.minutes()));
                    }
                    comparaH = calculoHoras(_idCierre, _idUser, marcas, tiempoDia);
                } 
                if(!marcas.entrada){
                    //console.log("Omisión de marca de entrada");
                    addJustIncompleta(_idUser, "Omisión de marca de entrada", "");
                    agregarUsuarioACierre(_idCierre, _idUser, {h:-1,m:-1});
                } 
                //Solo se genera una notificación de omisión de marca de salida si
                //el usuario incumplió las horas de trabajo
                if(!marcas.salida && comparaH==-1){
                    //console.log("Omisión de marca de salida");
                    addJustIncompleta(_idUser, "Omisión de marca de salida", "");
                    agregarUsuarioACierre(_idCierre, _idUser, {h:-1,m:-1});
                } 
            }
        }
    });
}
function horaStr(hora, minutos){
    var h = hora;
    var m = minutos;
    if(h<10) h = "0"+h;
    if(m<10) m = "0"+m;
    return h+":"+m;
}

function compararHoras(hIn, mIn, hOut, mOut){
    if(hIn==hOut && mIn==mOut) return 0;
    if(hIn==hOut && mIn>mOut) return 1;
    if(hIn==hOut && mIn<mOut) return -1;
    if(hIn<hOut) return -1;
    if(hIn>hOut) return 1;
} 
function diferenciaHoras(hIn, mIn, hOut, mOut){
    if(hIn==hOut && mIn==mOut) return {h:0,m:0};
    if(mIn>mOut) return {h:(hIn-hOut), m:(mIn-mOut)};
    if(mIn<mOut) return {h:(hIn-hOut)-1, m:60-(mOut-mIn)};
}  

function calculoHoras(_idCierre, _idUser, marcas, tiempoDia){
    var tiempo = util.tiempoTotal(marcas);
    var hIn = tiempoDia.entrada;
    var hOut = tiempoDia.salida;
    var totalJornada = diferenciaHoras(hOut.hora, hOut.minutos, hIn.hora, hIn.minutos);
    var comparaH = compararHoras(tiempo.h, tiempo.m, totalJornada.h, totalJornada.m);
    agregarUsuarioACierre(_idCierre, _idUser, {h:tiempo.h,m:tiempo.m});
    if(comparaH==-1){
        addJustIncompleta(_idUser, "Jornada laborada menor que la establecida", 
            "Horas trabajadas: "+ horaStr(tiempo.h, tiempo.m)+
             " - Horas establecidas: "+ horaStr(totalJornada.h, totalJornada.m));
        //console.log("Jornada laborada menor que la establecida");
    }
    if(comparaH==1){
        addJustIncompleta(_idUser, "Jornada laborada mayor que la establecida",
            "Horas trabajadas: "+ horaStr(tiempo.h, tiempo.m)+
             " - Horas establecidas: "+ horaStr(totalJornada.h, totalJornada.m));
        //console.log("Jornada laborada mayor que la establecida");
    }
    return comparaH;
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
    /*console.log(_idCierre);
    console.log(_idUser);
    console.log(tiempo);*/
    CierrePersonal.findByIdAndUpdate(_idCierre, query, function (err, cierreActualizado) {
        if(err) 
            console.log("Error al actualizar cierre en la fecha '"+hoy+"' => Mensaje: "+error);
        //console.log(cierreActualizado);
    });
}



function addJustIncompleta(_idUser, motivo, informacion){
    crud.addJust(
        {id:_idUser, detalle:"", informacion: informacion,
        estado:"Incompleto", motivoJust:"otro",
        motivoOtroJust:motivo},
        function(){}
        ); 
}

/*
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
*/