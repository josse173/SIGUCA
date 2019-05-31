var mongoose 	= require('mongoose');
var Contenido 		= require('../models/Contenido');
var moment      = require('moment');
const log = require('node-file-logger');

exports.actualizarContenido = function(req,res){
          var obj={
            titulo:req.body.titulo,
         };
    log.Info('El usuario ' + req.user._id + ' actualizo el contenido ' + req.params.id + ' titulo : ' + req.body.titulo );

    Contenido.findByIdAndUpdate(req.params.id,obj,function(err,contenido){
            res.redirect('Contenido');
         });

};
