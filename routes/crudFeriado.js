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

exports.listaFeriados=function(cb){
    Feriados.find(function(err,feriados){
        if(err){
            return;
        }else{
            var feriadosArreglado = new Array();
            for (var i=0;i<feriados.length;i++){
                var obj=new Object();
                obj._id=feriados[i]._id;
                obj.nombreFeriado=feriados[i].nombreFeriado;

                var anTemporal=moment.unix(feriados[i].epoch).format("DD/MM/YY").split("/");
                var obj=new Object();
                obj._id=feriados[i]._id;
                obj.nombreFeriado=feriados[i].nombreFeriado;

                var utcSeconds = feriados[i].epoch;
                var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
                d.setUTCSeconds(utcSeconds)
                d.setFullYear(moment().year());

                var diasSemana = new Array("Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado");
                var meses = new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
                obj.epoch=diasSemana[d.getDay()]+" "+anTemporal[0]+" "+"de"+meses[d.getMonth()]+" "+moment().year();
                feriadosArreglado.push(obj);


            }

            cb(feriadosArreglado);
        }
    });
}


