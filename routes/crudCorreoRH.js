var mongoose 	= require('mongoose');
var CorreoRH 		= require('../models/CorreoRH');

exports.insertarCorreoRH = function(req, res){

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

    CorreoRH.findByIdAndUpdate(req.params.id,obj,function(err,correoRH){
        res.redirect('correoRH');
    });
};
