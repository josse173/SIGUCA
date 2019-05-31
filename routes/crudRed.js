var mongoose 	= require('mongoose');
var Red 		= require('../models/Red');
var moment      = require('moment');
const log = require('node-file-logger');

exports.insertarRed = function(req, res){

    log.Info('Insertar red');
    log.Info('Admin: ' +req.user._id);
    log.Info(req.body);

    var red = new Red({
        nombreRed:req.body.nombreRed,

    });
    red.save(function (err, red) {
        if (err) console.log(err);
        res.redirect('/escritorioAdmin');

    });

};


exports.deleteRed = function(id, cb){
    Red.findByIdAndRemove(id,function(err,red){
        if(!err){

            return cb(err, 'Se elimino');
        }else{
            return cb("");
        }
    });
};



exports.actualizarRed = function(req,res){
    var obj={
    nombreRed:req.body.nombreRed,
    };

    log.Info('Actualizar red');
    log.Info('Admin: ' +req.user._id);
    log.Info('Id de la red' + req.params.id);
    log.Info(req.body);

    Red.findByIdAndUpdate(req.params.id,obj,function(err,red){
    res.redirect('red');
    });
};
