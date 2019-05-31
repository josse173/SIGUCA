var mongoose 	= require('mongoose');
var CorreoRH 		= require('../models/CorreoRH');
const log = require('node-file-logger');

exports.insertarCorreoRH = function(req, res){

    log.Info('Insertar Correo');
    log.Info('Admin: ' +req.user._id);
    log.Info(req.body);

    var correoRH = new CorreoRH({
        correo:req.body.nombreCorreoRH
    });
    correoRH.save(function (err, correoRH) {
        if (err) console.log(err);
        res.redirect('/escritorioAdmin');
    });
};

exports.deleteCorreoRH = function(id, cb){
    CorreoRH.findByIdAndRemove(id,function(err,correoRH){
        if(!err){
            return cb(err, 'Se elimino');
        }else{
            return cb("");
        }
    });
};

exports.actualizarCorreoRH = function(req,res){
    var obj={
        correo:req.body.nombreCorreoRH,
    };

    log.Info('Actualizar correo');
    log.Info('Admin: ' +req.user._id);
    log.Info('Id del correo' + req.params.id);
    log.Info(req.body);

    CorreoRH.findByIdAndUpdate(req.params.id,obj,function(err,correoRH){
        res.redirect('correoRH');
    });
};
