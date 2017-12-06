var mongoose 	= require('mongoose');
var Correo 		= require('../models/Correo');
var moment      = require('moment');
var usuario 		= require('../models/Usuario');

exports.insertarCorreo = function(req, res){
    
    var correo = new Correo({
        nombreCorreo:req.body.nombreCorreo,
        dominioCorreo:req.body.dominioCorreo,
        password:req.body.password
        //password:usuario.generateHash(req.body.password)
       
    });
    correo.save(function (err, correo) {
        if (err) console.log(err);
        res.redirect('/escritorioAdmin');
        
    });       
           
};

exports.deleteCorreo = function(id, cb){
    Correo.findByIdAndRemove(id,function(err,correo){
        if(!err){
            
            return cb(err, 'Se elimino');
        }else{
            return cb("");
        }
    });
};


exports.actualizarCorreo = function(req,res){          
    var obj={
    nombreCorreo:req.body.nombreCorreo,
    dominioCorreo:req.body.dominioCorreo,
    password:req.body.password
    };  

    Correo.findByIdAndUpdate(req.params.id,obj,function(err,correo){
    res.redirect('correo');
    });
};