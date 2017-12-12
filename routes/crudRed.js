var mongoose 	= require('mongoose');
var Red 		= require('../models/Red');
var moment      = require('moment');

exports.insertarRed = function(req, res){
    
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

    Red.findByIdAndUpdate(req.params.id,obj,function(err,red){
    res.redirect('red');
    });
};