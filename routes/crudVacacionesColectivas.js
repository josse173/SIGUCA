var mongoose 	= require('mongoose');
var VacacionesColectiva 		= require('../models/VacacionesColectiva');
const log = require('node-file-logger');
var moment = require('moment');

exports.insertarVacacionesColectivas = function(req, res){

    log.Info('Insertar VacacionesColectivas');
    log.Info('Admin: ' +req.user._id);
    log.Info(req.body);

    var epochTime = moment();
    var epochInicio = moment(req.body.diaInicioVC);
    var epochFinal = moment(req.body.diaFinalVC);
    var cantidadDias = contarDias(moment(req.body.diaInicioVC), moment(req.body.diaFinalVC));

    var vacacionesColectiva = new VacacionesColectiva({
        nombre: req.body.nombreVacacionesColectiva,
        fechaCreacionEpoch: epochTime.unix(),
        fechaInicialEpoch: epochInicio.unix(),
        fechaFinalEpoch: epochFinal.unix(),
        fechaCreacion: epochTime.format('DD-MM-YYYY hh:mm:ss'),
        fechaInicial: epochInicio.format('DD-MM-YYYY'),
        fechaFinal: epochFinal.format('DD-MM-YYYY'),
        cantidadDias: cantidadDias
    });

    vacacionesColectiva.save(function (err, result) {
        if (err) console.log(err);
        res.redirect('/escritorioAdmin');
    });

    function contarDias(inicio, fin) {
        cantidad = 0;
        while (fin.diff(inicio, ('days')) >= 0) {
            cantidad += 1;
            if (inicio.isoWeekday() === 6 || inicio.isoWeekday() === 7) {
                cantidad -= 1;
            }
            inicio = inicio.add(1, 'days');
        }
        return cantidad;
    }
};

exports.deleteVacacionesColectiva = function(id, cb){
    VacacionesColectiva.findByIdAndRemove(id,function(err,result){
        if(!err){
            return cb(err, 'Se elimino');
        }else{
            return cb("");
        }
    });
};

exports.actualizarVacacionesColectiva = function(req,res){
    var obj={
        nombre: req.body.nombre,
    };

    log.Info('Actualizar VacacionesColectiva');
    log.Info('Admin: ' +req.user._id);
    log.Info('Id del VacacionesColectiva' + req.params.id);
    log.Info(req.body);

    VacacionesColectiva.findByIdAndUpdate(req.params.id,obj,function(err,correoRH){
        res.redirect('vacacionesColectivas');
    });
};
