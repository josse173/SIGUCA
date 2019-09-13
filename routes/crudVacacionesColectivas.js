var mongoose 	= require('mongoose');
var VacacionesColectiva = require('../models/VacacionesColectiva');
var Feriado = require('../models/Feriado');
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

    let epochGte = epochInicio.hours(0).minutes(0).seconds(0).unix(),
        epochLte = epochFinal.hours(23).minutes(59).seconds(59).unix();

    Feriado.find({epoch: {"$gte": epochGte, "$lte": epochLte}}).exec(function(error, feriados){
        if (error) return res.json(err);

        let cantidadDeFeriados = 0;

        if(feriados){
            cantidadDeFeriados = feriados.length;
        }

        vacacionesColectiva.cantidadDias = vacacionesColectiva.cantidadDias - cantidadDeFeriados;

        vacacionesColectiva.save(function (err, result) {
            if (err) console.log(err);
            res.redirect('/escritorioAdmin');
        });
    });




};

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

    var epochInicio = moment(req.body.diaInicioVC);
    var epochFinal = moment(req.body.diaFinalVC);
    var cantidadDias = contarDias(moment(req.body.diaInicioVC), moment(req.body.diaFinalVC));

    var obj = {
        nombre: req.body.nombreVacacionesColectiva,
        fechaInicialEpoch: epochInicio.unix(),
        fechaFinalEpoch: epochFinal.unix(),
        fechaInicial: epochInicio.format('DD-MM-YYYY'),
        fechaFinal: epochFinal.format('DD-MM-YYYY'),
        cantidadDias: cantidadDias
    };

    log.Info('Actualizar VacacionesColectiva');
    log.Info('Admin: ' +req.user._id);
    log.Info('Id del VacacionesColectiva' + req.params.id);
    log.Info(req.body);

    let epochGte = epochInicio.hours(0).minutes(0).seconds(0).unix(),
        epochLte = epochFinal.hours(23).minutes(59).seconds(59).unix();

    Feriado.find({epoch: {"$gte": epochGte, "$lte": epochLte}}).exec(function(error, feriados){
        if (error) return res.json(err);

        let cantidadDeFeriados = 0;

        if(feriados){
            cantidadDeFeriados = feriados.length;
        }

        obj.cantidadDias = obj.cantidadDias - cantidadDeFeriados;

        VacacionesColectiva.findByIdAndUpdate(req.params.id, obj,function(err,respuesta){
            res.redirect('vacacionesColectivas/Pendiente');
        });
    });


};
