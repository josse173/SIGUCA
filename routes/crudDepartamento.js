

var Departamento 	= require('../models/Departamento'),
Usuario 			= require('../models/Usuario');
//--------------------------------------------------------------------
//Métodos Departamento
//---------------------------------------------------------------------
exports.addDepa = function(departamento, cb){
	var newDepartamento = Departamento(departamento);
	newDepartamento.save(function() {
		return cb();
	})
}

exports.listDepa = function(cb){
	Departamento.find().exec(function (err, departamentos) {
		return cb(err, departamentos);
	});
}

exports.loadDepa = function(id, cb){
	Departamento.findById(id, function (err, departamento) {
		if (err) return cb(err);
		else return cb(departamento);
	});
}

exports.updateDepa = function(data, cb){
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
