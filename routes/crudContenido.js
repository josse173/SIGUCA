var mongoose 	= require('mongoose');
var Contenido 		= require('../models/Contenido');
var moment      = require('moment');


exports.actualizarContenido = function(req,res){
          var obj={
            titulo:req.body.titulo,
         };  
         
         Contenido.findByIdAndUpdate(req.params.id,obj,function(err,contenido){
            res.redirect('Contenido');
         });
         
};