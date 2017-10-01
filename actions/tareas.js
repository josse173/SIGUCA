
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
        //cronTime: '* * * * * *',
        cronTime: '00 50 23 * * 0-7',
        onTick: function() {
            //if(!once){
                var hoy = new Date();
                console.log("Realizando cierre en la fecha '"+hoy+"' y notificando a usuarios");
                ejecutarCierre();
            //}
            //once = true;
        },
        start: false,
        timeZone: "America/Costa_Rica"
    }),
    aumentoVacacionesAutomatico : new CronJob({
        //cronTime: '* * * * * *',
        cronTime: '0 0 9 * * 0-7',
        onTick: function() {
                var hoy = new Date();
                console.log("Realizando cierre en la fecha '"+hoy+"' y notificando a usuarios");

                console.log("{======= Realizando aumento de vacaciones =======}");
        },
        start: false,
        timeZone: "America/Costa_Rica"
    }),

    ejecutarCierrePorUsuarioAlMarcarSalida:function(tipoUsuario,id){
    

    var hoy = new Date();

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
    Usuario.find({_id:id},{_id:1, nombre:1, horarioEmpleado:1,tipoUsuario:1}).exec(
        function(err, usuarios){
            if(!err && usuarios[0].horarioEmpleado){
              
                for(usuario in usuarios){
                  
                    //console.log(usuarios[usuario]);
                    //Solo se hacen los cierres para quien tenga el horario personalizado hecho
                    if(usuarios[usuario].horarioEmpleado && usuarios[usuario].horarioEmpleado!=""){
                        //console.log(usuarios[usuario].horarioEmpleado);
                        buscarHorario(usuarios[usuario]._id, tipoUsuario,
                            epochMin, epochMax, usuarios[usuario].horarioEmpleado); 
                    }
                }
            }
            else{
                 Usuario.find({_id:id},{_id:1, nombre:1, horario:1,tipoUsuario:1}).exec(
                    function(error, usuario){
                        if(!err && usuario[0].horario){
                            var epochTime = moment().unix();
                            cierreHorario(id,usuario[0].horario,epochTime,tipoUsuario);
                           
                        }
                        else{
                            Usuario.find({_id:id},{_id:1, nombre:1, horarioFijo:1,tipoUsuario:1}).exec(
                             function(error, usuario){
                                 if(!err && usuario[0].horarioFijo){
                                     var epochTime = moment().unix();
                                    cierreHorario(id,usuario[0].horarioFijo,epochTime,tipoUsuario); 
                                 }
                             }); 
                        
                        }
                        
                           
                        
                });
    
        }
        });
    }
    
}

function cierreHorario(_idUser,horarioEmpleado,mOut,tipoUsuario){
    var date =  moment().format('L').split("/");
	var epochGte = moment();
	epochGte.year(date[2]).month(date[0]-1).date(date[1]);
	epochGte.hour(0).minutes(0).seconds(0);
	var epochLte = moment();
	epochLte.year(date[2]).month(date[0]-1).date(date[1]);
	epochLte.hour(23).minutes(59).seconds(59);


	Marca.find({
		usuario:_idUser,
		epoch:{
		"$gte":epochGte.unix(),
		"$lte":epochLte.unix()
	}}, function (err, marcas) {
		

	var m2 ="ok";
	if(err) m2 = err;
	varepoch: mcs = [];
	var ml = util.unixTimeToRegularDate(marcas);
	for(x in ml){
		var obj = {};
		obj.fecha = ml[x].fecha;
		obj.tipoMarca = ml[x].tipoMarca;
		mcs.push(obj);
	}
	

		for(m in mcs){
			if(mcs[m].tipoMarca=='Entrada'){
				var tiempoEntrada = mcs[m].fecha.hora;
			}
			if(mcs[m].tipoMarca=='Salida'){
				var tiempoSalida =mcs[m].fecha.hora;
			}
			if(mcs[m].tipoMarca=='Salida a Receso'){
				var tiempoSalidaReceso = mcs[m].fecha.hora;
			}
			if(mcs[m].tipoMarca=='Entrada de Receso'){
				var tiempoEntradaReceso =mcs[m].fecha.hora;
			}
			if(mcs[m].tipoMarca=='Salida al Almuerzo'){
				var tiempoSalidaAlmuerzo = mcs[m].fecha.hora ;
			}
			if(mcs[m].tipoMarca=='Entrada de Almuerzo'){
				var tiempoEntradaAlmuerzo =mcs[m].fecha.hora ;
			}
		}


		finMinutos =moment().format();
		finMinutos=parseInt(String(finMinutos).substr(14,2));
						
		inicioMinutos = parseInt(tiempoEntrada.substr(3,2));
			
		inicioHoras = parseInt(String(tiempoEntrada).substr(0,2));
		
		finHoras=moment().format();
		finHoras = parseInt(String(finHoras).substr(11,2));

		
		var transcurridoMinutos = finMinutos - inicioMinutos;
		var transcurridoHoras = finHoras - inicioHoras;  //bloque de salida y entrada

		if(tiempoSalidaReceso!=null){
		var inicioRecesoMinutos = parseInt(String(tiempoSalidaReceso).substr(3,2));
		var inicioRecesoHoras = parseInt(String(tiempoSalidaReceso).substr(0,2));
		var finRecesoMinutos = parseInt(String(tiempoEntradaReceso).substr(3,2));
		var finRecesoHoras = parseInt(String(tiempoEntradaReceso).substr(0,2));
		var transcurridoRecesoMinutos = finRecesoMinutos - inicioRecesoMinutos;
		var transcurridoRecesoHoras = finRecesoHoras - inicioRecesoHoras;//bloque para recesos 
		}else{
			transcurridoRecesoHoras = 0;
			transcurridoRecesoMinutos = 0;
		}
		if(tiempoSalidaAlmuerzo!=null){
		var inicioAlmuerzoMinutos = parseInt(String(tiempoSalidaAlmuerzo).substr(3,2));
		var inicioAlmuerzoHoras = parseInt(String(tiempoSalidaAlmuerzo).substr(0,2));
		var finAlmuerzoMinutos = parseInt(String(tiempoEntradaAlmuerzo).substr(3,2));
		var finAlmuerzoHoras = parseInt(String(tiempoEntradaAlmuerzo).substr(0,2));
		var transcurridoAlmuerzoMinutos = finAlmuerzoMinutos - inicioAlmuerzoMinutos;
		var transcurridoAlmuerzoHoras = finAlmuerzoHoras - inicioAlmuerzoHoras;//bloque para almuerzos
		}else{
			transcurridoAlmuerzoMinutos = 0;
			transcurridoAlmuerzoHoras = 0;
		}

		var transcurridoHorasTotal = transcurridoHoras - transcurridoRecesoHoras - transcurridoAlmuerzoHoras;
		var transcurridoMinutosTotal = transcurridoMinutos - transcurridoRecesoMinutos - transcurridoAlmuerzoMinutos;
		

		if (transcurridoMinutosTotal < 0) {
			transcurridoHorasTotal--;
			transcurridoMinutosTotal = 60 + transcurridoMinutosTotal;
		}
		

		var horasTrabajadas = transcurridoHorasTotal;
        var minutosTrabajados = transcurridoMinutosTotal;	

       var obj = {
        usuario: _idUser,
        tipoUsuario: tipoUsuario,
        tiempo: {
            horas:horasTrabajadas,
            minutos:minutosTrabajados
        },
        epoch: moment().unix()
        };
        var cierre = CierrePersonal(obj);
        cierre.save(function (err, cierreActualizado) {
            if(err) 
             console.log("Error al crear cierre en la fecha '"+hoy+"' => Mensaje: "+error);
        });

        
    });

}


function ejecutarCierre(){
    var hoy = new Date();

    //Fechas para encontrar información del día
    var epochMin = moment();
    epochMin.hours(0);
    epochMin.minutes(0);
    epochMin.seconds(0);

    var epochMax = moment();
    epochMax.hours(23);
    epochMax.minutes(59);
    epochMax.seconds(59);
    var contador=0;
    //Se realiza el cierre para todos los usuarios menos el tipo administrador
    var entro =false;
    Usuario.find({tipo:{"$ne":"Administrador"}},{_id:1, nombre:1, horarioEmpleado:1,tipo:1}).exec(
        function(err, usuarios){
            if(!err){
                CierrePersonal.find({epoch: { "$gte": epochMin.unix(),"$lte":epochMax.unix()}}).exec(function(error,cierre){
                    if(!error){
                        
                        for(var i=0;i<usuarios.length;i++){
                            entro=false;

                            var arrayTipo = new Array();
                            if(usuarios[i].tipo.length>1){
                                for( var s in usuarios[i].tipo){
                                    arrayTipo.push(usuarios[i].tipo[s]); 
                                }
                            } else {
                                arrayTipo.push(usuarios[i].tipo);
                            }

                            for( var t in arrayTipo){
                                
                                entro=false;
                                var valor= arrayTipo[t];
                                //Recorre los cierres buscando coincidencia con el tipo t
                                for(var j=0;j<cierre.length;j++){

                                    //Valida si cada tipo del usuario tiene cierre sino lo genera
                                    if(usuarios[i]._id.equals(cierre[j].usuario) && valor==cierre[j].tipoUsuario){
                                        entro= true;
                                        j=cierre.length;
                                    } 
                                }

                                //Si no tiene cierres este usuario con este rol se genera el cierre
                                if(!entro && usuarios[i].horarioEmpleado && usuarios[i].horarioEmpleado!=""){
                                   
                                    buscarHorario(usuarios[i]._id,valor,epochMin, epochMax, usuarios[i].horarioEmpleado); 
                                }
                            }
                            
                        }
                            
                    }  
                            
                        
                });
            }
        });
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







function buscarHorario(_idUser, tipoUsuario, epochMin, epochMax, horarioEmpleado){

    crudHorario.getById(horarioEmpleado, 
        function(error, horario){
            if(!error && horario){
                buscarInformacionUsuarioCierre(
                 tipoUsuario,_idUser,epochMin, epochMax, horario);
            }
        });
}



function buscarInformacionUsuarioCierre( tipoUsuario,_idUser, epochMin, epochMax, horario){
  
    Marca.find(
    {
        usuario: _idUser,
        tipoUsuario:tipoUsuario,
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
               
                registroHorasRegulares(tipoUsuario, _idUser, marcas, tiempoDia, horario);
                console.log("horas regulares");
                if(!marcas.entrada){
                    addJustIncompleta(_idUser, "Omisión de marca de entrada", "");
                    //agregarUsuarioACierre(tipoUsuario,_idUser, {h:0,m:0});
                } 
                //Solo se genera una notificación de omisión de marca de salida si
                //el usuario incumplió las horas de trabajo
                else if(!marcas.salida){
                  

                    //console.log("Omisión de marca de salida");
                    addJustIncompleta(_idUser, "Omisión de marca de salida", "");
                   // agregarUsuarioACierre(tipoUsuario,_idUser, {h:0,m:0});
                }
            }
        }
    });
}

function registroHorasRegulares(tipoUsuario, _idUser, marcas, tiempoDia, horario){
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
    agregarUsuarioACierre(tipoUsuario, _idUser, {h:tiempo.h,m:tiempo.m});
    //No importa la hora que salió, lo importante es que cumpla la jornada
    if(comparaH==1){
        console.log("Jornada laborada menor que la establecida");
        addJustIncompleta(_idUser, "Jornada laborada menor que la establecida", 
            "Horas trabajadas: "+ util.horaStr(tiempo.h, tiempo.m)+
            " - Horas establecidas: "+ util.horaStr(totalJornada.h, totalJornada.m));
    }
}

function agregarUsuarioACierre(tipoUsuario, _idUser, tiempo){
    var obj = {
        usuario: _idUser,
        tipoUsuario: tipoUsuario,
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
}

function addJustIncompleta(_idUser, motivo, informacion){
    crudJustificaciones.addJust(
        {id:_idUser, detalle:"", informacion: informacion,
        estado:"Incompleto", motivoJust:"otro",
        motivoOtroJust:motivo},
        function(){}
        ); 
}
