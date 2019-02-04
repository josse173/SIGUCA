var mongoose 		= require('mongoose'),
PeriodoVacaciones 	= require('../models/PeriodoVacaciones')


exports.addPeriodo = function(periodo, cb){
    var newPeriodo = PeriodoVacaciones(periodo);
    newPeriodo.save(function() {
        return cb();
    })
}

exports.listPeriodo = function(cb){
    PeriodoVacaciones.find().exec(function (err, periodos) {
        return cb(err, periodos);
    });
}

exports.deletePeriodo = function(id, cb){

    PeriodoVacaciones.remove({usuario:id}, function (err, horas) {
    });
}