var Configuracion 		= require('../models/Configuracion');

exports.actualizarConfiguracion = function(req, res){

    var configuracionActualizada = {
        nombre : req.body.nombre,
        valor : req.body.valor,
    };

    Configuracion.findByIdAndUpdate(req.params.id, configuracionActualizada, function(err,configuracion){
        res.redirect('configuracionAlertas');
    });
};
