var mongoose 		= require('mongoose');
var Feriados 		= require('../models/Feriado');
var moment = require('moment');

exports.insertarFeriado = function(req, res){
    if(req.body.date && req.body.date.split("/").length == 3){
            var date = req.body.date.split("/");
            var epochGte = moment();
            epochGte.year(date[2]).month(date[1]-1).date(date[0]);
            //epochGte.hour(0).minutes(0).seconds(0);
            var fecha=epochGte.unix();
           //console.log(moment.unix(fecha).format("MM/DD/YYYY")) Linea importante
           
           var feriado = new Feriados({
			   nombreFeriado:req.body.nombreFeriado,
               epoch:fecha
            });
          feriado.save(function (err, feriado) {
				if (err) console.log(err);
				res.redirect('/escritorioAdmin');
               
            });//Crea Usuari  
           
           
        }else{ 
            res.redirect('/escritorioAdmin');
        }
};

exports.deleteFeriado = function(id, cb){
    Feriados.findByIdAndRemove(id,function(err,feriado){
        if(!err){
            
            return cb(err, 'Se elimino');
        }else{
            return cb("");
        }
    });
};


exports.actualizarFeriado = function(req,res){
    var date = req.body.epoch.split("/");
          var epo = moment();
          epo.year(date[2]).month(date[1]-1).date(date[0]);
          var fecha=epo.unix();
          var obj={
            epoch:fecha,
            nombreFeriado:req.body.nombreFeriado
         };  
         Feriados.findByIdAndUpdate(req.params.id,obj,function(err,feriado){
            res.redirect('feriado');
         });
};


