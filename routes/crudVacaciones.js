var mongoose 		= require('mongoose'),
Vacaciones 		= require('../models/Vacaciones');

//--------------------------------------------------------------------
//	Métodos Vacaciones
//---------------------------------------------------------------------

exports.listVacaciones = function(cb){
	Vacaciones.find().populate('usuario').exec(function(err, listaVacaciones){

		return cb(err,{listaVacaciones:listaVacaciones});
	});
}

exports.updateVacaciones = function(req, cb){
	Vacaciones.findByIdAndUpdate(req.body.id,{disponibles:req.body.disponibles}).populate('usuario').exec(function (err, soli2) {
		return cb(err);
	});
}
