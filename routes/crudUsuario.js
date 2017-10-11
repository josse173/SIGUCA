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
Cierre 			= require('../models/Cierre'),
util 			= require('../util/util'),
emailSIGUCA 	= 'siguca@greencore.co.cr';
var config 			= require('../config');

//--------------------------------------------------------------------
//	Métodos Usuario
//---------------------------------------------------------------------
exports.addUsuario = function(us, cb){
	
	//Inserta los tipos de usuario como array
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
				horarioFijo:us.horarioFijo
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
				horarioEmpleado:us.personalizado
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
				});
			}
			
			newUser.password = Usuario.generateHash(us.password);
			newUser.save(function (err, user) {
				if (err) console.log(err);
				return cb()
                alert("Se ha creado un Nuevo Usuario Exitosamente");
				console.log("El usuario se creo ");
            });//Crea Usuario
		}
	});//Busca Usuario
	
	
}

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

exports.deleteUsuario = function(id, cb){
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
