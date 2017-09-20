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


exports.updateVacacionesAutomatico = function(){
	//Se obtienen todas las vacaciones
	Vacaciones.find().populate('usuario').exec(function(err, listaVacacionesTem){

		//Se obtienen los usuarios que no tienen vacaciones asignadas
		var listaIdUsuarios = [];
		var listaVacaciones = [];
	    for(x in listaVacacionesTem){
			if(listaVacacionesTem[x].usuario.estado == "Activo"){
				listaVacaciones.push(listaVacacionesTem[x].id);
				listaIdUsuarios.push(listaVacacionesTem[x].usuario.id);
			}
		}
		Usuarios.find({_id: { $nin: listaIdUsuarios},estado: "Activo"},function(err, listaUsuarios){
			
			//Se les amenta en uno los días disponibles a todas las vacaciones
			Vacaciones.update({_id:{$in: listaVacaciones}}, {$inc:{disponibles:1}},{multi:true}, function(err){
				
				//Se insertan registros de vacaciones para los usuarios que no tienen vacaciones
				for(y in listaUsuarios){
					//Se crean las vacaciones a insertar
					var vacacionesTem = new Vacaciones({
						usuario: listaUsuarios[y].id,
						disponibles: 1
					});
					vacacionesTem.save();//Se insertan las vacaciones
				}

			});
		});
	});
}
