var mongoose 		= require('mongoose');
PeriodoVacaciones 	= require('../models/Periodo');
Usuario 		= require('../models/Usuario');
PeriodoUsuario 	= require('../models/PeriodoUsuario');
var moment = require('moment');


exports.addPeriodo = function(periodo, cb){
    var newPeriodo = PeriodoVacaciones(periodo);
    newPeriodo.save(function() {
        return cb();
    });
}

exports.listPeriodo = function(cb){
    PeriodoVacaciones.find().exec(function (err, periodos) {
        return cb(err, periodos);
    });
}

exports.deletePeriodo = function(id, cb){
    PeriodoVacaciones.remove({_id:id}, function (err, horas) {
        return cb(err, 'Se elimino');
    });
}

exports.cantidadVacacionesPorUsuario = function(id, cb){
    Usuario.findById(id, function (err, user) {
        var fechaIngreso = user.fechaIngreso;
        var fechaParse2=moment.unix(fechaIngreso).format("DD/MM/YYYY");
        var diaDeHoy = moment().format("DD/MM/YYYY");

        var periodos;
        var diasVacaciones;
        if(periodos<= 250){
            diasVacaciones = 15;
        } else if(periodos<= 500){
            diasVacaciones = 20;
        } else if(periodos> 500){
            diasVacaciones = 26;
        }

        return cb(err, user);
    });
}

exports.vacacionesAcumuladas = function(id, cb){
    PeriodoVacaciones.find({usuario: id}).exec(function (err, vacaciones) {
        var acumulado = 0;
        vacaciones.forEach(function (objeto, index) {
            acumulado = acumulado + parseInt(objeto.cantidadDiasRestantes);
        });
        return cb(err, acumulado);
    });
}

exports.actualizarPeriodo = function(req,res){
    var ids = req.params.id;
    var split = ids.split(',');
    var obj={
        diasDisfrutados:req.body.diasDisfrutados
    };
    PeriodoUsuario.findByIdAndUpdate(split[0],obj,function(err,periodo){
        res.redirect('periodo/'+ split[1]);
    });
};
