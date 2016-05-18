var mongoose 		= require('mongoose'),
nodemailer 		= require('nodemailer'),
moment 			= require('moment'),
Usuario 		= require('../models/Usuario'),
Marca 			= require('../models/Marca'),
util 			= require('../util/util');


//--------------------------------------------------------------------
//		Métodos Marcas
//---------------------------------------------------------------------
exports.addMarca = function(m, cb){
	marca(m, cb);
}

function saveMarca(m, cb){
	m.save(function (err, marca) {
		var msjOk = "Marca registrada correctamente.";
		var msjError = "No se pudo contactar con el sistema. \n"+
		"El error ocurrió al realizar marca y esta no se registró.";
		//
		err ? cb(msjError) : cb(msjOk);
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
					return saveMarca(newMarca,cb);
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
					return saveMarca(newMarca,cb);
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
		else return cb('fail');
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
		marca({usuario: usuario, tipoMarca: tipo}, function(msj){
					//	console.log(msj);
					return cb(msj);
				});
	});
}

function marcasCerradas(marcas){

}