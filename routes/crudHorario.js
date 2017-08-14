var mongoose 		= require('mongoose'),
nodemailer 		= require('nodemailer'),
moment 			= require('moment'),
HorarioEmpleado	= require('../models/HorarioEmpleado'),
Usuario 		= require('../models/Usuario'),
util 			= require('../util/util');

exports.create = function(horario, cb) {
	HorarioEmpleado(horario).save(function (err, horario){
		return cb(err, horario);
	});
};

exports.get = function(query, cb){
	HorarioEmpleado.find(query).exec(function (err, horarios) {
		return cb(err, horarios);
	});
}

exports.getAll = function(cb){
	this.get(null, cb);
}

exports.getById = function(id, cb){
	//HorarioEmpleado.findById(id, function (err, horarios) {
	HorarioEmpleado.findById(id, function (err, horarios) {
		return cb(err, horarios);
	});
}

exports.getByUser = function(userId, cb){
	Usuario.findById(userId, function(err, user){
		HorarioEmpleado.findById(user.horarioEmpleado, function (err, horarios) {
			return cb(err, horarios);
		});
	});
}

exports.updateByUser = function(userId, data, cb){
	Usuario.findById(userId, function(err, user){
		HorarioEmpleado.findByIdAndUpdate(user.horarioEmpleado, data,
			function (err, horarios) {
				return cb(err, horarios);
			});
	});
}

/*
exports.delete = function(id, cb){
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
*/