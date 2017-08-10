var mongoose 		= require('mongoose'),
nodemailer 			= require('nodemailer'),
moment 				= require('moment'),
Usuario 			= require('../models/Usuario'),
cierre 				= require('../actions/tareas.js'),
Marca 				= require('../models/Marca'),
util 				= require('../util/util'),
crudHorario 		= require('./crudHorario'),
crud 				= require('./crud'),
crudJustificaciones = require('../routes/crudJustificaciones'),
config 				= require('../config.json');
cierrePersonal 		= require ('../models/CierrePersonal.js');

//--------------------------------------------------------------------
//		Métodos Marcas
//---------------------------------------------------------------------
exports.addMarca = function(m, cb){
	marca(m, cb);
}

function saveMarca(m, cb, msg){
	m.save(function (err, marca) {
		var msjOk = "Marca registrada correctamente.";
		var msjError = "No se pudo contactar con el sistema. \n"+
		"El error ocurrió al realizar marca y esta no se registró.";
		//
		err ? cb(msjError, msg) : cb(msjOk, msg);
	});
}

function marca (marca, cb) {
	if(marca.tipoMarca != 'error') {
		var date = moment(),
		epochTime = date.unix(),
		epochTimeGte = date.hours(0).minutes(0).seconds(0).unix(),
		epochTimeLte = date.hours(23).minutes(59).seconds(59).unix();
		marca.epoch = epochTime;
		var newMarca = Marca(marca);
		
		Marca.find(
		{
			epoch:{'$gte': epochTimeGte, '$lte': epochTimeLte}, 
			usuario: newMarca.usuario
		}).sort({epoch: 1}).exec(function (err, marcas){
			var marcas = util.clasificarMarcas(marcas);
			if(newMarca.tipoMarca=="Entrada" ){
				if(!marcas.entrada && !marcas.salida
					&& !marcas.almuerzoIn && !marcas.almuerzoOut
					&& marcas.recesos.length==0){
						//
					return revisarMarca(newMarca.usuario, newMarca,
						function(msg){
							saveMarca(newMarca,cb,msg);
						});
				}
				else cb("La marca de entrada fue registrada anteriormente.");
			}
			else if(newMarca.tipoMarca=="Salida"){
				if(marcas.entrada && !marcas.salida
					&& (
						(marcas.almuerzoIn && marcas.almuerzoOut) ||
						(!marcas.almuerzoIn && !marcas.almuerzoOut)
						)
					&& (
						marcas.recesos.length==0 ||
						marcas.recesos[marcas.recesos.length-1].recesoIn
						)){
						//
					var msgTem = revisarMarca(newMarca.usuario, newMarca,
						function(msg){
							saveMarca(newMarca,cb,msg);
							cierre.ejecutarCierrePorUsuarioAlMarcarSalida(newMarca.usuario);
							//cierre.ejecutarCierre();
						
						});
					
					
					return msgTem;
				}
				else cb("La marca de salida no fue registrada, ya que fue registrada anteriormente,"+
					"se encuentra en almuerzo o en receso.");
			}
			//
			else if(newMarca.tipoMarca=="Salida a Receso"){
				if(marcas.entrada && !marcas.salida
					&& (
						(marcas.almuerzoIn && marcas.almuerzoOut) ||
						(!marcas.almuerzoIn && !marcas.almuerzoOut)
						)
					&& (
						marcas.recesos.length==0 ||
						marcas.recesos[marcas.recesos.length-1].recesoIn
						)){
						//
					return saveMarca(newMarca,cb);
				}
				else cb("La marca de salida a receso no fue registrada, "+
					"ya que no ha marcado entrada, ya marcó la salida o "+
					"se encuentra en almuerzo o en otro receso");
			}
			//
			else if(newMarca.tipoMarca=="Entrada de Receso"){
				if(marcas.entrada && !marcas.salida
					&& (
						(marcas.almuerzoIn && marcas.almuerzoOut) ||
						(!marcas.almuerzoIn && !marcas.almuerzoOut)
						)
					&&  (
						marcas.recesos.length>0 &&
						!marcas.recesos[marcas.recesos.length-1].recesoIn
						)
					){
						//
					return saveMarca(newMarca,cb);
				}
				else cb("La marca de entrada a receso no fue registrada, "+
					"ya que no ha marcado entrada, ya marcó la salida, "+
					"se encuentra en almuerzo o no ha marcado para salir a receso.");
			}
			//
			else if(newMarca.tipoMarca=="Salida al Almuerzo"){
				if(marcas.entrada && !marcas.salida
					&& !marcas.almuerzoOut && !marcas.almuerzoIn
					&& (
						marcas.recesos.length==0 ||
						marcas.recesos[marcas.recesos.length-1].recesoIn
						)
					){
						//
					return saveMarca(newMarca,cb);
				}
				else cb("La marca de salida a almuerzo no fue registrada, "+
					"ya que no ha marcado entrada, ya marcó la salida o "+
					"ya se encuentra en almuerzo o receso.");
			}
			//
			else if(newMarca.tipoMarca=="Entrada de Almuerzo"){
				if(marcas.entrada && !marcas.salida
					&& marcas.almuerzoOut && !marcas.almuerzoIn
					&& (
						marcas.recesos.length==0 ||
						marcas.recesos[marcas.recesos.length-1].recesoIn
						)
					){
						//
					return saveMarca(newMarca,cb);
				}
				else cb("La marca de entrada de almuerzo no fue registrada, "+
					"ya que no ha marcado entrada, ya marcó la salida, "+
					"se encuentra en receso o no ha marcado para salir a almuerzo.");
			}
			//
			else if(newMarca.tipoMarca=="Entrada a extras"){
				if(
					(marcas.entrada && marcas.salida) ||
					(!marcas.entrada && !marcas.salida) 
					){
						//
					return saveMarca(newMarca,cb);
				}
				else cb("La marca de entrada a horas extras no fue registrada, "+
					"ya que no ha salido de la jornada regular.");
			}
			//
			else if(newMarca.tipoMarca=="Salida de extras"){
				if(
					(marcas.entrada && marcas.salida) ||
					(!marcas.entrada && !marcas.salida) 
					){
						//Falta validar que se haya entrado a las horas extras primero
						//
						return saveMarca(newMarca,cb);
					}
					else cb("La marca de salida de horas extras no fue registrada, "+
						"ya que no ha salido de la jornada regular o no ha marcado"+
						" entrada a las horas extras.");
				}
			else return cb("Surgió un error no contemplado con la marca,"+
				"vuelva a intentarlo o contacto con el administrador");
		});
		//
	}
}

exports.deleteMarca = function(id,tipoMarca,usuarioId, cb){
	
	var epochMin = moment();
    epochMin.hours(0);
    epochMin.minutes(0);
    epochMin.seconds(0);

    var epochMax = moment();
    epochMax.hours(23);
    epochMax.minutes(59);
    epochMax.seconds(59);


	Marca.findById(id, function (err, marca) {
		var epoch = moment().unix();
		if(!marca){
			return cb('La marca había sido eliminada anteriormente');
		} 
		else if(marca && epoch - marca.epoch <= 600){
			Marca.findByIdAndRemove(id, function (err, marca) {
				if (err) cb(err);
			if(tipoMarca=="Salida"){
				
				
				cierrePersonal.remove({'usuario':usuarioId,epoch: { "$gte": epochMin.unix(),"$lte":epochMax.unix()}},function(err,cierre){
					
				});
				
				
				
				
			}
		
				return cb('Se eliminó correctamente.');
			});
		} else {
			return cb('No se eliminó la marca <strong>' + marca.tipoMarca + '</strong>');
		}
	});
}
exports.find = function(query, cb){
	Marca.find(query, function (err, marcas) {
		cb(err, marcas);
	});
}


exports.rfidReader = function(codTarjeta, tipoMarca, cb) {
	Usuario.findOne({codTarjeta: codTarjeta}, function (err, usuario) {
		var tipo;
		if(tipoMarca == 1) {
			tipo = 'Entrada';
		} else if(tipoMarca == 2) {
			tipo = 'Salida a Receso';
		} else if(tipoMarca == 3) {
			tipo = 'Entrada de Receso';
		} else if(tipoMarca == 4) {
			tipo = 'Salida al Almuerzo';
		} else if(tipoMarca == 5) {
			tipo = 'Entrada de Almuerzo';
		} else if(tipoMarca == 6){
			tipo = 'Salida';
		} else tipo = 'error';
		marca({usuario: usuario, tipoMarca: tipo}, 
			function(msj){					
				return cb(msj);
			});
	});
}

function revisarMarca(_idUser, marca, cb){
	
	var epochMin = moment();
	epochMin.hours(0);
	epochMin.minutes(0);
	
	var epochMax = moment();
	epochMax.hours(23);
	epochMax.minutes(59);
	epochMax.seconds(59);
	Usuario.findById(_idUser,{_id:1, nombre:1, horarioEmpleado:1}).exec(
		function(err, usuario){
			if(!err && usuario.horarioEmpleado && usuario.horarioEmpleado!=""){
				crudHorario.getById(usuario.horarioEmpleado, 
					function(error, horario){
						if(!error && horario){
							var today = moment();
							var dia = ["domingo", "lunes", "martes", "miercoles", 
							"jueves", "viernes", "sabado"][today.day()];
							var tiempoDia = horario[dia];

							/**
							 * Se agrega el tiempo de grancia para la marca de entrada y de salida
							 */
							//Rango entrada
							if(tiempoDia.entrada.minutos + config.rangoMarcaEntrada > 60){
								tiempoDia.entrada.hora += 1;
								tiempoDia.entrada.minutos = (tiempoDia.entrada.minutos + config.rangoMarcaEntrada) - 60;
							}else{
								tiempoDia.entrada.minutos += config.rangoMarcaEntrada;
							}

							//Rango salida
							if(tiempoDia.salida.minutos - config.rangoMarcaSalida < 0){
								tiempoDia.salida.hora -= 1;
								tiempoDia.salida.minutos = 60 - (config.rangoMarcaSalida - tiempoDia.salida.minutos);
							}else{
								tiempoDia.salida.minutos -= config.rangoMarcaSalida;
							}
							/**
							 * FIN agregar rango de tiempo
							 */

							//console.log(tiempoDia);
							if((tiempoDia.entrada.hora!=0 || tiempoDia.entrada.minutos!=0)
								&& (
									tiempoDia.salida.hora>tiempoDia.entrada.hora ||
									(tiempoDia.salida.hora==tiempoDia.entrada.hora
										&& tiempoDia.salida.minutos>tiempoDia.entrada.minutos)
									)
								)
							{
								//console.log(marca);
								if(marca.tipoMarca=="Entrada"){
									var mIn = moment.unix(marca.epoch);
									var mReal = tiempoDia.entrada;
									if(util.compararHoras(mIn.hour(), mIn.minutes(),mReal.hora,mReal.minutos)==1){
										addJustIncompleta(_idUser, "Entrada tardía", 
											"Hora de entrada: "+ util.horaStr(mReal.hora, mReal.minutos)+
											" - Hora de marca: "+ util.horaStr(mIn.hour(), mIn.minutes()),cb);
									}
									else cb("");
								} else if(marca.tipoMarca=="Salida"){
									var mOut= moment.unix(marca.epoch);
									var mReal = tiempoDia.salida;

									workedHour(_idUser, tiempoDia, mOut, mReal,cb);
									/*
									if(util.determinarJustificacion(tiempoDia)==0){
										addJustIncompleta(_idUser, "Salida antes de hora establecida", 
											"Hora de salida: "+ util.horaStr(mReal.hora, mReal.minutos)+
											" - Hora de marca: "+ util.horaStr(mOut.hour(), mOut.minutes()), cb);
									}
									else cb("");
									*/
									
								} 
								else cb("");
                        		//Evaluar si se pasó el tiempo de receso o almuerzo
                        	}
                        	else cb("");
                        }
                        else cb("");
                    });
				//
			}
			else cb("");
		});
	//
}





function workedHour(_idUser,horario, mOut, mReal,cb){

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
				

				var horas = transcurridoHorasTotal;
				var minutos = transcurridoMinutosTotal;
				
				var obj=new Object();
				obj.horas=horas;
				obj.minutos=minutos;
				



				var horaSalida= parseInt(horario.salida.hora-config.periodoLibreTrabajo);
				var horaEntrada= parseInt(horario.entrada.hora);
				var minutoSalida=parseInt(horario.salida.minutos);
				var minutoEntrada=parseInt(horario.entrada.minutos-config.rangoMarcaEntrada);

				
				temporalMinutoSalida=minutoSalida;
				temporalHoraSalida=horaSalida;

				horaSalida=horaSalida-horaEntrada;
				minutoSalida=minutoSalida-minutoEntrada;

				if(horaSalida>0 && minutoSalida<0 ){
					horaSalida--;
					minutoSalida=60+minutoSalida;
				}else if(horaSalida<0 && minutoSalida>0){
					horaSalida=24-horaEntrada;
				}else if(horaSalida==0 && minutoSalida<0){
					horaSalida=0;
					minutoSalida=minutoEntrada-temporalMinutoSalida;
				}
				

				if(horaSalida>obj.horas){
					addJustIncompleta(_idUser, "Salida antes de hora establecida", 
											"Hora de salida: "+ util.horaStr(mReal.hora, mReal.minutos)+
											" - Hora de marca: "+ util.horaStr(mOut.hour(), mOut.minutes()), cb);

				}else if(obj.horas==horaSalida){
					if(minutoSalida>obj.minutos){
						addJustIncompleta(_idUser, "Salida antes de hora establecida", 
											"Hora de salida: "+ util.horaStr(mReal.hora, mReal.minutos)+
											" - Hora de marca: "+ util.horaStr(mOut.hour(), mOut.minutes()), cb);

					}
				}
				else{
					cb("");
				}

		});


}

function addJustIncompleta(_idUser, motivo, informacion, cb){
	crudJustificaciones.addJust(
		{id:_idUser, detalle:"", informacion: informacion,
		estado:"Incompleto", motivoJust:"otro",
		motivoOtroJust:motivo},
		function(err, just){
			if(!err) cb(motivo);
			else cb("");
		}
		); 
}