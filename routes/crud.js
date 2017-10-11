'use strict';

var mongoose 		= require('mongoose'),
nodemailer 		= require('nodemailer'),
moment 			= require('moment'),
Marca 			= require('../models/Marca'),
Departamento 	= require('../models/Departamento'),
Usuario 		= require('../models/Usuario'),
Horario 		= require('../models/Horario'),
HorarioFijo		= require('../models/HorarioFijo'),
HorarioEmpleado	= require('../models/HorarioEmpleado'),
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

		exports.loadHorarioEmpleado = function(id, cb){
			HorarioEmpleado.findById(id, function (err, horarios) {
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

		exports.updateHorarioPersonalizado = function(data, cb){
			var hora,minutos;
			var personalizado={
				tiempoAlmuerzo:{
					hora:hora=parseInt(data.horario.tiempoAlmuerzo.split(":")[0]),
					minutos:parseInt(data.horario.tiempoAlmuerzo.split(":")[1])
				},
				tiempoReceso:{
					hora:parseInt(data.horario.tiempoReceso.split(":")[0]),
					minutos:parseInt(data.horario.tiempoReceso.split(":")[1])
				},
				domingo:{
					salida:{
						hora:parseInt(data.horario.domingoSalida.split(":")[0]),
						minutos:parseInt(data.horario.domingoSalida.split(":")[1])
					},
					entrada:{
						hora:parseInt(data.horario.domingoEntrada.split(":")[0]),
						minutos:parseInt(data.horario.domingoEntrada.split(":")[1])
					}
				},
				sabado:{
					salida:{
						hora:parseInt(data.horario.sabadoSalida.split(":")[0]),
						minutos: parseInt(data.horario.sabadoSalida.split(":")[1])
					},
					entrada:{
						hora:parseInt(data.horario.sabadoEntrada.split(":")[0]),
						minutos: parseInt(data.horario.sabadoEntrada.split(":")[1])
					}
				},
				viernes:{
					salida:{
						hora:parseInt(data.horario.viernesSalida.split(":")[0]),
						minutos:parseInt(data.horario.viernesSalida.split(":")[1])
					},
					entrada:{
						hora:parseInt(data.horario.viernesEntrada.split(":")[0]),
						minutos:parseInt(data.horario.viernesEntrada.split(":")[1])
					}	
				},
				jueves:{
					salida:{
						hora:parseInt(data.horario.juevesSalida.split(":")[0]),
						minutos: parseInt(data.horario.juevesSalida.split(":")[1])
					},
					entrada:{
						hora:parseInt(data.horario.juevesEntrada.split(":")[0]),
						minutos:parseInt(data.horario.juevesEntrada.split(":")[1])
					}
				},
				miercoles:{
					salida:{
						hora:parseInt(data.horario.miercolesSalida.split(":")[0]),
						minutos:parseInt(data.horario.miercolesSalida.split(":")[1])
					},
					entrada:{
						hora:parseInt(data.horario.miercolesEntrada.split(":")[0]),
						minutos:parseInt(data.horario.miercolesEntrada.split(":")[1])
					}
					
				},
				martes:{
					salida:{
						hora:parseInt(data.horario.martesSalida.split(":")[0]),
						minutos:parseInt(data.horario.martesSalida.split(":")[1])
					},
					entrada:{
						hora:parseInt(data.horario.martesEntrada.split(":")[0]),
						minutos:parseInt(data.horario.martesEntrada.split(":")[1])
					}
				},
				lunes:{
					salida:{
						hora:parseInt(data.horario.lunesSalida.split(":")[0]),
						minutos:parseInt(data.horario.lunesSalida.split(":")[1])
					},
					entrada:{
						hora:parseInt(data.horario.lunesEntrada.split(":")[0]),
						minutos:parseInt(data.horario.lunesEntrada.split(":")[1])
					}
				},
				nombreHorarioPersonalizado:data.horario.nombreHorarioPersonalizado
			};

			/*
			personalizado.tiempoAlmuerzo.hora=parseInt(data.horario.tiempoAlmuerzo.split(":")[0]);
			personalizado.tiempoAlmuerzo.minutos=parseInt(data.horario.tiempoAlmuerzo.split(":")[1]);

			personalizado.tiempoReceso.hora=parseInt(data.horario.tiempoReceso.split(":")[0]);
			personalizado.tiempoReceso.minutos=parseInt(data.horario.tiempoReceso.split(":")[1]);

			//domingo
			personalizado.domingo.salida.hora=parseInt(data.horario.domingoSalida.split(":")[0]);
			personalizado.domingo.salida.minutos=parseInt(data.horario.domingoSalida.split(":")[1]);

			personalizado.domingo.entrada.hora=parseInt(data.horario.domingoEntrada.split(":")[0]);
			personalizado.domingo.entrada.minutos=parseInt(data.horario.domingoEntrada.split(":")[1]);

			//sabado
			personalizado.sabado.salida.hora=parseInt(data.horario.sabadoSalida.split(":")[0]);
			personalizado.sabado.salida.minutos=parseInt(data.horario.sabadoSalida.split(":")[1]);

			personalizado.sabado.entrada.hora=parseInt(data.horario.sabadoEntrada.split(":")[0]);
			personalizado.sabado.entrada.minutos=parseInt(data.horario.sabadoEntrada.split(":")[1]);

			//viernes
			personalizado.viernes.salida.hora=parseInt(data.horario.viernesSalida.split(":")[0]);
			personalizado.viernes.salida.minutos=parseInt(data.horario.viernesSalida.split(":")[1]);

			personalizado.viernes.entrada.hora=parseInt(data.horario.viernesEntrada.split(":")[0]);
			personalizado.viernes.entrada.minutos=parseInt(data.horario.viernesEntrada.split(":")[1]);

			//jueves
			personalizado.jueves.salida.hora=parseInt(data.horario.juevesSalida.split(":")[0]);
			personalizado.jueves.salida.minutos=parseInt(data.horario.juevesSalida.split(":")[1]);

			personalizado.jueves.entrada.hora=parseInt(data.horario.juevesEntrada.split(":")[0]);
			personalizado.jueves.entrada.minutos=parseInt(data.horario.juevesEntrada.split(":")[1]);


			//miercoles
			personalizado.miercoles.salida.hora=parseInt(data.horario.miercolesSalida.split(":")[0]);
			personalizado.miercoles.salida.minutos=parseInt(data.horario.miercolesSalida.split(":")[1]);

			personalizado.miercoles.entrada.hora=parseInt(data.horario.miercolesEntrada.split(":")[0]);
			personalizado.miercoles.entrada.minutos=parseInt(data.horario.miercolesEntrada.split(":")[1]);

			//martes
			personalizado.martes.salida.hora=parseInt(data.horario.martesSalida.split(":")[0]);
			personalizado.martes.salida.minutos=parseInt(data.horario.martesSalida.split(":")[1]);

			personalizado.martes.entrada.hora=parseInt(data.horario.martesEntrada.split(":")[0]);
			personalizado.martes.entrada.minutos=parseInt(data.horario.martesEntrada.split(":")[1]);

			//lunes
			personalizado.lunes.salida.hora=parseInt(data.horario.lunesSalida.split(":")[0]);
			personalizado.lunes.salida.minutos=parseInt(data.horario.lunesSalida.split(":")[1]);

			personalizado.lunes.entrada.hora=parseInt(data.horario.lunesEntrada.split(":")[0]);
			personalizado.lunes.entrada.minutos=parseInt(data.horario.lunesEntrada.split(":")[1]);

			//nombre
			personalizado.nombreHorarioPersonalizado=data.horario.nombreHorarioPersonalizado;
			*/
			console.log(personalizado);

			HorarioEmpleado.findByIdAndUpdate(data.id,personalizado, function (err, horarios) {
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

		exports.deleteHorarioPersonalizado = function(id, cb){
			Usuario.find({"horarioEmpleado": id, "estado": "Activo"}).exec(function (err, usuario) {
				if(usuario.length === 0){
					HorarioEmpleado.findByIdAndRemove(id, function (err, horarios) {
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