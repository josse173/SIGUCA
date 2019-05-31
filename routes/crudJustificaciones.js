
var mongoose 		= require('mongoose'),
moment 			= require('moment'),
Usuario 		= require('../models/Usuario'),
Correo		= require('../models/Correo'),
Justificaciones = require('../models/Justificaciones'),
util 			= require('../util/util'),
enviarCorreo = require('../config/enviarCorreo');
const log = require('node-file-logger');
var ObjectId = mongoose.Types.ObjectId;
//--------------------------------------------------------------------
//	Métodos Justificaciones
//	---------------------------------------------------------------------*/

exports.deleteJustificationExit = function(usuarioId,epoch1,epochMax){
	Justificaciones.remove({'usuario':usuarioId, fechaCreada: { "$gte": epoch1 , "$lte":epochMax}, motivo : {$in: ["Jornada laborada menor que la establecida", "Salida antes de hora establecida"]} },function(err,marcaE){});
};

exports.deleteJustificationEntrance = function(usuarioId,epochMin,epochMax){
	Justificaciones.remove({'usuario':usuarioId,tipoUsuario: globalTipoUsuario, fechaCreada: { "$gte": epochMin,"$lte":epochMax}, motivo: "Entrada tardía"}, function(err,marcaE){});
};

exports.conteoJustificaciones=function(usuario,cb){

	var arrayJustificaciones =new Array();
	var departamentos=new Array();
	var usuariosConDepartamento=new Array();
	var identificadores=new Array();

	for(var i=0;i<usuario.departamentos.length;i++){

		if(usuario.departamentos[i].tipo === "Supervisor"){
			var obj = {};
			obj.idDepartamento = usuario.departamentos[i].departamento;
			departamentos.push(obj);
		}
	}

	Usuario.findOne({_id:usuario.id}).exec(function(error, supervisor){
		var depIds = [];

		if(supervisor.departamentos && supervisor.departamentos.length > 0){
			supervisor.departamentos.forEach(function (departamento) {
				if(departamento.tipo === "Supervisor"){
					depIds.push(departamento.departamento);
				}
			})
		}

		Usuario.find({_id: { "$ne": ObjectId(usuario.id) }, departamentos : { $elemMatch: { departamento: {"$in":depIds}, tipo: {$in: ['Empleado', 'Usuario sin acceso web']}}}},function(error,empleado){
			if(empleado){
				for(var i=0;i<empleado.length;i++){
					if(empleado[i].departamentos.length > 0){//pregunta que si tiene mas de un departamento
						for(var j=0;j<empleado[i].departamentos.length;j++){//rrecore los departamentos
							for(var h=0; h < departamentos.length; h++){
								if(empleado[i].departamentos[j].departamento && empleado[i].departamentos[j].departamento.equals(departamentos[h].idDepartamento)){
									h=h.length;
									j=j.length;
									var usuarioTemporal = new Object();
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

	});

};


exports.conteoJustificacionesTotal=function(usuario,cb){
	var contador=0;
	var arrayJustificaciones =new Array();
	var departamentos=new Array();
	var usuariosConDepartamento=new Array();
	var identificadores=new Array();

	for(var i=0;i<usuario.departamentos.length;i++){
		if(usuario.departamentos[i].tipo === "Supervisor"){
			var obj=new Object();
			obj.idDepartamento=usuario.departamentos[i].departamento;
			departamentos.push(obj);
		}

	}

	Usuario.findOne({_id:usuario.id}).exec(function(error, supervisor){
		var depIds = [];

		if(supervisor.departamentos && supervisor.departamentos.length > 0){
			supervisor.departamentos.forEach(function (departamento) {
				if(departamento.tipo === "Supervisor"){
					depIds.push(departamento.departamento);
				}
			})
		}

		Usuario.find({_id:{ "$ne": ObjectId(usuario.id) }, departamentos : { $elemMatch: { departamento: {"$in":depIds}, tipo: {$in: ['Empleado', 'Usuario sin acceso web']}}}},function(error,empleado){
			if(empleado){
				for(var i=0;i<empleado.length;i++){
					if(empleado[i].departamentos.length>0){//pregunta que si tiene mas de un departamento
						for(var j=0;j<empleado[i].departamentos.length;j++){//rrecore los departamentos
							for(var h=0;h<departamentos.length;h++){
								if(empleado[i].departamentos[j].departamento &&	empleado[i].departamentos[j].departamento.equals(departamentos[h].idDepartamento)){
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
	});
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

	if(justificacion.motivoJust === 'Otro')
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
	if(justificacion.motivoJust == 'Otro'){
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
					Usuario.find({departamentos : { $elemMatch: { tipo: {$in: ['Supervisor']}}}, 'departamentos.departamento' : just.usuario.departamentos[0].departamento}, {'email' : 1}).exec(function (err, supervisor) {
						if (err){
							return cb(err);
						}
						else{
							Correo.find({},function(errorCritico,listaCorreos){
								if(!errorCritico &&listaCorreos.length>0){

									for (var i = 0; i < supervisor.length; i++) {
										var from =listaCorreos[0].nombreCorreo,
											to = supervisor[i].email,
											subject = 'Modificación de una justificación en SIGUCA',
											text = " El usuario " + just.usuario.nombre + " " + just.usuario.apellido1 + " " + just.usuario.apellido2
											+ " ha modificado la siguiente justificación: "
											+ "<br> Motivo: " + just.motivo
											+ "<br> Detalle: " + just.detalle
											+ "<br> A continuación se muestra la justificación modificada"
											+ "<br> Motivo: " + justActualizada.motivo
											+ "<br> Detalle: " + justificacion.detalle;
										log.Info(text);
										enviarCorreo.enviar(from, to, subject, '', text, '');
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

					var	from = listaCorreos[0].nombreCorreo,
						to = just.usuario.email,
						subject= 'Se ha eliminado una justificación en SIGUCA',
						text= " Estimado(a) " + just.usuario.nombre + " " + just.usuario.apellido1 + " " + just.usuario.apellido2
						+ "<br> Su supervisor ha eliminado una de las justificaciones presentadas, en la cuál se indicabá lo siguiente: "
						+ "<br> Fecha: " + fecha
						+ "<br> Motivo: " + just.motivo
						+ "<br> Detalle: " + just.detalle;
				log.Info(text);
				enviarCorreo.enviar(from, to, subject, '', text, '');
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
			if(!errorCritico &&listaCorreos.length>0){

					var from= listaCorreos[0].nombreCorreo,
						to= just.usuario.email,
						subject= 'Se ha eliminado una justificación en SIGUCA',
						text= " Estimado(a) " + just.usuario.nombre + " " + just.usuario.apellido1 + " " + just.usuario.apellido2
						+ "<br>Su supervisor ha eliminado una de las justificaciones presentadas, en la cuál se indicabá lo siguiente: "
						+ "<br> Fecha: " + fecha
						+ "<br> Motivo: " + just.motivo
						+ "<br> Detalle: " + just.detalle;
				log.Info(text);
				enviarCorreo.enviar(from, to, subject, '', text, '');
			}
		});


	});
}


exports.gestionarJust = function(justificacion, cb, idUser){

	Usuario.findById(idUser, function (errUser, supervisor) {
		Justificaciones.findByIdAndUpdate( justificacion.id,{estado: justificacion.estado,comentarioSupervisor: justificacion.comentarioSupervisor}).populate('usuario').exec(function (err, just) {
				if (err) return cb(err, '');
				Correo.find({},function(errorCritico,listaCorreos){
					if(!errorCritico &&listaCorreos.length>0){

						var a = new Date(just.fechaCreada * 1000);
						var date = ""+a.getDate()+"/"+util.getMes(a.getMonth())+"/"+a.getFullYear();

						var justtext = "<br>Fecha de creación: "+date+"\n"
						+ "<br>Motivo: "+just.motivo+"\n"
						+ "<br>Detalle: "+just.detalle+"<br><br>";

						var superV = "";
						if(!errUser && supervisor) {
							superV += supervisor.nombre;
							superV += " " + supervisor.apellido1;
							superV += " " + supervisor.apellido2;
						}
						var from =listaCorreos[0].nombreCorreo,
							to = just.usuario.email,
							subject =  'Respuesta a justificación en SIGUCA',
							titulo = " Estimado(a) " + just.usuario.nombre
							texto = "<br><br>Por este medio se le notifica que "
							+"la siguiente justificación ha sido respondida:<br>"
							+ justtext
							+ "Le informamos que la justificación se encuentra en estado " + justificacion.estado
							+ " por el supervisor " + superV
							+ ", con el siguiente comentario:"
							+ "<br><br> " + justificacion.comentarioSupervisor
							+ "<br><br>Saludos cordiales.";
						log.Info(texto);
						enviarCorreo.enviar(from, to, subject, titulo, texto, '');

					}
				});
			return cb(err, 'Justificacion actualizada');
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
					if(!errorCritico &&listaCorreos.length>0){

						var a = new Date(just.fechaCreada * 1000);
						var date = ""+a.getDate()+"/"+util.getMes(a.getMonth())+"/"+a.getFullYear();

						var justtext = "<br><br>Fecha de creación:"+date+"\n"
						+ "Motivo:"+just.motivo+"<br>"
						+ "Detalle:"+just.detalle+"<br><br>";
						var superV = "";
						if(!errUser && supervisor) {
							superV += supervisor.nombre;
							superV += " " + supervisor.apellido1;
							superV += " " + supervisor.apellido2;
						}
						var	from = listaCorreos[0].nombreCorreo,
							to = just.usuario.email,
							subject = 'Respuesta a justificación en SIGUCA',
							text = " Estimado(a) " + just.usuario.nombre
							+ ",<br><br>Por este medio se le notifica que "
							+"la siguiente justificación ha sido respondida:"
							+ justtext
							+ "Le informamos que la justificación fue " + justificacion.estado
							+ " por el supervisor " + superV
							+ ", con el siguiente comentario"
							+ "<br><br> " + justificacion.comentarioSupervisor
							+ "<br><br> Saludos cordiales.";
						log.Info(text);
						enviarCorreo.enviar(from, to, subject, '', text, '');
					}else{
						//console.log("problemas 2");
					}
				});
				//return cb(err, 'Se elimino');
			});
		//
	});
}
