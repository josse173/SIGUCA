var mongoose 		= require('mongoose'),
Vacaciones 		= require('../models/Vacaciones'),
Usuarios 		= require('../models/Usuario');

//--------------------------------------------------------------------
//	Métodos Vacaciones
//---------------------------------------------------------------------

exports.listVacaciones = function(cb){
	Vacaciones.find().populate('usuario').exec(function(err, listaVacaciones){

		var listaIdUsuarios = [];
	    for(x in listaVacaciones){
 	       listaIdUsuarios.push(listaVacaciones[x].usuario.id);
		}
		Usuarios.find({id: { $nin: listaIdUsuarios}},function(err, listVacaciones){
			var info = {
				listaUsuariosSinVacaciones: listVacaciones,
				listaVacaciones:listaVacaciones
			};
			return cb(err,info);
		});
	});
}

exports.updateVacaciones = function(req, cb){
	Vacaciones.findByIdAndUpdate(req.body.id,{disponibles:req.body.disponibles}).populate('usuario').exec(function (err, soli2) {
		return cb(err);
	});
}

exports.insertVacaciones = function(req, cb){
	elemento = new Vacaciones({
		usuario: req.body.idUsuario, 
		disponibles: req.body.disponibles
	});
	elemento.save(function(err){
		return cb();
	});
}
