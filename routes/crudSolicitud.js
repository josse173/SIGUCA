
var mongoose 		= require('mongoose'),
nodemailer 		= require('nodemailer'),
moment 			= require('moment'),
Solicitudes 	= require('../models/Solicitudes'),
Articulo51 	= require('../models/Articulo51'),
Usuario 		= require('../models/Usuario'),
Correo		= require('../models/Correo'),
CorreoRH		= require('../models/CorreoRH'),
util 			= require('../util/util'),
config          = require('../config.json'),
emailSIGUCA 	= 'siguca@greencore.co.cr',
HoraExtra		= require('../models/HoraExtra');
PeriodoUsuario  = require('../models/PeriodoUsuario');
var enviarCorreo = require('../config/enviarCorreo');

exports.get = function(query, cb){
	Solicitudes.find(query, function(error, solicitudes){
		cb(error, solicitudes);
	});
};
//--------------------------------------------------------------------
//		Métodos Solicitudes Extras
//---------------------------------------------------------------------
exports.addExtra = function(extra, cb){

	var epochTime = moment().unix(),
	epochInicio = moment(extra.epochInicio,"DD/MM/YYYY HH:mm").unix(),
	epochTermino = moment(extra.epochTermino,"DD/MM/YYYY HH:mm").unix(),
	cantHoras = (epochTermino - epochInicio);

	if(cantHoras/3600>24 || cantHoras/3600<0)
		return cb("Cantidad de horas inválidas");

	var horaExtra = HoraExtra({
		usuario: extra.id,
		fechaCreada: epochTime,
		fechaInicial: epochInicio,
		fechaFinal: epochTermino,
		tiempoSolicitado: cantHoras,
		tiempoSolicitadoTexto: convertirNumeroAHoras(cantHoras),
		ubicacion: extra.cliente,
		motivo: extra.motivo
	});

	horaExtra.save(function (err, horaExtraCreada) {
		if (err){
			console.log(err);
		}
		else {
			Usuario.findOne({_id: horaExtraCreada.usuario}).populate('departamentos').exec(function (err, usuarioExtra) {
				Usuario.find({ 'tipo': 'Supervisor', 'departamentos.departamento': usuarioExtra.departamentos[0].departamento}, {'email': 1}).exec(function (err, supervisor) {
					if (err) return cb(err);
					Correo.find({}, function (errorCritico, listaCorreos) {
						if (!errorCritico && listaCorreos.length > 0) {

							for (var i = 0; i < supervisor.length; i++) {

									var from = listaCorreos[0].nombreCorreo;
									var to = supervisor[i].email;
									var subject = 'Creación de una solicitud de hora extra en SIGUCA';
									var titulo = 'Estimado supervisor';
									var text = " El usuario " + usuarioExtra.nombre + " " + usuarioExtra.apellido1 + " " + usuarioExtra.apellido2
										+ " ha creado la siguiente solicitud de hora extra: "
										+ "\r\n Día de Inicio: " + moment.unix(epochInicio).format("YYYY-MM-DD hh:mm:ss") + '<br>'
										+ "\r\n Día de termino: " + moment.unix(epochTermino).format("YYYY-MM-DD hh:mm:ss")+ '<br>'
										+ "\r\n Ubicación: " + extra.cliente + '<br>'
										+ "\r\n Detalle: " + extra.motivo + '<br>';

								enviarCorreo.enviar(from, to, subject, titulo, text, '');
							}
						}
					});

				});
			});
			return cb("Guardado correctamente.");
		}
	});
};

function convertirNumeroAHoras(num)
{
	var horasCompletas = Math.floor(num / 3600);
	var horas = num / 3600;
	var minutos = Math.floor((horas - horasCompletas) * 100);
	var minutosCompletos = Math.floor((60 * minutos) / 100);
	var h = horasCompletas < 10 ? '0' + horasCompletas : horasCompletas;
	var m = minutosCompletos < 10 ? '0' + minutosCompletos : minutosCompletos;
	return h + ":" + m;
}

exports.updateExtra = function(extra, cb, idUser){
	epochInicio = moment(extra.epochInicio,"DD/MM/YYYY HH:mm").unix(),
	epochTermino = moment(extra.epochTermino,"DD/MM/YYYY HH:mm").unix(),
	cantHoras = epochTermino - epochInicio;

	var extraAActualizar = {
		fechaInicial: epochInicio,
		fechaFinal: epochTermino,
		tiempoSolicitado: cantHoras,
		tiempoSolicitadoTexto: convertirNumeroAHoras(cantHoras),
		ubicacion: extra.cliente,
		motivo: extra.motivo
	};

	HoraExtra.findByIdAndUpdate(extra.id, extraAActualizar).populate('usuario').exec(function (err, extraActualizada) {
		if (!err) {
			Usuario.findOne({_id: extraActualizada.usuario}).exec(function (err, usuarioExtra) {
				Usuario.find({ 'tipo': 'Supervisor', 'departamentos.departamento': extraActualizada.usuario.departamentos[0].departamento}, {'email': 1}).exec(function (err, supervisor) {
					if (err) return cb(err);
					Correo.find({}, function (errorCritico, listaCorreos) {
						if (!errorCritico && listaCorreos.length > 0) {

							for (var i = 0; i < supervisor.length; i++) {
								var from = listaCorreos[0].nombreCorreo,
									to = supervisor[i].email,
									subject = 'Modificación de una solicitud de hora extraordiaria en SIGUCA',
									text = " El usuario " + usuarioExtra.nombre + " " + usuarioExtra.apellido1 + " " + usuarioExtra.apellido2
										+ " ha modificado la siguiente solicitud de hora extra: "
										+ "<br> Día de Inicio: " + moment.unix(epochInicio).format("YYYY-MM-DD hh:mm:ss")
										+ "<br> Día de termino: " + moment.unix(epochTermino).format("YYYY-MM-DD hh:mm:ss")
										+ "<br> Motivo: " + extra.motivo
										+ "<br> Detalle: " + extra.detalle
										+ "<br><br> A continuación se muestran los cambios de la solicitud de hora extra modificada:"
										+ "<br> Día de Inicio: " + moment.unix(extraActualizada.fechaInicial).format("YYYY-MM-DD hh:mm:ss")
										+ "<br> Día de termino: " + moment.unix(extraActualizada.fechaFinal).format("YYYY-MM-DD hh:mm:ss")
										+ "<br> Motivo: " + extraActualizada.motivo
										+ "<br> Detalle: " + extraActualizada.detalle;

								enviarCorreo.enviar(from, to, subject, '', text, '');
							}
						}
					});

				});
			});
		}
		return cb(err);
	});
};

//--------------------------------------------------------------------
//Métodos Solicitudes de Permisos
//--------------------------------------------------------------------
exports.addPermiso = function(permiso, cb, idUser){

	var epochTime = moment().unix();
	var epochInicio = moment(permiso.diaInicio).unix();
	var epochFinal = moment(permiso.diaFinal).unix();

	var newSolicitud = Solicitudes({
		fechaCreada: epochTime,
		tipoSolicitudes: "Permisos",
		diaInicio: permiso.diaInicio,
		diaFinal: permiso.diaFinal,
		cantidadDias: permiso.cantidadDias,
		detalle: permiso.detalle,
		usuario: permiso.usuario.id,
		comentarioSupervisor: "",
		inciso: permiso.inciso,
        motivoArticulo51: permiso.motivoArticulo51,
		motivo: permiso.motivo,
		motivoOtro: permiso.motivoOtro,
		epochInicio: epochInicio,
		epochTermino: epochFinal
	});

    if(permiso.motivo === 'Permiso sin goce de salario' && permiso.permisosSinSalarioTipo){
		newSolicitud.inciso = permiso.permisosSinSalarioTipo;
	}

    Solicitudes.find({
        usuario: newSolicitud.usuario,
        fechaCreada: newSolicitud.fechaCreada
    }).populate('usuario').exec(function (err, solicitud) {
        if (solicitud.length == 0) {

            newSolicitud.save(function (err, soli) {
                Usuario.find({
                    'tipo': 'Supervisor',
                    'departamentos.departamento': permiso.departamento
                }, {'email': 1}).exec(function (err, supervisor) {
                    if (err) console.log(err);
                    Correo.find({}, function (errorCritico, listaCorreos) {
                        if (!errorCritico && listaCorreos.length > 0) {

                            for (var i = 0; i < supervisor.length; i++) {

                                    var from = listaCorreos[0].nombreCorreo,
                                    to = supervisor[i].email,
                                    subject = 'Nueva solicitud de permiso anticipado en SIGUCA',
                                    text = " El usuario " + permiso.usuario.nombre + " " + permiso.usuario.apellido1 + " " + permiso.usuario.apellido2 + " ha enviado el siguiente permiso anticipado: <br>"
                                        + "<br> Día de Inicio: " + soli.diaInicio
                                        + "<br>  Día de termino: " + soli.diaFinal
										+ "<br>  Cantidad de días: " + soli.cantidadDias
                                        + "<br>  Motivo: " + soli.motivo
                                        + "<br>  Detalle: " + soli.detalle
								enviarCorreo.enviar(from, to, subject, '', text, '');
                            }
                        }
                    });
                    //return cb();
                });//supervisores
            });//save
        }
	});//verificar
	return cb();
};

exports.updatePermiso = function(permiso, cb, idUser){

	var epochInicio = moment(permiso.diaInicio);
	var epochFinal = moment(permiso.diaFinal);
	var dias = epochFinal.diff(epochInicio, 'days', false) + 1;

	var solicitudActualizada = {
		diaInicio: permiso.diaInicio,
		diaFinal: permiso.diaFinal,
		detalle: permiso.detalle,
		cantidadDias: dias,
		epochInicio: epochInicio.unix(),
		epochTermino: epochFinal.unix()
	};

	if(permiso.hiddenMotivo === 'Permiso sin goce de salario' && permiso.permisosSinSalarioTipo){
		solicitudActualizada.inciso = permiso.permisosSinSalarioTipo;
	}

	Solicitudes.findById(permiso.id).exec(function (err, soli) {
		Solicitudes.findByIdAndUpdate(permiso.id, solicitudActualizada).populate('usuario').exec(function (err, solicitud) {
			if(!err) {
				Usuario.find({'tipo' : 'Supervisor', 'departamentos.departamento' : solicitud.usuario.departamentos[0].departamento}, {'email' : 1}
					).exec(function (err, supervisor) {
						if (!err) {
							Correo.find({},function(errorCritico,listaCorreos){
								if(!errorCritico &&listaCorreos.length>0){

									for (var i = 0; i < supervisor.length; i++) {
										var from = listaCorreos[0].nombreCorreo,
											to= supervisor[i].email,
											subject= 'Modificación de una solicitud de permiso anticipado en SIGUCA',
											text= " El usuario " + solicitud.usuario.nombre + " " + solicitud.usuario.apellido1 + " " + solicitud.usuario.apellido2
											+ " ha modificado el siguiente permiso anticipado: "
											+ "<br> Día de Inicio: " + soli.diaInicio
											+ "<br>Día de termino: " + soli.diaFinal
											+ "<br> Motivo: " + soli.motivo
											+ "<br> Detalle: " + soli.detalle
											+ "<br><br> A continuación se muestra el permiso anticipado modificado "
											+ "<br> Día de Inicio: " + solicitudActualizada.diaInicio
											+ "<br> Día de termino: " + solicitudActualizada.diaFinal
											+ "<br> Motivo: " + solicitud.motivo
											+ "<br> Detalle: " + solicitudActualizada.detalle;

										enviarCorreo.enviar(from, to, subject, '', text, '');
									}
								}
							});

						}
					});
}
return cb();
});
});
}

//--------------------------------------------------------------------
//Métodos Solicitudes
//---------------------------------------------------------------------*/
exports.loadSoli = function(id, cb){
	Solicitudes.findById(id, function (err, soli) {
		if(soli.estado == 'Pendiente'){
			Solicitudes.findById(id, function (err, solicitud) {
				if (err) return cb(err);
				cb(solicitud);
			});
		} else cb({motivo:'seleccionar',detalle:''});
	});
};

exports.loadExtra = function(id, cb){
    HoraExtra.findById(id, function (err, extra) {
        if(extra.estado == 'Pendiente'){
            if (err) return cb(err);
            cb(extra);
        } else cb({motivo:'seleccionar',detalle:''});
    });
};

exports.getSolicitudAnterior = function(id, cb){
    HoraExtra.findById(id, function (err, extra) {
        if(extra.estado == 'Pendiente'){
            if (err) return cb(err);
            cb(extra);
        } else cb({motivo:'seleccionar',detalle:''});
    });
};

exports.deleteSoli = function(id, cb, idUser){
	Solicitudes.findByIdAndRemove(id).populate('usuario').exec(function (err, soli) {
		if (err) return cb(err,'');
		var fecha = "";
		if(soli.fechaCreada)
			fecha = moment(soli.fechaCreada);

		Correo.find({},function(errorCritico,listaCorreos){
			if(!errorCritico &&listaCorreos.length>0){

				if(soli.tipoSolicitudes == 'Extras'){
					var	from = listaCorreos[0].nombreCorreo,
						to = soli.usuario.email,
						subject = 'Se ha eliminado una solicitud de hora extraordiaria en SIGUCA',
						text = " Estimado(a) " + soli.usuario.nombre + " " + soli.usuario.apellido1 + " " + soli.usuario.apellido2
						+ "<br> Su supervisor ha eliminado una de las solicitudes de hora extraordiaria presentadas, en la cuál se indicabá lo siguiente: "
						+ "<br> Fecha de creación: " + fecha
						+ "<br> Día Inicio: " + soli.diaInicio
						+ "<br> Hora Inicio: " + soli.horaInicio
						+ "<br> Hora Final: " + soli.horaFinal
						+ "<br> Cantidad de horas: " + soli.cantidadHoras
						+ "<br> Cliente: " + soli.cliente
						+ "<br> Motivo: " + soli.motivo
						+ "<br> Estado: " + soli.estado
						+ "<br> Comentario supervisor: " + soli.comentarioSupervisor;
					enviarCorreo.enviar(from, to, subject, '', text, '');
				} else {
					var	from = listaCorreos[0].nombreCorreo,
						to = soli.usuario.email,
						subject = 'Se ha eliminado una solicitud de permiso anticipado en SIGUCA',
						text = " Estimado(a) " + soli.usuario.nombre + " " + soli.usuario.apellido1 + " " + soli.usuario.apellido2
						+ "<br> Su supervisor ha eliminado una de las solicitudes de permiso anticipado presentadas, en la cuál se indicabá lo siguiente: "
						+ "<br> Fecha de creación: " + fecha
						+ "<br> Día Inicio: " + soli.diaInicio
						+ "<br> Día Final: " + soli.diaFinal
						+ "<br> Cantidad de días: " + soli.cantidadDias
						+ "<br> Motivo: " + soli.motivo
						+ "<br> Detalle: " + soli.detalle
						+ "<br> Estado: " + soli.estado
						+ "<br> Comentario supervisor: " + soli.comentarioSupervisor;
					enviarCorreo.enviar(from, to, subject, '', text, '');
				}
			}
		});


		return cb(err,'Se elimino');
	});
}

//--------------------------------------------------------------------
//Gestionar Eventos
//---------------------------------------------------------------------*/
exports.gestionarSoli = function(solicitud, cb, idUser){

	Usuario.findById(idUser, function (errUser, supervisor) {
		Solicitudes.findByIdAndUpdate(solicitud.id,	{estado: solicitud.estado, comentarioSupervisor:solicitud.comentarioSupervisor}).populate('usuario').exec(function (err, soli) {

			/*
			 * Actualiza las vacaciones, solo cuando son aceptadas
			 */
			if(solicitud.estado=='Aceptada' && solicitud.motivo == 'Vacaciones'){
				PeriodoUsuario.find({usuario: soli.usuario._id}).sort({numeroPeriodo:1}).exec(function(error, periodos) {
					if (error) return res.json(err);

					var cantidadDias = Number(soli.cantidadDias);

					periodos.forEach(function (periodo) {
						var diasDisponibles = periodo.diasAsignados - periodo.diasDisfrutados;
						if(cantidadDias > 0 && cantidadDias <= diasDisponibles){
							periodo.diasDisfrutados = periodo.diasDisfrutados + cantidadDias;
							periodo.save(function (error, respuesta) {});
							cantidadDias = 0;
						} else {
							if(cantidadDias > 0){
								cantidadDias = cantidadDias - diasDisponibles;
								periodo.diasDisfrutados = periodo.diasDisfrutados + diasDisponibles;
								periodo.save(function (error, respuesta) {});
							}
						}
					});
				});
			}

			/*
			*Preparar datos para el envio del correo
			*
			*/

			var a = new Date(soli.fechaCreada * 1000);
			var date = ""+a.getDate()+"/"+util.getMes(a.getMonth())+"/"+a.getFullYear();
			var solitext = "<br>Fecha de creación: "+date+"\n"
				+ "<br>Motivo: "+soli.motivo+"\n"
				+ "<br>Detalle: "+soli.detalle+"<br><br>";

			var superV = "";
			if(!errUser && supervisor) {
				superV += supervisor.nombre;
				superV += " " + supervisor.apellido1;
				superV += " " + supervisor.apellido2;
			}

			var text = "Por este medio se le notifica que la siguiente solicitud ha sido respondida:<br>"
				+ solitext
				+ "<br>Le informamos que la solicitud se encuentra en estado " + solicitud.estado
				+ " por el supervisor " + superV
				+ ", con el siguiente comentario:"
				+ "<br> " + solicitud.comentarioSupervisor
				+ "<br><br> Saludos cordiales.";


			/*
			 * Envía el correo electrónico a Recursos humanos
			 */


			if(solicitud.estado === 'Aceptada' || solicitud.estado === 'Rechazada'){
				if(soli.motivo === 'Articulo 51'){
					if(soli.motivoArticulo51 !== 'Diligencias'){

						CorreoRH.find({}, function (errorCritico, correosRH) {
							if (!errorCritico && correosRH.length > 0) {
								Correo.find({},function(errorCritico, listaCorreos) {
									if (!errorCritico && listaCorreos.length > 0) {

										var cc = Array.prototype.map.call(correosRH, function(item) { return item.correo; }).join(",");

										enviarCorreo.enviar(listaCorreos[0].nombreCorreo, soli.usuario.email, 'Respuesta a solicitud en SIGUCA', 'Estimado(a) ' + soli.usuario.nombre + ' ' + soli.usuario.apellido1 + ',', text, cc);
									}
								});
							}
						});
					}
				}

				if(soli.motivo === 'Permiso sin goce de salario'){

					CorreoRH.find({}, function (errorCritico, correosRH) {
						if (!errorCritico && correosRH.length > 0) {
							Correo.find({},function(errorCritico, listaCorreos) {
								if (!errorCritico && listaCorreos.length > 0) {

									var cc = Array.prototype.map.call(correosRH, function(item) { return item.correo; }).join(",");

									enviarCorreo.enviar(listaCorreos[0].nombreCorreo, soli.usuario.email, 'Respuesta a solicitud en SIGUCA', 'Estimado(a) ' + soli.usuario.nombre + ' ' + soli.usuario.apellido1 + ',', text, cc);

								}
							});
						}
					});

				}
			}

			return cb(err, 'Solicitud actualizada');

		});
	});
};

exports.gestionarHorasExtras = function(horaExtra, cb, idUser){

	Usuario.findById(idUser, function (errUser, supervisor) {
		HoraExtra.findByIdAndUpdate(horaExtra.id,	{estado: horaExtra.estado, comentarioSupervisor:horaExtra.comentarioSupervisor}).populate('usuario').exec(function (err, soli) {


			if (err) return cb(err, '');
			Correo.find({},function(errorCritico,listaCorreos){
				if(!errorCritico &&listaCorreos.length>0){

					var superV = '';

					if(!errUser && supervisor) {
						superV += supervisor.nombre;
						superV += ' ' + supervisor.apellido1;
						superV += ' ' + supervisor.apellido2;
					}

					var text =
					'Por este medio se le notifica que la siguiente solicitud ha sido respondida: '
					+ '<br><br>Fecha de creación: ' + moment.unix(soli.fechaCreada).format("YYYY-MM-DD hh:mm:ss") + '<br>'
						+ 'Motivo: ' + soli.motivo + '<br>'
						+ 'Ubicación: '+ soli.ubicacion+ '<br><br>'
					+ 'Le informamos que la justificación se encuentra en estado ' + horaExtra.estado
					+ ' por el supervisor ' + superV
					+ ', con el siguiente comentario: <br>'+ horaExtra.comentarioSupervisor
					+ '<br><br>Saludos cordiales.';

					enviarCorreo.enviar(listaCorreos[0].nombreCorreo, soli.usuario.email, 'Respuesta a solicitud en SIGUCA', 'Estimado(a) ' + soli.usuario.nombre + ' '+ soli.usuario.apellido1 + ',', text, '');

				}
			});

			return cb(err, 'Se elimino');

		});
	});
};
