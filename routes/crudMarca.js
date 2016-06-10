var mongoose 		= require('mongoose'),
nodemailer 			= require('nodemailer'),
moment 				= require('moment'),
Usuario 			= require('../models/Usuario'),
Marca 				= require('../models/Marca'),
util 				= require('../util/util'),
crudHorario 		= require('./crudHorario'),
crud 				= require('./crud'),
crudJustificaciones = require('../routes/crudJustificaciones');


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
					return revisarMarca(newMarca.usuario, newMarca,
						function(msg){
							saveMarca(newMarca,cb,msg);
						});
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

exports.deleteMarca = function(id, cb){
	Marca.findById(id, function (err, marca) {
		var epoch = moment().unix();
		if(!marca){
			return cb('La marca había sido eliminada anteriormente');
		} 
		else if(marca && epoch - marca.epoch <= 600){
			Marca.findByIdAndRemove(id, function (err, marca) {
				if (err) cb(err);
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
	epochMin.seconds(0);

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
									if(util.compararHoras(mOut.hour(), mOut.minutes(), mReal.hora, mReal.minutos)==-1){
										addJustIncompleta(_idUser, "Salida antes de hora establecida", 
											"Hora de salida: "+ util.horaStr(mReal.hora, mReal.minutos)+
											" - Hora de marca: "+ util.horaStr(mOut.hour(), mOut.minutes()), cb);
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
			else cb("");
		});
	//
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