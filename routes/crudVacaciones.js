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
		
		Usuarios.find({_id: { $nin: listaIdUsuarios}},function(err, listaUsuarios){
			var info = {
				listaUsuariosSinVacaciones: listaUsuarios,
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

/**
 * Realiza aumento de vacaciones si la fecha actual corresponde con 
 * fecha de ingreso del usuario.
 */
exports.updateVacacionesAutomatico = function(){
	var fechaActual = new Date();
	//Obtiene usuarios activos
	Usuarios.find({estado: "Activo"},function(err, listUserTem){
		//Valida que no tome en cuenta usuarios que solo sean profesores
		var listUser = [];
		for (var i = 0, len = listUserTem.length; i < len; i++) {
			var user = listUserTem[i];
			if(user.tipo.length != 1 || user.tipo != "Profesor" ){

				//Valida que el usuario tenga fecha de ingreso registrada, y que el día sea igual al actual
				if(user.fechaIngreso != 0){
					var fechaIngreso = new Date(user.fechaIngreso*1000);
					if(fechaIngreso.getDate() == fechaActual.getDate()){
						listUser.push(user.id);
					}
				}
			}
		}

		//Se actualizan los resgistros de vacaciones existentes
		Vacaciones.update({usuario:{$in: listUser}}, {$inc:{disponibles:1}},{multi:true}, function(err){

			//Se insertan registros de vacaciones
			Vacaciones.find({},{usuario:1}, function(err, listVac){
				for (var y = 0, lenUser = listUser.length; y < lenUser; y++) {
					var user = listUser[y];
					var vac = false;
					for (var x = 0, len = listVac.length; x < len; x++) {
						var elemento = listVac[x].usuario;

						if(user == elemento){
							vac = true;
						}
					}
					//Si el usuario aprobado no tiene vacaciones, las inserta
					if(!vac){
						var vacacionesTem = new Vacaciones({
							usuario: user,
							disponibles: 1
						});
						vacacionesTem.save();//Se insertan las vacaciones
					}
				}
			});
		});//Fin actualizacion usuarios con vacaciones
	});//Fin consulta obtiene usuarios
}
