var mongoose 		= require('mongoose'),
nodemailer 		= require('nodemailer'),
moment 			= require('moment'),
Marca 			= require('../models/Marca'),
Departamento 	= require('../models/Departamento'),
Usuario 		= require('../models/Usuario'),
Horario 		= require('../models/Horario'),
HorarioFijo 	= require('../models/HorarioFijo'),
HorarioPersonalizado = require('../models/HorarioEmpleado'),
Justificaciones = require('../models/Justificaciones'),
Solicitudes 	= require('../models/Solicitudes'),
Justificaciones 	= require('../models/Justificaciones'),
Marcas 	= require('../models/Marca'),
HorasTrabajadas 	= require('../models/CierrePersonal'),
Cierre 			= require('../models/Cierre'),
util 			= require('../util/util'),
emailSIGUCA 	= 'siguca@greencore.co.cr',
Periodo = require('../models/Periodo'),
PeriodoUsuario = require('../models/PeriodoUsuario');
var config 			= require('../config');


//--------------------------------------------------------------------
//	Métodos Usuario
//---------------------------------------------------------------------
exports.addUsuario = function(us, cb){
	if(!us.teleTrabajo){
		us.teleTrabajo="off";
	}

	var arrayTipo = [];
	if(us.tipo instanceof Array){
		for( var t in us.tipo){
			arrayTipo.push(us.tipo[t]);
		}
	} else {
		arrayTipo.push(us.tipo);
	}

	//Inserta los departamentos como array
	var array = [];
	if(us.idDepartamento instanceof Array){
		for( var i in us.idDepartamento){
			array.push({departamento: us.idDepartamento[i]});
		}
	} else {
		array.push({departamento: us.idDepartamento});
	}
	Usuario.findOne({ 'username' :  us.username }, function (err, user) {
		if (err) return cb(err);
		if (!user) {
			if(us.idHorario){
				var newUser = new Usuario({
				username: us.username,
				tipo: arrayTipo,
				estado: "Activo",
				nombre: us.nombre,
				apellido1: us.apellido1,
				apellido2: us.apellido2,
				email: us.email,
				cedula: us.cedula,
				codTarjeta: us.codTarjeta,
				departamentos: array,
				horario: us.idHorario,
				teleTrabajo:us.teleTrabajo

				});
			}else if(us.horarioFijo){

				var newUser = new Usuario({
				username: us.username,
				tipo: arrayTipo,
				estado: "Activo",
				nombre: us.nombre,
				apellido1: us.apellido1,
				apellido2: us.apellido2,
				email: us.email,
				cedula: us.cedula,
				codTarjeta: us.codTarjeta,
				departamentos: array,
				horarioFijo:us.horarioFijo,
				teleTrabajo:us.teleTrabajo
				});
			}else if(us.personalizado){
				var newUser = new Usuario({
				username: us.username,
				tipo: arrayTipo,
				estado: "Activo",
				nombre: us.nombre,
				apellido1: us.apellido1,
				apellido2: us.apellido2,
				email: us.email,
				cedula: us.cedula,
				codTarjeta: us.codTarjeta,
				departamentos: array,
				horarioEmpleado:us.personalizado,
				teleTrabajo:us.teleTrabajo
				});
			}else{
				var newUser = new Usuario({
				username: us.username,
				tipo: arrayTipo,
				estado: "Activo",
				nombre: us.nombre,
				apellido1: us.apellido1,
				apellido2: us.apellido2,
				email: us.email,
				cedula: us.cedula,
				codTarjeta: us.codTarjeta,
				departamentos: array,
				teleTrabajo:us.teleTrabajo
				});
			}

			//Se pasa la fecha a epoch
			var splitDate1 = us.fechaIngreso.split('/');
			console.log(us.fechaIngreso);
			var day = splitDate1[0];
			if(parseInt(day) > 28){
				day = 28;
			}
    		var date1 = new Date(splitDate1[2], splitDate1[1]-1, day);
			var fechaIngresoEpoch = (date1.getTime() - date1.getMilliseconds())/1000;
			newUser.fechaIngreso = fechaIngresoEpoch;

			newUser.password = Usuario.generateHash(us.password);
			newUser.save(function (err, usuarioCreado) {
				if (err) console.log(err);

				console.log("El usuario se creo");

				Periodo.find({}).sort({ "numeroPeriodo" : 1}).exec(function(error, periodos){

					console.log(periodos);

					var fechaActual = moment().unix();
					console.log('fechaActual: '+ moment.unix(fechaActual).format("YYYY-MM-DD hh:mm:ss"));
					console.log('fechaIngresoEpoch: '+ moment.unix(fechaIngresoEpoch).format("YYYY-MM-DD hh:mm:ss"));

					var cantidadSemanas = moment.unix(fechaIngresoEpoch).diff(fechaActual, 'week');

					console.log('cantidadSemanas: ' + cantidadSemanas);

					if(cantidadSemanas > 50){
						crearPeriodo(periodos, fechaActual, usuarioCreado._id, fechaIngresoEpoch, 50);
					}

				});

				return cb();

            });//Crea Usuario
		}
	});//Busca Usuario

	function crearPeriodo(periodos, fechaActual, usuario, fechaIngreso, cantidadSemanas) {

		var fechaPeriodo = fechaIngreso + 30240000;

		if(fechaPeriodo < fechaActual){
			periodos.forEach(function(periodo) {
				if(cantidadSemanas >= periodo.rangoInicial && cantidadSemanas < periodo.rangoFinal){

					var periodoUsuario = new PeriodoUsuario({
                        fechaCreada: fechaActual,
						usuario: usuario,
						periodo: periodo._id,
                        nombrePeriodoPadre: periodo.nombre,
						fechaInicio: fechaIngreso,
						fechaFinal: fechaPeriodo,
						diasAsignados: periodo.cantidadDias
					});

					periodoUsuario.save(function (err, respuesta) {
						if (err) console.log(err);
					});

					crearPeriodo(periodos, fechaActual, usuario, fechaPeriodo, (cantidadSemanas + 50));
				}
			});
		}

	}
};

exports.get = function(query, cb){
	Usuario.find(query).exec(function (err, empleados){
		cb(err, empleados);
    });//Usuario
}

exports.listUsuarios = function(cb){
	Usuario.find().populate('departamentos.departamento').populate('horario').populate("horarioFijo").populate("horarioEmpleado").exec(function (err, empleados){
		Horario.find().exec(function (err, horarios) {
			Departamento.find().exec(function (err, departamentos) {
				HorarioFijo.find().exec(function(error,horariosFijo){
					HorarioPersonalizado.find().exec(function(error,personalizado){
						var render = {
							title: 'Gestionar empleados | SIGUCA',
							empleados: empleados,
							horarios: horarios,
							departamentos: departamentos,
							tipoEmpleado: config.empleado2,
							empleadoProfesor: config.empleadoProfesor,
							horarioFijo:horariosFijo,
							horarioPersonalizado:personalizado
						};
				return cb(err, render);
					});

				});//horarioFijo
            });//Departamento
        });//Horario
    });//Usuario
}

exports.loadUsuarios = function(id, cb){
	Usuario.findById(id, function (err, empleado) {
		return cb(err, empleado);
	});
}

exports.getById = function(id, cb){
	Usuario.findById(id, function (err, empleado) {
		return cb(err, empleado);
	});
}


exports.updateUsuario = function(data, cb){

	if(!data.empleado.teleTrabajo){
		data.empleado.teleTrabajo="off";
	}
	delete data.empleado._id;

	//Se pasa la fecha a epoch
	if(data.empleado.fechaIngreso != ""){
		var splitDate1 = data.empleado.fechaIngreso.split('/');

		var day = splitDate1[0];
		if(parseInt(day) > 28){
			day = 28;
		}

		var date1 = new Date(splitDate1[2], splitDate1[1]-1, day);
		var epoch = (date1.getTime() - date1.getMilliseconds())/1000;
		data.empleado.fechaIngreso = epoch;
	}else{
		data.empleado.fechaIngreso = 0;
	}

	data.empleado.estado=data.empleado.estadoEmpleado;
	delete data.empleado.estadoEmpleado;

	if(data.empleado.horarioFijo && data.empleado.horarioFijo!="Sin horario" &&
	data.empleado.horarioEmpleado && data.empleado.horarioEmpleado!="Sin horario" ){
		delete data.empleado.horarioFijo;
	}else if(data.empleado.horario && data.empleado.horario!="Sin horario" &&
	data.empleado.horarioEmpleado && data.empleado.horarioEmpleado!="Sin horario"){
		delete data.empleado.horario;
	}


	if(data.empleado.horarioFijo && data.empleado.horarioFijo!="Sin horario") {



		Usuario.update({_id:data.id},{ $unset: {horario: ""}},function(error,correcto){});
		delete data.empleado.horario;

		Usuario.update({_id:data.id},{ $unset: {horarioEmpleado: ""}},function(error,correcto){});
		delete data.empleado.horarioEmpleado;

		var arrayTipo = [];
		if(data.empleado.tipo instanceof Array){
			for( var t in data.empleado.tipo){
				arrayTipo.push(data.empleado.tipo[t]);
			}
		} else {
			arrayTipo.push(data.empleado.tipo);
		}
		data.empleado.tipo = arrayTipo;

		//Genera el array de departamentos
		var array = [];
		if(data.empleado.departamentos instanceof Array){
			for( var i in data.empleado.departamentos){
				array.push({departamento:data.empleado.departamentos[i]});
			}
			data.empleado.departamentos = array;
		} else if (data.empleado.departamentos){
			array.push({departamento:data.empleado.departamentos});
			data.empleado.departamentos = array;
		}
		if(data.empleado.password && data.empleado.password != ""){
			data.empleado.password = Usuario.generateHash(data.empleado.password);
		} else {
			delete data.empleado.password;
		}
		Usuario.findByIdAndUpdate(data.id, data.empleado, function (err, empleado) {
			return cb(err, empleado);
		});

	}
	else if(data.empleado.horario && data.empleado.horario!="Sin horario"){



		Usuario.update({_id:data.id},{ $unset: {horarioFijo: ""}},function(error,correcto){});
		delete data.empleado.horarioFijo;

		Usuario.update({_id:data.id},{ $unset: {horarioEmpleado: ""}},function(error,correcto){});
		delete data.empleado.horarioEmpleado;

		var arrayTipo = [];
		if(data.empleado.tipo instanceof Array){
			for( var t in data.empleado.tipo){
				arrayTipo.push(data.empleado.tipo[t]);
			}
		} else {
			arrayTipo.push(data.empleado.tipo);
		}
		data.empleado.tipo = arrayTipo;

		//Genera el array de departamentos
		var array = [];
		if(data.empleado.departamentos instanceof Array){
			for( var i in data.empleado.departamentos){
				array.push({departamento:data.empleado.departamentos[i]});
			}
			data.empleado.departamentos = array;
		} else if (data.empleado.departamentos){
			array.push({departamento:data.empleado.departamentos});
			data.empleado.departamentos = array;
		}
		if(data.empleado.password && data.empleado.password != ""){
			data.empleado.password = Usuario.generateHash(data.empleado.password);
		} else {
			delete data.empleado.password;
		}

		Usuario.findByIdAndUpdate(data.id, data.empleado, function (err, empleado) {
			return cb(err, empleado);
		});
	}



	else if(data.empleado.horarioEmpleado && data.empleado.horarioEmpleado!="Sin horario"){




		Usuario.update({_id:data.id},{ $unset: {horarioFijo: ""}},function(error,correcto){});
		delete data.empleado.horarioFijo;

		Usuario.update({_id:data.id},{ $unset: {horario: ""}},function(error,correcto){});
		delete data.empleado.horario;

		var arrayTipo = [];
		if(data.empleado.tipo instanceof Array){
			for( var t in data.empleado.tipo){
				arrayTipo.push(data.empleado.tipo[t]);
			}
		} else {
			arrayTipo.push(data.empleado.tipo);
		}
		data.empleado.tipo = arrayTipo;

		//Genera el array de departamentos
		var array = [];
		if(data.empleado.departamentos instanceof Array){
			for( var i in data.empleado.departamentos){
				array.push({departamento:data.empleado.departamentos[i]});
			}
			data.empleado.departamentos = array;
		} else if (data.empleado.departamentos){
			array.push({departamento:data.empleado.departamentos});
			data.empleado.departamentos = array;
		}
		if(data.empleado.password && data.empleado.password != ""){
			data.empleado.password = Usuario.generateHash(data.empleado.password);
		} else {
			delete data.empleado.password;
		}

		Usuario.findByIdAndUpdate(data.id, data.empleado, function (err, empleado) {
			return cb(err, empleado);
		});
	}




	else if(data.empleado.horario==="Sin horario" && data.empleado.horarioFijo==="Sin horario" && data.empleado.horarioEmpleado==="Sin horario"){



		Usuario.update({_id:data.id},{ $unset: {horario: ""}},function(error,correcto){});
		Usuario.update({_id:data.id},{ $unset: {horarioFijo: ""}},function(error,correcto){});
		Usuario.update({_id:data.id},{ $unset: {horarioEmpleado: ""}},function(error,correcto){});
		delete data.empleado.horario;
		delete data.empleado.horarioFijo;
		delete data.empleado.horarioEmpleado;

		var arrayTipo = [];
		if(data.empleado.tipo instanceof Array){
			for( var t in data.empleado.tipo){
				arrayTipo.push(data.empleado.tipo[t]);
			}
		} else {
			arrayTipo.push(data.empleado.tipo);
		}
		data.empleado.tipo = arrayTipo;

		//Genera el array de departamentos
		var array = [];
		if(data.empleado.departamentos instanceof Array){
			for( var i in data.empleado.departamentos){
				array.push({departamento:data.empleado.departamentos[i]});
			}
			data.empleado.departamentos = array;
		} else if (data.empleado.departamentos){
			array.push({departamento:data.empleado.departamentos});
			data.empleado.departamentos = array;
		}
		if(data.empleado.password && data.empleado.password != ""){
			data.empleado.password = Usuario.generateHash(data.empleado.password);
		} else {
			delete data.empleado.password;
		}
		Usuario.findByIdAndUpdate(data.id, data.empleado, function (err, empleado) {
			return cb(err, empleado);
		});
	}else{



		if(data.empleado.horarioFijo==="Sin horario"){
			delete data.empleado.horarioFijo;
		}
		if(data.empleado.horario==="Sin horario"){
			delete data.empleado.horario;
		}

		if(data.empleado.horarioEmpleado==="Sin horario"){
			delete data.empleado.horarioEmpleado;
		}


		var arrayTipo = [];
		if(data.empleado.tipo instanceof Array){
			for( var t in data.empleado.tipo){
				arrayTipo.push(data.empleado.tipo[t]);
			}
		} else {
			arrayTipo.push(data.empleado.tipo);
		}
		data.empleado.tipo = arrayTipo;

		//Genera el array de departamentos
		var array = [];
		if(data.empleado.departamentos instanceof Array){
			for( var i in data.empleado.departamentos){
				array.push({departamento:data.empleado.departamentos[i]});
			}
			data.empleado.departamentos = array;
		} else if (data.empleado.departamentos){
			array.push({departamento:data.empleado.departamentos});
			data.empleado.departamentos = array;
		}
		if(data.empleado.password && data.empleado.password != ""){
			data.empleado.password = Usuario.generateHash(data.empleado.password);
		} else {
			delete data.empleado.password;
		}


		Usuario.findByIdAndUpdate(data.id, data.empleado, function (err, empleado) {
			return cb(err, empleado);
		});
	}

}

exports.reset=function(){
	    var array=new Array();
	    array.push('Supervisor');
	    array.push('Administrador');
	    var newUser = new Usuario({
	        username: 'admingreencore',
	        tipo: array,
	        estado: 'Activo',
	        nombre: 'admin',
	        apellido1: 'admin',
	        apellido2: 'admin',
	        email:'siguca@greencore.co.cr',
	        cedula: 123456789,
	        codTarjeta: 987654321,
	        teleTrabajo:'on',
	        password:'$2a$10$SdewSlSm/hT/d6fvzmjNgOs4Mss3YIt6yjtF3B2AtI1EBpuehgEKG'
	        
	        });

	        newUser.save(function (err, user) {
	            if (err) console.log(err);
	        
	        });
	    
	}

exports.deleteUsuario = function(id, cb){

	HorasTrabajadas.remove({usuario:id}, function (err, horas) {
	});

	Justificaciones.remove({usuario:id}, function (err, justificaciones) {
	});

	Marcas.remove({usuario:id}, function (err, marcas) {
	});

	Solicitudes.remove({usuario:id}, function (err, solicitudes) {
	});

	Usuario.remove({_id:id}, function (err, empleados) {
		if (err) return cb(err, '');
		return cb(err, 'Se elimino');
	});
	/*Usuario.findByIdAndUpdate(id, {estado:'Inactivo'}, function (err, empleados) {
		if (err) return cb(err, '');
		return cb(err, 'Se elimino');
	});*/
}

exports.changeUsername = function(user, cb){
	Usuario.findByIdAndUpdate(user.id, {username: user.username}, function (err, user) {
		return cb();
	});
}

exports.changePassword = function(data, cb){
	var currentPassword = Usuario.generateHash(data.currentPassword);
	Usuario.findById(data.id, function (err, user){
		if(!user.validPassword(currentPassword)){
			if(data.newPassword != "" && data.newPassword != null && data.newPassword === data.repeatNewPassword){
				var us = {};
				us.password = Usuario.generateHash(data.newPassword);
				Usuario.findByIdAndUpdate(data.id, us, function (err, user) {
					if (err) return cb(err);
					console.log("Se actualizo la contraseña con exito");
					return cb();
				});
			} else { console.log("Nueva contraseña inválida."); return cb();}
		} else { console.log("Contraseña inválida."); return cb();}
	});
}

exports.getEmpleadoPorSupervisor = function(idSupervisor, usuarioQuery, callback){
	Usuario.find({_id:idSupervisor}).exec(function(error, supervisor){
		var depIds = [];
		for(depSup in supervisor[0].departamentos){
			if(supervisor[0].departamentos[depSup].departamento)
				depIds.push(supervisor[0].departamentos[depSup].departamento.toString());
		}
		Departamento.find({_id:{"$in":depIds}}).exec(function(error, departamentos){
			usuarioQuery.departamentos = {$elemMatch:{departamento:{"$in":depIds}}};
			Usuario.find(usuarioQuery).exec(function(error, usuarios){
				callback(error, usuarios, departamentos);
			});//
		});//
	});//
}

exports.updateVacaciones = function(){
	//Configuración al correo
	var transporter = nodemailer.createTransport('smtps://'+config.emailUser+':'+config.emailPass+'@'+config.emailEmail);
	var emailSIGUCA 	= 'siguca@greencore.co.cr';
	var fechaActual = new Date();

	//Obtiene usuarios activos
	Usuario.find({estado: "Activo", fechaIngreso: {$exists: true, $ne:0}, tipo: {$ne:"Supervisor"}}).populate("departamentos").exec(function(err, listUserTem){

		/**
		 * Validaciones para optener los usuarios a los que se les debe aumentar vacaciones
		 */
		Usuario.find({estado:"Activo", tipo:"Supervisor"}).populate("departamentos").exec(function(err, listSupervisor){

			var listIdUser = [];
			var listUser = [];
			for (var i = 0, len = listUserTem.length; i < len; i++) {
				var user = listUserTem[i];

				//Valida que no tome en cuenta usuarios que solo sean profesores
				if(user.tipo.length != 1 || user.tipo != "Profesor" ){

					//Valida que el día sea igual al actual
					var fechaIngreso = new Date(user.fechaIngreso*1000);
					if(fechaIngreso.getDate() == fechaActual.getDate()){
						listIdUser.push(user.id);
						listUser.push(user);
					}
				}
			}

			/**
			 * Aumento de vacaciones
			 */
			Usuario.update({_id:{$in: listIdUser}}, {$inc:{vacaciones:1}},{multi:true}, function(err){

				/**
				 * Envío de correos
				 */
				var listEmail = [];
				for (var cont = 0; cont < listUser.length; cont++) {
					var user = listUser[cont];
					if(user.vacaciones >= 11){//11 porque La lista utilizada no tiene el aumento de vacaciones

						/**
						 * Envío de correo a empleados.
						 */
						transporter.sendMail({
							from: emailSIGUCA,
							to: user.email,
							subject: 'Acumulación de vacaciones',
							text: " Señor " + user.nombre + " " + user.apellido1
							+ ", usted dispone de " + (user.vacaciones+1) + " días de vacaciones, se recomienda no exceder 12 días,"
							+ " favor contactar a su supervisor.\n\n ¡Saludos!"
						});

						//Recorre departamentos del usuario
						for (var index = 0; index < user.departamentos.length; index++) {
							var dpt = user.departamentos[index];

							//Recorre supervisores
							for (var insts = 0; insts < listSupervisor.length; insts++) {
								var spv = listSupervisor[insts];

								//Recorre los dpts de cada supervisor
								for (var instd = 0; instd < spv.departamentos.length; instd++) {
									var dptSpv = spv.departamentos[instd];

									//Verifica el departamento del usuario con el departamento del supervisor
									if((dpt.departamento+"") == (dptSpv.departamento+"")){

										//Verifica en la lista de correos a enviar.
										var existe = false;
										for (var instE = 0; instE < listEmail.length; instE++) {
											var email = listEmail[instE];

											if(email.idSpv && email.idSpv == spv.id){
												existe = true;

												//Busca en los id concatenados para no repetirlos de nuevo
												var buscaUsr = false;
												for (var instIdEmail = 0; instIdEmail < email.idUser.length; instIdEmail++) {
													var emailUser = email.idUser[instIdEmail];
													if(emailUser == user.id){
														buscaUsr = true;
													}
												}
												if(!buscaUsr){
													listEmail[instE].message += "\t" + user.nombre + " " + user.apellido1 + " ("+(user.vacaciones+1)+")\n";
													listEmail[instE].idUser.push(user.id);
												}
											}
										}
										//Si no existe el supervisor en el listado de correos, se agrega
										if(!existe){
											listEmail.push({
												nameSpv: spv.nombre + " " + spv.apellido1,
												idSpv: spv.id,
												message: "\t" + user.nombre + " " + user.apellido1 + " ("+(user.vacaciones+1)+")\n ",												idUser: [user.id],
												emailSpv: spv.email,
												idUser: [user.id]
											});
										}
									}
								}
							}
						}
					}
				}


				/**
				 * Envía correos a los supervisores
				 */
				for (var instIdEmail = 0; instIdEmail < listEmail.length; instIdEmail++) {
					var email = listEmail[instIdEmail];
					transporter.sendMail({
						from: emailSIGUCA,
						to: email.emailSpv,
						subject: 'Acumulación de vacaciones',
						text: "Estimado(a) " + email.nameSpv +", se le informa que la siguiente lista de usuarios ha superado 11 días de vacaciones acumulados:\n"
						+ email.message + "\n\n ¡Saludos!"
					});

				}
			});
		});
	});//Fin consulta obtiene usuarios
}
