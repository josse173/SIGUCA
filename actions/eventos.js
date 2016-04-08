
var moment = require('moment');
var Marca = require('../models/Marca');
var Usuario = require('../models/Usuario');
var Horario = require('../models/Horario');
var Departamento = require('../models/Departamento');
var Justificaciones = require('../models/Justificaciones');
var Solicitudes = require('../models/Solicitudes');
var Cierre = require('../models/Cierre');
var util = require('../util/util');
var crud = require('../routes/crud');

module.exports = {
	gestionarEventos : function (req, res) {
		if (req.session.name == "Supervisor") {
            //***********************************
            Usuario.find(
                {tipo:{"$nin": ['Administrador']}}
                ).exec(
                function(error, usuarios) {
                    //***********************************
                    Justificaciones.find(
                        {estado:'Pendiente'}
                        ).populate('usuario').exec(
                        function(error, justificaciones) {
                            //***********************************
                            Solicitudes.find(
                                {tipoSolicitudes:'Extras', estado:'Pendiente'}
                                ).populate('usuario').exec(
                                function(error, extras) {
                                    //***********************************
                                    Solicitudes.find(
                                        {tipoSolicitudes:'Permisos', estado:'Pendiente'}
                                        ).populate('usuario').exec(
                                        function(error, permisos){
                                            var arrayDepa = [];
                                            req.user.departamentos.forEach(function (departamento){
                                                arrayDepa.push(departamento.departamento);
                                            });
                                            var arrayUsuario = util.eventosAjuste(usuarios, req.user,"gestionar");
                                            var arrayJust = util.eventosAjuste(justificaciones, req.user,"gestionar");
                                            var arrayExtras = util.eventosAjuste(extras, req.user,"gestionar");
                                            var arrayPermisos = util.eventosAjuste(permisos, req.user,"gestionar");
                                            
                                            if (error) return res.json(error);
                                            return res.render('gestionarEventos', {
                                                title: 'Gestionar eventos | SIGUCA',
                                                usuario: req.user,
                                                justificaciones: arrayJust,
                                                extras: arrayExtras,
                                                permisos: arrayPermisos,
                                                usuarios: arrayUsuario,
                                                departamentos: arrayDepa,
                                                empleado: 'Todos los usuarios'
                                            });//res.render
                                        });//Permisos
                                });//Extras
                        });//Justificaciones
                });//Usuarios
		      //
       } else {
         req.logout();
         res.redirect('/');
     }
 },
 filtrarEventos : function (req, res) {
   if (req.session.name == "Supervisor") {

      var usuarios = req.body.filtro;
      var option = usuarios.split('|');

      usuarioId = option[0];

      var justQuery = {};
      var extraQuery = {tipoSolicitudes:'Extras'};
      var permisosQuery = {tipoSolicitudes:'Permisos'};
      var marcaQuery = {};
      var cierresQuery = {tipo: 'Personal'};

      if(usuarioId != 'todos'){
         justQuery.usuario = extraQuery.usuario = permisosQuery.usuario = marcaQuery.usuario = cierresQuery.usuario = usuarioId;
     } 
     var epochDesde, epochHasta;
     if(req.body.fechaDesde != '' && req.body.fechaHasta != ''){
         var splitDate1 = req.body.fechaDesde.split('/');
         var date1 = new Date(splitDate1[2], splitDate1[1]-1, splitDate1[0]);
         var epochDesde = (date1.getTime() - date1.getMilliseconds())/1000;

         var splitDate2 = req.body.fechaHasta.split('/');
         var date2 = new Date(splitDate2[2], splitDate2[1]-1, parseInt(splitDate2[0])+1);
         var epochHasta = (date2.getTime() - date2.getMilliseconds())/1000;

         var fechaCreada = {
            '$gte': epochDesde, 
            '$lte': epochHasta
        }

        justQuery.fechaCreada = extraQuery.fechaCreada = permisosQuery.fechaCreada =  cierresQuery.epoch = fechaCreada;  

    } else {
     var diaGte = new Date(),
     diaLt = new Date();
     diaGte.setHours(0);
     diaGte.setMinutes(1);
     diaGte.setSeconds(0);
     diaGte.setMilliseconds(0);
     epochDesde = (diaGte.getTime() - diaGte.getMilliseconds())/1000;
     epochHasta = (diaLt.getTime() - diaLt.getMilliseconds())/1000;
 }

 marcaQuery.epoch = {'$gte': epochDesde, '$lte': epochHasta};

 var titulo, estado;
 if(option[1] === 'reportes'){
     estado = {
        '$nin': ['Pendiente']
    }
    titulo = 'Reportes | SIGUCA';
} else {
 estado = 'Pendiente';
 titulo = 'Gestionar eventos | SIGUCA';
}
justQuery.estado = estado;
extraQuery.estado = estado;
permisosQuery.estado = estado;

Usuario.find({tipo:{'$nin': ['Administrador']}}).exec(function(error, usuarios) {
 Marca.find(marcaQuery).populate('usuario').exec(function(error, marcas) {
    Justificaciones.find(justQuery).populate('usuario').exec(function(error, justificaciones) {
       Solicitudes.find(extraQuery).populate('usuario').exec(function(error, extras) {
          Solicitudes.find(permisosQuery).populate('usuario').exec(function(error, permisos) {
             Usuario.find({_id:req.user.id},{_id:0,departamentos: 1}).populate('departamentos.departamento').exec(function(error, supervisor){
                Cierre.find(cierresQuery).populate('usuario').exec(function (err, cierres) { 

                   var array = [];
                   for(var y = 0; y < req.user.departamentos.length; y++){
                      array.push(req.user.departamentos[y].departamento);
                  }
                  var arrayUsuario = util.eventosAjuste(usuarios, req.user, 'reportes')
                  var arrayJust = util.eventosAjuste(justificaciones, req.user, 'reportes');
                  var arrayExtras = util.eventosAjuste(extras, req.user, 'reportes');
                  var arrayPermisos = util.eventosAjuste(permisos, req.user, 'reportes');
                  var arrayMarcas = util.eventosAjuste(marcas, req.user, 'reportes');
                  var arrayCierres = util.eventosAjuste(cierres, req.user, 'reportes');
                  var resumen = [];

                  var filtro = {
                      title: titulo,
                      usuario: req.user,
                      justificaciones: arrayJust,
                      extras: arrayExtras,
                      permisos: arrayPermisos,
                      usuarios: arrayUsuario,
                      departamentos: supervisor[0].departamentos,
                      todos: array,
                      marcas: arrayMarcas,
                      horasSemanales: cierres,
                      resumen: resumen
                  };				

                  if(usuarioId != 'todos'){
                      resumen = [{tipo:"Tardías", cantidad: 0},{tipo: "Ausencias", cantidad: 0},{tipo: "Vacaciones", cantidad: 0},{tipo:"Permisos",cantidad:0}];

                      for(var i = 0; i < justificaciones.length; i ++){ 
                         if(justificaciones[i].motivo == "Tardía"){
                            resumen[0].cantidad = resumen[0].cantidad + 1;
                        } else 	if(justificaciones[i].motivo == "Ausencia"){
                            resumen[1].cantidad = resumen[1].cantidad + 1;
                        }
                    }	
                    for(var i = 0; i < permisos.length; i ++){
                     if(permisos[i].motivo == "Vacaciones"){
                        resumen[2].cantidad = resumen[2].cantidad + 1;
                    }	
                }
                resumen[3].cantidad = permisos.length - resumen[2].cantidad;

                Usuario.find({'_id':usuarioId}).exec(function(error, usuario) {
                 if (error) return res.json(error);
                 filtro.empleado = usuario[0].apellido1 + ' ' + usuario[0].apellido2 + ', ' + usuario[0].nombre;
                 filtro.resumen = resumen;
                 return (option[1] === 'reportes') ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro); 
             });
            } else {
              filtro.empleado = 'Todos los usuarios';

              if (error) return res.json(error);
              return (option[1] === 'reportes') ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro); 
          }
                                    });//Cierres
                                });//Supervisor
                            });//Permisos
                        });//Extras
                    });//Justificaciones
                });//Marcas
            });//Usuarios 
			//
		} else {
			req.logout();
			res.redirect('/');
		} 
	},
    eventos : function (req, res) {
        var inicioMes = moment().date(1);
        if (req.session.name != "Administrador") {
            Marca.find({usuario: req.user.id, epoch: {'$gte' : inicioMes.unix()}}).exec(function(error, marcas) {
                Justificaciones.find({usuario: req.user.id}).exec(function(error, justificaciones) {
                    Solicitudes.find({usuario: req.user.id, tipoSolicitudes:'Extras'}).exec(function(error, extras) {
                        Solicitudes.find({usuario: req.user.id, tipoSolicitudes:'Permisos'}).exec(function(error, permisos) {

                            var supervisor = {departamentos: [1]};

                            var arrayMarcas = util.eventosAjuste(marcas,supervisor,"eventosEmpl");
                            var arrayJust = util.eventosAjuste(justificaciones,supervisor,"eventosEmpl");
                            var arrayExtras = util.eventosAjuste(extras,supervisor,"eventosEmpl");
                            var arrayPermisos = util.eventosAjuste(permisos,supervisor,"eventosEmpl");


                            if (error) return res.json(error);

                            return res.render('eventos', {
                                title: 'Solicitudes/Justificaciones | SIGUCA',
                                usuario: req.user,
                                justificaciones: arrayJust,
                                extras: arrayExtras,
                                permisos: arrayPermisos,
                                marcas: marcas
                            });
                        });
                        //
                    });
                    //
                });
                // 
            });
            //
        } else {
            req.logout();
            res.redirect('/');
        }
    },
    filtrarEventos : function (req, res) {
        if (req.session.name != "Administrador") {

            var marcaQuery = {usuario: req.user.id};
            var justQuery = {usuario: req.user.id};
            var extraQuery = {usuario: req.user.id, tipoSolicitudes:'Extras'};
            var permisosQuery = {usuario: req.user.id, tipoSolicitudes:'Permisos'};

            if(req.body.fechaDesde != '' && req.body.fechaHasta != ''){
                var splitDate1 = req.body.fechaDesde.split('/');
                var date1 = new Date(splitDate1[2], splitDate1[1]-1, splitDate1[0]);
                var epochDesde = (date1.getTime() - date1.getMilliseconds())/1000;

                var splitDate2 = req.body.fechaHasta.split('/');
                var date2 = new Date(splitDate2[2], splitDate2[1]-1, parseInt(splitDate2[0])+1);
                var epochHasta = (date2.getTime() - date2.getMilliseconds())/1000;

                var fechaCreada = {
                    "$gte": epochDesde, 
                    "$lt": epochHasta
                }

                marcaQuery.epoch = {"$gte": epochDesde, "$lt": epochHasta};
                justQuery.fechaCreada = fechaCreada;
                extraQuery.fechaCreada = fechaCreada;
                permisosQuery.fechaCreada = fechaCreada;  
            } 
            Marca.find(marcaQuery).exec(function(error, marcas) {
                Justificaciones.find(justQuery).exec(function(error, justificaciones) {
                    Solicitudes.find(extraQuery).exec(function(error, extras) {
                        Solicitudes.find(permisosQuery).exec(function(error, permisos) {

                            var supervisor = {departamentos: [1]};

                            var arrayMarcas = util.eventosAjuste(marcas,supervisor,"eventosEmpl");
                            var arrayJust = util.eventosAjuste(justificaciones,supervisor,"filtrarEventosEmpl");
                            var arrayExtras = util.eventosAjuste(extras,supervisor,"filtrarEventosEmpl");
                            var arrayPermisos = util.eventosAjuste(permisos,supervisor,"filtrarEventosEmpl");

                            if (error) return res.json(error);
                            return res.render('eventos', {
                                title: 'Solicitudes/Justificaciones | SIGUCA',
                                usuario: req.user,
                                justificaciones: arrayJust,
                                extras: arrayExtras,
                                permisos: arrayPermisos,
                                marcas: marcas
                            });//render
                        });//Permisos
                    });//Extras
                });//Justificaciones
                //
            });
            //
        } else {
            req.logout();
            res.redirect('/');
        }
    }
};
