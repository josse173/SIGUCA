

var Departamento 	= require('../models/Departamento'),
Usuario 			= require('../models/Usuario');
const log = require('node-file-logger');
//--------------------------------------------------------------------
//Métodos Departamento
//---------------------------------------------------------------------
exports.addDepa = function(departamento, cb){
	var newDepartamento = {};

	if(departamento.departamentoSupervisor){
		newDepartamento = Departamento({nombre: departamento.nombre, departamentoSupervisor: departamento.departamentoSupervisor, nivel: departamento.nivel});
	}else{
		newDepartamento = Departamento({nombre: departamento.nombre, departamentoSupervisor: null, nivel: departamento.nivel});
	}

	console.log(departamento);

	newDepartamento.save(function(err, creado) {
		return cb();
	})
}

exports.listDepa = function(cb){
	Departamento.find().populate('departamentoSupervisor').exec(function (err, departamentos) {
		return cb(err, departamentos);
	});
}

exports.loadDepa = function(id, cb){
	Departamento.findById(id, function (err, departamento) {
		if (err) return cb(err);
		else return cb(departamento);
	}).populate('departamentoSupervisor');
}

exports.updateDepa = function(data, cb){

	if(!data.departamento.departamentoSupervisor){
		data.departamento.departamentoSupervisor = null;
	}

	Departamento.findByIdAndUpdate(data.id, data.departamento, function (err, departamento) {
		return cb();
	});
}

exports.deleteDepa = function(id, cb){
	Usuario.find({"departamentos.departamento": id, "estado": "Activo"}).exec(function (err, usuario) {
		if(usuario.length === 0){
			Departamento.findByIdAndRemove(id, function (err, departamento) {
				cb('Se elimino');
			});
		} else{
			cb('false');
		}
	});
}
