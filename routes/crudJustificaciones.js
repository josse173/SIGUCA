
var mongoose 		= require('mongoose'),
nodemailer 		= require('nodemailer'),
moment 			= require('moment'),
Usuario 		= require('../models/Usuario'),
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
				if (!err && just.estado!="Incompleto") {
					Usuario.find({'tipo' : 'Supervisor', 'departamentos.departamento' : just.usuario.departamentos[0].departamento}, {'email' : 1}).exec(function (err, supervisor) { 
						if (err) return cb(err);

						var transporter = nodemailer.createTransport('smtps://'+config.emailUser+':'+config.emailPass+'@'+config.emailEmail);

						for (var i = 0; i < supervisor.length; i++) {
							transporter.sendMail({
								from: emailSIGUCA,
								to: supervisor[i].email,
								subject: 'Modificación de una justificación en SIGUCA',
								text: " El usuario " + just.usuario.nombre + " " + just.usuario.apellido1 + " " + just.usuario.apellido2
								+ " ha modificado la siguiente justificación: "
								+ " \r\n Motivo: " + just.motivo
								+ " \r\n Detalle: " + just.detalle
								+ "\r\n\r\n A continuación se muestra la justificación modificada" 
								+ " \r\n Motivo: " + justActualizada.motivo
								+ " \r\n Detalle: " + justActualizada.detalle
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

		var transporter = nodemailer.createTransport('smtps://'+config.emailUser+':'+config.emailPass+'@'+config.emailEmail);

		transporter.sendMail({
			from: emailSIGUCA,
			to: just.usuario.email,
			subject: 'Se ha eliminado una justificación en SIGUCA',
			text: " Estimado(a) " + just.usuario.nombre + " " + just.usuario.apellido1 + " " + just.usuario.apellido2
			+ " \r\n Su supervisor ha eliminado una de las justificaciones presentadas, en la cuál se indicabá lo siguiente: " 
			+ " \r\n Fecha: " + fecha
			+ " \r\n Motivo: " + just.motivo
			+ " \r\n Detalle: " + just.detalle
		});

		return cb(err, 'Se elimino');
	});
}


exports.deleteJustMasa = function(id, cb){
	Justificaciones.findByIdAndRemove(id).populate('usuario').exec(function (err, just) { 
		var fecha = "";
		if(just.fechaCreada)
			fecha = moment(just.fechaCreada);

		var transporter = nodemailer.createTransport('smtps://'+config.emailUser+':'+config.emailPass+'@'+config.emailEmail);

		transporter.sendMail({
			from: emailSIGUCA,
			to: just.usuario.email,
			subject: 'Se ha eliminado una justificación en SIGUCA',
			text: " Estimado(a) " + just.usuario.nombre + " " + just.usuario.apellido1 + " " + just.usuario.apellido2
			+ " \r\n Su supervisor ha eliminado una de las justificaciones presentadas, en la cuál se indicabá lo siguiente: " 
			+ " \r\n Fecha: " + fecha
			+ " \r\n Motivo: " + just.motivo
			+ " \r\n Detalle: " + just.detalle
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
				var transporter = nodemailer.createTransport('smtps://'+config.emailUser+':'+config.emailPass+'@'+config.emailEmail);
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
					from: emailSIGUCA,
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
				var transporter = nodemailer.createTransport('smtps://'+config.emailUser+':'+config.emailPass+'@'+config.emailEmail);
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
					from: emailSIGUCA,
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
				//return cb(err, 'Se elimino');
			});
		//
	});
}