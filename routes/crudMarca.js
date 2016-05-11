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

function saveMarca(m, cb){
	m.save(function (err, marca) {
		var msj = '';
		err ? msj = 'fail' : msj = 'Ok';
		return cb(msj);
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
			if(newMarca.tipoMarca=="Entrada" 
				&& !marcas.entrada && !marcas.salida
				&& !marcas.almuerzoIn && !marcas.almuerzoOut
				&& marcas.recesos.length==0){
					//
				return saveMarca(newMarca,cb);
			}
			else if(newMarca.tipoMarca=="Salida" 
				&& marcas.entrada && !marcas.salida
				&& (
					(marcas.almuerzoIn && marcas.almuerzoOut) ||
					(!marcas.almuerzoIn && !marcas.almuerzoOut)
					)
				&& (
					marcas.recesos.length==0 ||
					marcas.recesos[marcas.recesos.length-1].recesoIn
					)
				){
					//
				return saveMarca(newMarca,cb);
			}
			else if(newMarca.tipoMarca=="Salida a Receso" 
				&& marcas.entrada && !marcas.salida
				&& (
					(marcas.almuerzoIn && marcas.almuerzoOut) ||
					(!marcas.almuerzoIn && !marcas.almuerzoOut)
					)
				&& (
					marcas.recesos.length==0 ||
					marcas.recesos[marcas.recesos.length-1].recesoIn
					)
				){
					//
				return saveMarca(newMarca,cb);
			}
			else if(newMarca.tipoMarca=="Entrada de Receso" 
				&& marcas.entrada && !marcas.salida
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
			else if(newMarca.tipoMarca=="Salida al Almuerzo" 
				&& marcas.entrada && !marcas.salida
				&& !marcas.almuerzoOut && !marcas.almuerzoIn
				&& (
					marcas.recesos.length==0 ||
					marcas.recesos[marcas.recesos.length-1].recesoIn
					)
				){
					//
				return saveMarca(newMarca,cb);
			}
			else if(newMarca.tipoMarca=="Entrada de Almuerzo" 
				&& marcas.entrada && !marcas.salida
				&& marcas.almuerzoOut && !marcas.almuerzoIn
				&& (
					marcas.recesos.length==0 ||
					marcas.recesos[marcas.recesos.length-1].recesoIn
					)
				){
					//
				return saveMarca(newMarca,cb);
			}
			else return cb('fail');
		});
		//
	}
}

exports.deleteMarca = function(id, cb){
	Marca.findById(id, function (err, marca) {
		var epoch = moment().unix();
		if(epoch - marca.epoch <= 600){
			Marca.findByIdAndRemove(id, function (err, marca) {
				if (err) cb(err);
				return cb(err, 'Se elimino');
			});
		} else {
			return cb('No se eliminó la marca <strong>' + marca.tipoMarca + '</strong>');
		}
	});
}