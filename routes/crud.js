'use strict';

var mongoose 		= require('mongoose'),
nodemailer 		= require('nodemailer'),
moment 			= require('moment'),
Marca 			= require('../models/Marca'),
Departamento 	= require('../models/Departamento'),
Usuario 		= require('../models/Usuario'),
Horario 		= require('../models/Horario'),
HorarioFijo		= require('../models/HorarioFijo'),
Justificaciones = require('../models/Justificaciones'),
Solicitudes 	= require('../models/Solicitudes'),
Cierre 			= require('../models/Cierre'),
util 			= require('../util/util'),
emailSIGUCA 	= 'siguca@greencore.co.cr';



	/*--------------------------------------------------------------------
		Métodos Horarios
		---------------------------------------------------------------------*/
		exports.addHorarioFIjo=function(horario,cb){
			var horarioFijo=HorarioFijo(horario);
			horarioFijo.save(function(err,horario){
				return cb();
			});
		};

		exports.addHorario = function(horario, cb) {
			var horarioN = Horario(horario);
			horarioN.save(function (err, horario){
				return cb();
			});
		};

		exports.listHorario = function(cb){
			Horario.find().exec(function (err, horarios) {
				return cb(err, horarios);
			});
		}

		exports.loadHorario = function(id, cb){
			Horario.findById(id, function (err, horarios) {
				return cb(err, horarios);
			})
		}

		exports.loadHorarioFijo = function(id, cb){
			HorarioFijo.findById(id, function (err, horarios) {
				return cb(err, horarios);
			})
		}
		

		exports.updateHorario = function(data, cb){
			Horario.findByIdAndUpdate(data.id, data.horario, function (err, horarios) {
				return cb(err, horarios);
			});
		}

		exports.updateHorarioFijo = function(data, cb){

			if(data.horario.Lunes){
				var Lunes="Lunes";
			}
			else {
				var Lunes="";
			}
			if(data.horario.Martes){
				var Martes="Martes";
			}else{
				var Martes="";
			}

			if(data.horario.Miercoles){
				var Miercoles="Miercoles";
			}else{
				var Miercoles="";
			}
			if(data.horario.Jueves){
				var Jueves="Jueves";
			}else{
				var Jueves="";
			}
			
			if(data.horario.Viernes){
				var Viernes="Viernes";
			}else{
				var Viernes="";
			}
			if(data.horario.Sabado){
				var Sabado="Sabado";
			}else{
				var Sabado="";
			}
			if(data.horario.Domingo){
            var Domingo="Domingo";
			}else{
				 var Domingo="";
			}
			
			
			var horario={
				Domingo:Domingo,
				Jueves:Jueves,
				Lunes:Lunes,
				Martes:Martes,
				Miercoles:Miercoles,
				Sabado:Sabado,
				Viernes:Viernes,
				horaEntrada:data.horario.horaEntrada,
				horaSalida:data.horario.horaSalida,
				nombre:data.horario.nombre,
				tiempoAlmuerzo:data.horario.tiempoAlmuerzo,
				tiempoReceso:data.horario.tiempoReceso,
				tipo:"Fijo"
			};
			
			HorarioFijo.findByIdAndUpdate(data.id,horario, function (err, horarios) {
				return cb(err, horarios);
			});
		}



		exports.deleteHorario = function(id, cb){
			Usuario.find({"horario": id, "estado": "Activo"}).exec(function (err, usuario) {
				if(usuario.length === 0){
					Horario.findByIdAndRemove(id, function (err, horarios) {
						return cb(err, 'Se elimino');
					});
				} else{
					return cb(err, 'false');
				}
			});
		}

		exports.deleteHorarioFijo = function(id, cb){
			Usuario.find({"horarioFijo": id, "estado": "Activo"}).exec(function (err, usuario) {
				if(usuario.length === 0){
					HorarioFijo.findByIdAndRemove(id, function (err, horarios) {
						return cb(err, 'Se elimino');
					});
				} else{
					return cb(err, 'false');
				}
			});
		}

		

	function cierre (id) {
		Marca.findById(id).populate('usuario').exec(function (err, marca) {
			if(marca.tipoMarca == 'Entrada'){
				var newCierre =  new Cierre({
					usuario: marca.usuario.id, 
					epoch: marca.epoch, 
					departamento: marca.usuario.departamentos[0].departamento, 
					tipo: 'Personal',
					etapa: 0
				});
				newCierre.save();console.log(newCierre)
			} else {
				Cierre.findOne({usuario: marca.usuario.id, tipo: 'Personal', etapa: 0},function (err, cierre) {
					if(!err && cierre) {
						Horario.findById({_id: marca.usuario.horario}).exec(function (err, horario) {
							Justificaciones.find({usuario: marca.usuario.id, fechaCreada: {'$gte': cierre.epoch}}).count().exec(function (err, just) {
								Solicitudes.find({usuario: marca.usuario.id, fechaCreada: {'$gte': cierre.epoch}}).count().exec(function (err, soli) {
									Cierre.find({usuario: marca.usuario.id, tipo: 'Personal', etapa: 1}).sort({_id: -1}).limit(1).exec(function (err, cierreAnterior) {
										if (!err) {		                
											var rangoJornada = horario.rangoJornada,
											split = rangoJornada.split(':'),
											sJornada = (parseInt(split[0]) * 3600 + parseInt(split[1]) * 60)*1000,
											estado = 0,
											horasSemanales = 0,
											esLunes =  moment(cierre.epoch); 
											if(sJornada > marca.epoch - cierre.epoch){
												estado += 1;   
									}//if
									if(esLunes.day() != 1){
										horasSemanales += marca.epoch - cierre.epoch;
									}
									var cierrePersonal = {
										marcas : estado,
										solicitudes : soli,
										justificaciones : just,
										estado : estado + just + soli,
										etapa : 1,
										horasSemanales : horasSemanales,
										horasDiarias : marca.epoch - cierre.epoch,
									}
									console.log(cierrePersonal)
									Cierre.findByIdAndUpdate(cierre.id, cierrePersonal, function (err, cierre) {
										Cierre.findOne({departamento: marca.usuario.departamentos[0].departamento, tipo: 'General', etapa: 0},function (err, general) {
											console.log(general);
											if(!err && general){ console.log('Encontro cierre anterior')
												var cierreGeneral = {
													estado: general.estado + estado + general.justificaciones + just + general.solicitudes + soli,
													justificaciones: general.justificaciones + just,
													solicitudes: general.solicitudes + soli,
													marcas: general.marcas + estado,
												}; console.log(cierreGeneral)
												Cierre.findByIdAndUpdate(general.id, cierreGeneral, function (err, cierreGen) {	})
											} else if (!err && !general) {
												var newCierre = Cierre({
													estado: estado + just + soli,
													epoch: marca.epoch,
													departamento: marca.usuario.departamentos[0].departamento,
													justificaciones: just,
													solicitudes: soli,
													marcas: estado,
													tipo: 'General',
													etapa: 0
												});
												newCierre.save(function (err, user) {
													if (err) console.log(err);
													else console.log("éxito al guardar");
						                           			 });//cierre
											} 
										})
});
}
});
});
});
});
				} //else return cb();
			})
}
})
}

/*--------------------------------------------------------------------
	Métodos Pendiente
	---------------------------------------------------------------------*/
	/*exports.addPendiente = function(pendiente, cb){
		var newPendiente = Pendiente(pendiente);
		newPendiente.save(function (err, pendiente) {
			if (err) console.log(err);
			return cb(pendiente);
		})
	}*/