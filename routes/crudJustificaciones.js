
var mongoose 		= require('mongoose'),
nodemailer 		= require('nodemailer'),
moment 			= require('moment'),
Usuario 		= require('../models/Usuario'),
Correo		= require('../models/Correo'),
Justificaciones = require('../models/Justificaciones'),
util 			= require('../util/util'),
config 			= require('../config.json'),
emailSIGUCA 	= 'siguca@greencore.co.cr';

//--------------------------------------------------------------------
//	Métodos Justificaciones          
//	---------------------------------------------------------------------*/

exports.deleteJustificationExit = function(usuarioId,epoch1,epochMax){
	Justificaciones.remove({'usuario':usuarioId,fechaCreada: { "$gte": epoch1 ,"$lte":epochMax}},function(err,marcaE){
					
	});
}

exports.deleteJustificationEntrance = function(usuarioId,epochMin,epochMax){
	Justificaciones.remove({'usuario':usuarioId,tipoUsuario: globalTipoUsuario, fechaCreada: { "$gte": epochMin,"$lte":epochMax}},function(err,marcaE){});

}
exports.conteoJustificaciones=function(usuario,cb){

	var arrayJustificaciones =new Array();
	var departamentos=new Array();
	var usuariosConDepartamento=new Array();
	var identificadores=new Array();

	for(var i=0;i<usuario.departamentos.length;i++){
		var obj=new Object();
		obj.idDepartamento=usuario.departamentos[i].departamento;
		departamentos.push(obj);
		
	}
	Usuario.find({tipo: { $ne: "Administrador"}},function(error,empleado){
		if(empleado){
			for(var i=0;i<empleado.length;i++){
				if(empleado[i].departamentos.length>0){//pregunta que si tiene mas de un departamento
					for(var j=0;j<empleado[i].departamentos.length;j++){//rrecore los departamentos
						for(var h=0;h<departamentos.length;h++){
							if(empleado[i].departamentos[j].departamento&&
								empleado[i].departamentos[j].departamento.equals(departamentos[h].idDepartamento)){
								h=h.length;
								j=j.length;
								var usuarioTemporal=new Object();
								usuarioTemporal.empleado=empleado[i];					
								usuariosConDepartamento.push(usuarioTemporal);		
								identificadores.push(usuarioTemporal.empleado._id)
							}
						}
					}
				}
			}

		}//fin del if que pregunta si existe el empleado.
		Justificaciones.find({usuario:{$in:identificadores},estado:"Incompleto"},function(error,cantidad){
			if(cantidad){
				for(var i=0;i<usuariosConDepartamento.length;i++){
					var contador=0;
					for (var j=0;j<cantidad.length;j++) {
						if(usuariosConDepartamento[i].empleado.equals(cantidad[j].usuario)){
							contador++;
						}
						
					}
					usuariosConDepartamento[i].empleado.contadorJustificaciones=contador;
				}
				
				cb(usuariosConDepartamento);
				
			}else{
				cb();
			}
			
		
		});
		
	
	});//fin de la consulta

	
	
	
};


exports.conteoJustificacionesTotal=function(usuario,cb){
	var contador=0;
	var arrayJustificaciones =new Array();
	var departamentos=new Array();
	var usuariosConDepartamento=new Array();
	var identificadores=new Array();

	for(var i=0;i<usuario.departamentos.length;i++){
		var obj=new Object();
		obj.idDepartamento=usuario.departamentos[i].departamento;
		departamentos.push(obj);
		
	}
	Usuario.find({tipo: { $ne: "Administrador"}},function(error,empleado){
		if(empleado){
			for(var i=0;i<empleado.length;i++){
				if(empleado[i].departamentos.length>0){//pregunta que si tiene mas de un departamento
					for(var j=0;j<empleado[i].departamentos.length;j++){//rrecore los departamentos
						for(var h=0;h<departamentos.length;h++){
							if(empleado[i].departamentos[j].departamento&&
								empleado[i].departamentos[j].departamento.equals(departamentos[h].idDepartamento)){
								h=h.length;
								j=j.length;
								var usuarioTemporal=new Object();
								usuarioTemporal.empleado=empleado[i];					
								usuariosConDepartamento.push(usuarioTemporal);		
								identificadores.push(usuarioTemporal.empleado._id)
							}
						}
					}
				}
			}

		}//fin del if que pregunta si existe el empleado.
		Justificaciones.find({usuario:{$in:identificadores},estado:"Incompleto"},function(error,cantidad){
			if(cantidad){
				for(var i=0;i<usuariosConDepartamento.length;i++){
					for (var j=0;j<cantidad.length;j++) {
						if(usuariosConDepartamento[i].empleado.equals(cantidad[j].usuario)){
							contador++;
						}
						
					}
				}
				
				cb(contador++);
				
			}else{
				cb(contador);
			}
			
		
		});
		
	
	});//fin de la consulta

	
	};

exports.addJust = function(justificacion, cb){
	var epochTime = moment().unix();

	var newjustificacion = Justificaciones({
		usuario: justificacion.id,
		fechaCreada: epochTime,
		detalle: justificacion.detalle,
		informacion: justificacion.informacion,
		comentarioSupervisor: "",
		tipoUsuario: globalTipoUsuario
	});
	
	if(justificacion.motivoJust == 'otro')
		newjustificacion.motivo = justificacion.motivoOtroJust;
	else
		newjustificacion.motivo = justificacion.motivoJust;
	if(justificacion.estado)
		newjustificacion.estado = justificacion.estado;
	Justificaciones.find(
	{
		usuario: newjustificacion.usuario, 
		fechaCreada: newjustificacion.fechaCreada,
		motivo:newjustificacion.motivo
	}, 
	function (err, just){
		if(just.length == 0){
			newjustificacion.save(function (err, user) {
				if (err) console.log(err);
				return cb(err, just);	
			});//save
		}
	});//verificar
};

exports.loadJust = function(id, cb){
	Justificaciones.findById(id, function (err, just) { 
		if(just.estado == 'Pendiente'){
			Justificaciones.findById(id, function (err, justificacion) { 
				if (err) return cb(err);
				cb(justificacion);
			}); 
		} else if(just.estado == 'Incompleto'){
			Justificaciones.findById(id, function (err, justificacion) { 
				if (err) return cb(err);
				cb(justificacion);
			}); 
		}else cb({motivo:'seleccionar',detalle:''});
	}); 
}

exports.updateJust = function(justificacion, cb){
	var epochTime = moment().unix();

	var motivo = '';
	if(justificacion.motivoJust == 'otro'){
		motivo = justificacion.motivoOtroJust;
	} else{
		motivo = justificacion.motivoJust;
	} 

	var justificacionActualizada = {
		motivo: motivo,
		detalle: justificacion.detalle,
		estado: "Pendiente"
	};


	Usuario.findById(justificacion.usuario, function(err, user){
		Justificaciones.findById(justificacion.id).populate('usuario').exec(function (err, just) { 
			if(JSON.stringify(user._id)===JSON.stringify(just.usuario._id)){
				justificacionActualizada.fechaJustificada = epochTime;
			}
			Justificaciones.findByIdAndUpdate(justificacion.id, justificacionActualizada, function (err, justActualizada) {

				if (!err && just.estado=="Incompleto") {
					Usuario.find({'tipo' : 'Supervisor', 'departamentos.departamento' : just.usuario.departamentos[0].departamento}, {'email' : 1}).exec(function (err, supervisor) { 
						if (err){
							return cb(err);
						} 
						else{
							Correo.find({},function(errorCritico,listaCorreos){
								if(!errorCritico &&listaCorreos>0){
									var transporter = nodemailer.createTransport('smtps://'+listaCorreos[0].nombreCorreo+':'+listaCorreos[0].password+'@'+listaCorreos[0].dominioCorreo);
									for (var i = 0; i < supervisor.length; i++) {
										transporter.sendMail({
											from:listaCorreos[0].nombreCorreo,
											to: supervisor[i].email,
											subject: 'Modificación de una justificación en SIGUCA',
											text: " El usuario " + just.usuario.nombre + " " + just.usuario.apellido1 + " " + just.usuario.apellido2
											+ " ha modificado la siguiente justificación: "
											+ " \r\n Motivo: " + just.motivo
											+ " \r\n Detalle: " + just.detalle
											+ "\r\n\r\n A continuación se muestra la justificación modificada" 
											+ " \r\n Motivo: " + justActualizada.motivo
											+ " \r\n Detalle: " + justificacion.detalle
										});
									}
								}
							});
						}
						

					});
				}
			
				return cb(err);
			});
			//
		});
		//
	});
}

exports.deleteJust = function(id, cb){
	Justificaciones.findByIdAndRemove(id).populate('usuario').exec(function (err, just) { 
		if (err) return cb(err,'');
		var fecha = "";
		if(just.fechaCreada)
			fecha = moment(just.fechaCreada);
		Correo.find({},function(errorCritico,listaCorreos){
			if(!errorCritico &&listaCorreos.length>0){
				var transporter = nodemailer.createTransport('smtps://'+listaCorreos[0].nombreCorreo+':'+listaCorreos[0].password+'@'+listaCorreos[0].dominioCorreo);
					transporter.sendMail({
						from: listaCorreos[0].nombreCorreo,
						to: just.usuario.email,
						subject: 'Se ha eliminado una justificación en SIGUCA',
						text: " Estimado(a) " + just.usuario.nombre + " " + just.usuario.apellido1 + " " + just.usuario.apellido2
						+ " \r\n Su supervisor ha eliminado una de las justificaciones presentadas, en la cuál se indicabá lo siguiente: " 
						+ " \r\n Fecha: " + fecha
						+ " \r\n Motivo: " + just.motivo
						+ " \r\n Detalle: " + just.detalle
					});
			}else{
				console.log("error al enviar correo de eliminado de justificación");
			}
		});

		
		return cb(err, 'Se elimino');
	});
}


exports.deleteJustMasa = function(id, cb){
	Justificaciones.findByIdAndRemove(id).populate('usuario').exec(function (err, just) { 
		var fecha = "";
		if(just.fechaCreada)
			fecha = moment(just.fechaCreada);
		Correo.find({},function(errorCritico,listaCorreos){
			if(!errorCritico &&listaCorreos>0){
				var transporter = nodemailer.createTransport('smtps://'+listaCorreos[0].nombreCorreo+':'+listaCorreos[0].password+'@'+listaCorreos[0].dominioCorreo);
					transporter.sendMail({
						from: listaCorreos[0].nombreCorreo,
						to: just.usuario.email,
						subject: 'Se ha eliminado una justificación en SIGUCA',
						text: " Estimado(a) " + just.usuario.nombre + " " + just.usuario.apellido1 + " " + just.usuario.apellido2
						+ " \r\n Su supervisor ha eliminado una de las justificaciones presentadas, en la cuál se indicabá lo siguiente: " 
						+ " \r\n Fecha: " + fecha
						+ " \r\n Motivo: " + just.motivo
						+ " \r\n Detalle: " + just.detalle
					});
			}
		});
		

	});
}


exports.gestionarJust = function(justificacion, cb, idUser){
	
	Usuario.findById(idUser, function (errUser, supervisor) { 
		Justificaciones.findByIdAndUpdate(
			justificacion.id, 
			{
				estado: justificacion.estado, 
				comentarioSupervisor: justificacion.comentarioSupervisor
			}
			).populate('usuario').exec(function (err, just) { 
				if (err) return cb(err, '');
				Correo.find({},function(errorCritico,listaCorreos){
					if(!errorCritico &&listaCorreos>0){
						var transporter = nodemailer.createTransport('smtps://'+listaCorreos[0].nombreCorreo+':'+listaCorreos[0].password+'@'+listaCorreos[0].dominioCorreo);
						var a = new Date(just.fechaCreada * 1000);
						var date = ""+a.getDate()+"/"+util.getMes(a.getMonth())+"/"+a.getFullYear();
		
						var justtext = "\r\n\r\nFecha de creación:"+date+"\n"
						+ "Motivo:"+just.motivo+"\n"
						+ "Detalle:"+just.detalle+"\r\n\r\n";
						var superV = "";
						if(!errUser && supervisor) {
							superV += supervisor.nombre;
							superV += " " + supervisor.apellido1;
							superV += " " + supervisor.apellido2;
						}
						transporter.sendMail({
							from:listaCorreos[0].nombreCorreo,
							to: just.usuario.email,
							subject: 'Respuesta a justificación en SIGUCA',
							text: " Estimado(a) " + just.usuario.nombre 
							+ ",\r\n\r\nPor este medio se le notifica que "
							+"la siguiente justificación ha sido respondida:"
							+ justtext
							+ "Le informamos que la justificación fue " + justificacion.estado 
							+ " por el supervisor " + superV
							+ ", con el siguiente comentario"
							+ "\r\n\r\n " + justificacion.comentarioSupervisor
							+ "\r\n\r\n Saludos cordiales."
						});
						return cb(err, 'Se elimino');
					}
				});
				
			});
		//
	});
}

exports.gestionarJustifcacion = function(justificacion, cb, idUser){

	Usuario.findById(idUser, function (errUser, supervisor) { 
		Justificaciones.findByIdAndUpdate(
			justificacion.id, 
			{
				estado: justificacion.estado, 
				comentarioSupervisor: justificacion.comentarioSupervisor
			}
			).populate('usuario').exec(function (err, just) { 
				if (err) return cb(err, '');
				Correo.find({},function(errorCritico,listaCorreos){
					if(!errorCritico &&listaCorreos>0){
						var transporter = nodemailer.createTransport('smtps://'+listaCorreos[0].nombreCorreo+':'+listaCorreos[0].password+'@'+listaCorreos[0].dominioCorreo);
						var a = new Date(just.fechaCreada * 1000);
						var date = ""+a.getDate()+"/"+util.getMes(a.getMonth())+"/"+a.getFullYear();
		
						var justtext = "\r\n\r\nFecha de creación:"+date+"\n"
						+ "Motivo:"+just.motivo+"\n"
						+ "Detalle:"+just.detalle+"\r\n\r\n";
						var superV = "";
						if(!errUser && supervisor) {
							superV += supervisor.nombre;
							superV += " " + supervisor.apellido1;
							superV += " " + supervisor.apellido2;
						}
						transporter.sendMail({
							from: listaCorreos[0].nombreCorreo,
							to: just.usuario.email,
							subject: 'Respuesta a justificación en SIGUCA',
							text: " Estimado(a) " + just.usuario.nombre 
							+ ",\r\n\r\nPor este medio se le notifica que "
							+"la siguiente justificación ha sido respondida:"
							+ justtext
							+ "Le informamos que la justificación fue " + justificacion.estado 
							+ " por el supervisor " + superV
							+ ", con el siguiente comentario"
							+ "\r\n\r\n " + justificacion.comentarioSupervisor
							+ "\r\n\r\n Saludos cordiales."
						});
					}
				});
				//return cb(err, 'Se elimino');
			});
		//
	});
}