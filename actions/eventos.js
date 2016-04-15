
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
 filtrarEventos : function (req, res) {
  if (req.session.name == "Supervisor") { 
    var usuarios = req.body.filtro;
    var option;
    var usuarioId;

    if(req.body.filtro){
      option= usuarios.split('|');
      usuarioId = option[0];
    }
    //Queries que se adaptan a la solicitud del filtro de eventos
    var justQuery = {};
    var extraQuery = {tipoSolicitudes:'Extras'};
    var permisosQuery = {tipoSolicitudes:'Permisos'};
    var marcaQuery = {};
    var cierresQuery = {tipo: 'Personal'};

    

    //Si el query es para un intervalo de fechas determinado, se agregan a las fechas en formato "unix"
    var epochDesde, epochHasta;
    if(req.body.fechaDesde && req.body.fechaDesde != ''){
        //
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
        //
      } 
      if(req.body.fechaDesde &&req.body.fechaDesde && req.body.fechaHasta != '' && req.body.fechaHasta != ''){
          //
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

          marcaQuery.epoch = justQuery.fechaCreada = extraQuery.fechaCreada = permisosQuery.fechaCreada =  cierresQuery.epoch = fechaCreada;  
        //
      } 
      //Si el query no es para un intervalo de fechas determinado, se agrega la fecha actual a los queries en formato "unix"
      //El query debería servir solo para el día actual
      else {
          //
          var diaGte = new Date(),
          diaLt = new Date();
          diaGte.setHours(0);
          diaGte.setMinutes(1);
          diaGte.setSeconds(0);
          diaGte.setMilliseconds(0);
          epochDesde = (diaGte.getTime() - diaGte.getMilliseconds())/1000;
          epochHasta = (diaLt.getTime() - diaLt.getMilliseconds())/1000;
        //
      }

      //marcaQuery.epoch = {'$gte': epochDesde, '$lte': epochHasta};

      //Si es un reporte lo que se quiere, se buscan los que NO están pendientes
      var titulo, estado;
      if(option && option[1] === 'reportes'){
        estado = {'$  ': ['Pendiente']};
        titulo = 'Reportes | SIGUCA';
      } 
      //Si no es un reporte lo que se quiere, se buscan los que están pendientes
      else {
        estado = 'Pendiente';
        titulo = 'Gestionar eventos | SIGUCA';
      }
      justQuery.estado = estado;
      extraQuery.estado = estado;
      permisosQuery.estado = estado;

      Usuario.find({_id:req.user.id}).exec(function(error, supervisor){

        Usuario.find({tipo:{'$nin': ['Administrador']}}).exec(function(error, usuarios) {
          var depIds = [];
          for(depSup in supervisor[0].departamentos){
            if(supervisor[0].departamentos[depSup].departamento)
              depIds.push(supervisor[0].departamentos[depSup].departamento.toString());
          }
          var usersId = [];
          if(req.body.filtro_departamento && req.body.filtro_departamento!="todos"){
            usersId = util.filtrarDepartamentos(usuarios, [req.body.filtro_departamento]);
            console.log([req.body.filtro_departamento]);
          }else{
            usersId = util.filtrarDepartamentos(usuarios, depIds);
            console.log(depIds);
          }
          justQuery.usuario = extraQuery.usuario = permisosQuery.usuario = marcaQuery.usuario = cierresQuery.usuario = {"$in": usersId};

          //Si el query no es para todos, se agrega el id del usuario a los queries
          if(usuarioId && usuarioId != 'todos'){
            justQuery.usuario = extraQuery.usuario = permisosQuery.usuario = marcaQuery.usuario = cierresQuery.usuario = usuarioId;
          } 

          //console.log(justQuery);

          Marca.find(marcaQuery).populate('usuario').exec(function(error, marcas) {

            Justificaciones.find(justQuery).populate('usuario').exec(function(error, justificaciones) {

             Solicitudes.find(extraQuery).populate('usuario').exec(function(error, extras) {

               Solicitudes.find(permisosQuery).populate('usuario').exec(function(error, permisos) {

                 Cierre.find(cierresQuery).populate('usuario').exec(function (err, cierres) { 

                  Departamento.find({_id:{"$in":depIds}}).populate('usuario').exec(function (err, departamentos) {

                    Usuario.find({_id:{'$in': usersId}}).exec(function(error, usuarios_departamento) {
                      //
                      var array = [];
                      for(var y = 0; y < req.user.departamentos.length; y++){
                        array.push(req.user.departamentos[y].departamento);
                      }
                      var just = util.unixTimeToRegularDate(justificaciones);
                      var resumen = [];

                      var filtro = {
                        title: titulo,
                        usuario: req.user,
                        justificaciones: just,
                        extras: extras,
                        permisos: permisos,
                        usuarios: usuarios,
                        departamentos: supervisor[0].departamentos,
                        departamentos_todos: departamentos,
                        todos: array,
                        marcas: marcas,
                        horasSemanales: cierres,
                        resumen: resumen
                      };				

                      if(usuarioId != 'todos'){
                        //
                        resumen = [
                        {tipo:"Tardías", cantidad: 0},
                        {tipo: "Ausencias", cantidad: 0},
                        {tipo: "Vacaciones", cantidad: 0},
                        {tipo:"Permisos",cantidad:0}
                        ];

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
                          if(usuario[0]){
                            filtro.empleado = usuario[0].apellido1 + ' ' + usuario[0].apellido2 + ', ' + usuario[0].nombre;
                          }
                          filtro.resumen = resumen;
                          return (option && option[1] === 'reportes') ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro); 
                        });
                      } else {
                        filtro.empleado = 'Todos los usuarios';
                        if (error) return res.json(error);
                        return (option &&option[1] === 'reportes') ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro); 
                      }
                      });//Usuario
                    });//Departamentos
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

   //*************************************************************************************************************
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
        filtrarEventosEmpl : function (req, res) {
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
