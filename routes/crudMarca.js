var mongoose 		= require('mongoose'),
nodemailer 			= require('nodemailer'),
moment 				= require('moment'),
Usuario 			= require('../models/Usuario'),
cierre 				= require('../actions/tareas.js'),
Marca 				= require('../models/Marca'),
Usuario 			= require('../models/Usuario'),
Horario 			= require('../models/Horario'),
Red 			    = require('../models/Red'),
HorarioFijo 		= require('../models/HorarioFijo'),
Alerta             = require('../models/Alerta'),
util 				= require('../util/util'),
crudHorario 		= require('./crudHorario'),
crud 				= require('./crud'),
crudJustificaciones = require('../routes/crudJustificaciones'),
config 				= require('../config.json');
cierrePersonal 		= require ('../models/CierrePersonal.js');
var contador=0;
//justificaciones 	= require ('../models/Justificaciones.js');
//--------------------------------------------------------------------
//		Métodos Marcas
//---------------------------------------------------------------------
exports.addMarca = function(ipOrigen,tipoUsuario,m, cb){

	marca(ipOrigen,tipoUsuario, m, cb);
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

function marca (ipOrigen,tipoUsuario, marca, cb) {

	if(marca.tipoMarca != 'error') {
		var date = moment(),
		epochTime = date.unix(),
		epochTimeGte = date.hours(0).minutes(0).seconds(0).unix(),
		epochTimeLte = date.hours(23).minutes(59).seconds(59).unix();
		marca.epoch = epochTime;
		if(!marca.dispositivo){
			marca.dispositivo="Computadora";
		}

		var arrayOrigen=ipOrigen.split(".");
		var tempRed;
		if(arrayOrigen.length>=3){
			for(var i=0;i<3;i++){
				if(i==0)
				tempRed=arrayOrigen[i];
				else
				tempRed=tempRed+"."+arrayOrigen[i];
			}

		}

		marca.ipOrigen=ipOrigen;
		var newMarca = Marca(marca);
		Red.find({nombreRed:tempRed},function(err,redes){
			if(!err &&redes.length>0 ){
				if(redes.length>0){
					newMarca.red="local";
				}
			}else if(marca.ipOrigen!=""){
				newMarca.red="remota";
			}else if(marca.ipOrigen==""){
				newMarca.red="Desconocida";
			}


		if(newMarca.red=="local"){
			Marca.find(
				{
					epoch:{'$gte': epochTimeGte, '$lte': epochTimeLte},
					usuario: newMarca.usuario,
					tipoUsuario: tipoUsuario
				}).sort({epoch: 1}).exec(function (err, marcas){
					var marcas = util.clasificarMarcas(marcas);
					if(newMarca.tipoMarca=="Entrada" ){
						if(!marcas.entrada && !marcas.salida
							&& !marcas.almuerzoIn && !marcas.almuerzoOut
							&& marcas.recesos.length==0){
								//
							return revisarMarca(tipoUsuario, newMarca.usuario, newMarca,
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
							var msgTem = revisarMarca(tipoUsuario, newMarca.usuario, newMarca,
								function(msg){
									saveMarca(newMarca,cb,msg);
									cierre.ejecutarCierrePorUsuarioAlMarcarSalida(tipoUsuario,newMarca.usuario);
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
		}else{
			Usuario.findById(newMarca.usuario,function(error,empleado){
				if(!error && empleado){
					if(empleado.teleTrabajo=="on"){
						Marca.find(
							{
								epoch:{'$gte': epochTimeGte, '$lte': epochTimeLte},
								usuario: newMarca.usuario,
								tipoUsuario: tipoUsuario
							}).sort({epoch: 1}).exec(function (err, marcas){
								var marcas = util.clasificarMarcas(marcas);
								if(newMarca.tipoMarca=="Entrada" ){
									if(!marcas.entrada && !marcas.salida
										&& !marcas.almuerzoIn && !marcas.almuerzoOut
										&& marcas.recesos.length==0){
											//
										return revisarMarca(tipoUsuario, newMarca.usuario, newMarca,
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
										var msgTem = revisarMarca(tipoUsuario, newMarca.usuario, newMarca,
											function(msg){
												saveMarca(newMarca,cb,msg);
												cierre.ejecutarCierrePorUsuarioAlMarcarSalida(tipoUsuario,newMarca.usuario);
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

					}else{
						return cb("El usuario no tiene permiso para marcar de manera remota");
					}
				}
			});
		}

	});//Consulta redes

	}
}

function verificarRed(tempRed,cb){
	Red.find({nombreRed:tempRed},function(err,redes){
		if(!err &&redes.length>0 ){
			if(redes.length>0){
				cb("local");
			}else{
				cb("remota");
			}
		}

	});

}

exports.deleteMarca = function(id,tipoMarca,usuarioId, tipoUsuario, cb){



	var date = new Date();
	var epoch1 = (date.getTime() - date.getMilliseconds())/1000-200;
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


				cierrePersonal.remove({'usuario':usuarioId, tipoUsuario:tipoUsuario, epoch: { "$gte": epochMin.unix(),"$lte":epochMax.unix()}},function(err,cierre){

				});
				crudJustificaciones.deleteJustificationExit(usuarioId,epoch1,epochMax.unix());
				/*
				justificaciones.remove({'usuario':usuarioId,fechaCreada: { "$gte": epoch1 ,"$lte":epochMax.unix()}},function(err,marcaE){

				});
				*/

			}else if(tipoMarca=="Entrada"){
				crudJustificaciones.deleteJustificationEntrance(usuarioId,epochMin.unix(),epochMax.unix());
				/*
				justificaciones.remove({'usuario':usuarioId,fechaCreada: { "$gte": epochMin.unix(),"$lte":epochMax.unix()}},function(err,marcaE){});
				*/
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

exports.rfidReader = function(tipoUsuario, codTarjeta, tipoMarca, ip, cb) {
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

		marca(ip, tipoUsuario, {usuario: usuario.id, tipoMarca: tipo,tipoUsuario: tipoUsuario,dispositivo:"Pi"},
			function(msj){
				return cb(msj);
			});
	});
}

function revisarMarca(tipoUsuario, _idUser, marca, cb){


	var epochMin = moment();
	epochMin.hours(0);
	epochMin.minutes(0);

	var epochMax = moment();
	epochMax.hours(23);
	epochMax.minutes(59);
	epochMax.seconds(59);
	Usuario.findById(_idUser).exec(
		function(err, usuario){
			if(!err && usuario.horarioEmpleado && usuario.horarioEmpleado!=""){
				crudHorario.getById(usuario.horarioEmpleado,
					function(error, horario){
						if(!error && horario){
							var today = moment();
							var dia = ["domingo", "lunes", "martes", "miercoles",
							"jueves", "viernes", "sabado"][today.day()];
							var tiempoDia = horario[dia];
							var horarioOriginal={minutos:tiempoDia.entrada.minutos,
												hora:tiempoDia.entrada.hora};


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
										if( tipoUsuario != config. empleadoProfesor){

											addJustIncompleta(_idUser, "Entrada tardía",
												"Hora de entrada: "+ util.horaStr(horarioOriginal.hora, horarioOriginal.minutos)+
												" - Hora de marca: "+ util.horaStr(mIn.hour(), mIn.minutes()),cb);

										}else cb("");
									}
									else cb("");
								} else if(marca.tipoMarca=="Salida"){

									var mOut= moment.unix(marca.epoch);
									var mReal = tiempoDia.salida;

									if(tipoUsuario != config. empleadoProfesor){
											workedHour(_idUser, tiempoDia, mOut, mReal,cb);
										}
										else cb("");



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
			else if(!err && usuario.horarioFijo && usuario.horarioFijo!=""){

				HorarioFijo.findById(usuario.horarioFijo,function(error,horarioFijo){
					if(!error && horarioFijo!="" && horarioFijo){
							var mOut= moment.unix(marca.epoch);
							var today = moment();
							var dia = ["Domingo", "Lunes", "Martes", "Miercoles",
							"Jueves", "Viernes", "Sabado"][today.day()];
							var tiempoDia = horarioFijo[dia];


							var horarioOriginal={minutos:parseInt(String(horarioFijo.horaEntrada).substr(3,2)),
								hora:parseInt(String(horarioFijo.horaEntrada).substr(0,2))};

							if(tiempoDia){
								var minutosEntrada,minutosSalida,horaEntrada,horaSalida;
								minutosEntrada=parseInt(String(horarioFijo.horaEntrada).substr(3,2));
								minutosSalida=parseInt(String(horarioFijo.horaSalida).substr(3,2));
								horaEntrada=parseInt(String(horarioFijo.horaEntrada).substr(0,2));
								horaSalida=parseInt(String(horarioFijo.horaSalida).substr(0,2));


								/**
							 * Se agrega el tiempo de grancia para la marca de entrada y de salida
							 */
							//Rango entrada
							if(minutosEntrada + config.rangoMarcaEntrada > 60){
								horaEntrada += 1;
								minutosEntrada = (minutosEntrada + config.rangoMarcaEntrada) - 60;
							}else{
								minutosEntrada += config.rangoMarcaEntrada;
							}

							//Rango salida
							if(minutosSalida - config.rangoMarcaSalida < 0){
								horaSalida -= 1;
								minutosSalida = 60 - (config.rangoMarcaSalida - minutosSalida);
							}else{
								minutosSalida -= config.rangoMarcaSalida;
							}
							/**
							 * FIN agregar rango de tiempo
							 */

							//console.log(tiempoDia);
							if((horaEntrada!=0 || minutosEntrada!=0)
								&& (
									horaSalida>horaEntrada ||
									(horaSalida==horaEntrada
										&& minutosSalida>minutosEntrada)
									)
								)
							{

								if(marca.tipoMarca=="Entrada"){
								var mIn = moment.unix(marca.epoch);

								if(tipoUsuario==="Profesor"){
									return cb("");
								}else{

									if(util.compararHoras(mIn.hour(), mIn.minutes(),horaEntrada,minutosEntrada)==1){
										if(tipoUsuario != config. empleadoProfesor){
											addJustIncompleta(_idUser, "Entrada tardía",
												"Hora de entrada: "+ util.horaStr(horarioOriginal.hora, horarioOriginal.minutos)+
												" - Hora de marca: "+ util.horaStr(mIn.hour(), mIn.minutes()),cb);

										}else{

											return cb("");
										}
								}else{
									return cb("");
								}

								}
								}else if(marca.tipoMarca=="Salida"){
									var mOut= moment.unix(marca.epoch);
									workedHourFix(_idUser,horaEntrada,minutosEntrada,horaSalida,minutosSalida, mOut,cb,usuario.departamentos.length,tipoUsuario);
								}
							}

							}
							else{
								return cb("");
							}


					}
				});

			}
			else if(marca.tipoMarca=="Salida") {
				Usuario.findById(_idUser).exec(
					function(err, usuario){
					if(!err && usuario.horario && usuario.horario!=""){
						Horario.findById(usuario.horario,function(error,horarioEmpleado){
							if(!error && horarioEmpleado!="" && horarioEmpleado && horarioEmpleado.tipo=="Libre"){
								if(tipoUsuario === "Profesor"){
									cb("");
								}else{
									var mOut= moment.unix(marca.epoch);
									workedHourSchedule(_idUser,horarioEmpleado,mOut,cb,usuario.tipo,usuario.tipo.length);
								}


							}
							else {
								cb("");
							}


						});

					}else{
						return cb("");
					}
				});

			}else{
				cb("");
			}//fin else
		});
	//
}

function workedHourSchedule(_idUser,horarioEmpleado,mOut,cb,tipoUsuario,cantidadUsuarios){

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
		var vectorHorario=horarioEmpleado.rangoJornada.split(":");
		var almuerzo=horarioEmpleado.tiempoAlmuerzo.split(":");
		var receso=horarioEmpleado.tiempoReceso.split(":");
		var minutoDescanso=parseInt(almuerzo[1])+parseInt(receso[1]);
		var horaDescanso=parseInt(almuerzo[0])+parseInt(receso[0]);
		if(minutoDescanso>59){
			horaDescanso++;
			minutoDescanso=minutoDescanso-60;
		}

		var horasTrabajadasFinal=parseInt(vectorHorario[0])-horaDescanso;
		var minutosTrabajadosFinal=parseInt(vectorHorario[1])-minutoDescanso;



		if(minutosTrabajadosFinal<0){
			minutosTrabajadosFinal=60-minutosTrabajadosFinal;
			horasTrabajadasFinal--;
		}

		if(minutosTrabajados>59){
			horasTrabajadas++;
			minutosTrabajados=minutosTrabajados-60;
		}


		if(horasTrabajadas>horasTrabajadasFinal){
			return cb("");
		}else if(horasTrabajadas==horasTrabajadasFinal && minutosTrabajados>=minutosTrabajadosFinal){
			return cb("");
		}else{
			if((cantidadUsuarios > 1 && tipoUsuario != config. empleadoProfesor) ||
				(cantidadUsuarios == 1)){
					addJustIncompleta(_idUser, "Jornada laborada menor que la establecida",
					"Horas trabajadas: "+ util.horaStr(horasTrabajadas,minutosTrabajados)+
					" - Horas establecidas: "+ util.horaStr(horasTrabajadasFinal,minutosTrabajadosFinal),cb);
			}

		}

	});


}

function workedHourFix(_idUser,horaEntradaP,minutosEntradaP,horaSalidaP,minutosSalidaP,mOut,cb,cantidadUsuario,tipoUsuario){

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



				var horaSalida= parseInt(horaSalidaP-config.periodoLibreTrabajo);
				var horaEntrada= parseInt(horaEntradaP);
				var minutoSalida=parseInt(minutosSalidaP);
				var minutoEntrada=parseInt(minutosEntradaP-config.rangoMarcaEntrada);



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


				if(obj.minutos>59){
					obj.horas++;
					obj.minutos=obj.minutos-60;
				}


				if(cantidadUsuario>1 && tipoUsuario==="Profesor"){
					cb("");
				}else{
					if(horaSalida>obj.horas){

						addJustIncompleta(_idUser, "Jornada laborada menor que la establecida",
						"Horas trabajadas: "+ util.horaStr(obj.horas,obj.minutos)+
						" - Horas establecidas: "+ util.horaStr(horaSalida, minutoSalida), function(){});

					}else if(obj.horas==horaSalida){

						if(minutoSalida>obj.minutos){
							addJustIncompleta(_idUser, "Jornada laborada menor que la establecida",
							"Horas trabajadas: "+ util.horaStr(obj.horas,obj.minutos)+
							" - Horas establecidas: "+ util.horaStr(horaSalida, minutoSalida), function(){});
						}

					}

				}

				if(horaSalidaP>mOut.hour()){

					addJustIncompleta(_idUser, "Salida antes de hora establecida",
					"Hora de salida: "+ util.horaStr(horaSalidaP,minutosSalidaP)+
					" - Hora de marca: "+ util.horaStr(mOut.hour(), mOut.minutes()), function(){});
				}else if(horaSalidaP==mOut.hour()&& minutosSalidaP>mOut.minutes()){
					addJustIncompleta(_idUser, "Salida antes de hora establecida",
					"Hora de salida: "+ util.horaStr(horaSalidaP,minutosSalidaP)+
					" - Hora de marca: "+ util.horaStr(mOut.hour(), mOut.minutes()), function(){});
				}
				cb("");

		});



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


				if(obj.minutos>59){
					obj.horas++;
					obj.minutos=obj.minutos-60;
				}


				if(horaSalida>obj.horas){
					addJustIncompleta(_idUser, "Jornada laborada menor que la establecida",
					"Horas trabajadas: "+ util.horaStr(obj.horas,obj.minutos)+
					" - Horas establecidas: "+ util.horaStr(horaSalida, minutoSalida), function(){});

				}else if(obj.horas==horaSalida &&minutoSalida>obj.minutos){

					addJustIncompleta(_idUser, "Jornada laborada menor que la establecida",
					"Horas trabajadas: "+ util.horaStr(obj.horas,obj.minutos)+
					" - Horas establecidas: "+ util.horaStr(horaSalida, minutoSalida), function(){});



				}

				if(mOut.hour()<mReal.hora){
					addJustIncompleta(_idUser, "Salida antes de hora establecida",
					"Hora de salida: "+ util.horaStr(mReal.hora, mReal.minutos)+
					" - Hora de marca: "+ util.horaStr(mOut.hour(), mOut.minutes()),function(){});
				}else if(mOut.hour()==mReal.hora &&mOut.minutes()< mReal.minutos){
					addJustIncompleta(_idUser, "Salida antes de hora establecida",
					"Hora de salida: "+ util.horaStr(mReal.hora, mReal.minutos)+
					" - Hora de marca: "+ util.horaStr(mOut.hour(), mOut.minutes()), function(){});
				}


				cb("");

		});


}

function addJustIncompleta(_idUser, motivo, informacion, cb){
	crudJustificaciones.addJust(
		{id:_idUser, detalle:"", informacion: informacion,
		estado:"Incompleto", motivoJust:"Otro",
		motivoOtroJust:motivo},
		function(err, just){
			if(!err) cb(motivo);
			else cb("");
		}
		);
}
