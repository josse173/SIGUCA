var Configuracion 		= require('../models/Configuracion');
const log = require('node-file-logger');

exports.actualizarConfiguracion = function(req, res){

    var configuracionActualizada = {
        nombre : req.body.nombre,
        valor : req.body.valor,
    };

    log.Info('El usuario ' + req.user._id + ' actualizo la configuración ' + req.params.id + ' nombre : ' + req.body.nombre + ', valor: ' + req.body.valor);

    Configuracion.findByIdAndUpdate(req.params.id, configuracionActualizada, function(err,configuracion){
        res.redirect('configuracionAlertas');
    });
};
