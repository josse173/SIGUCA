
var moment = require('moment');
var Marca = require('../models/Marca');
var Usuario = require('../models/Usuario');
var Horario = require('../models/Horario');
var Departamento = require('../models/Departamento');
var Justificaciones = require('../models/Justificaciones');
var Solicitudes = require('../models/Solicitudes');
var Cierre = require('../models/Cierre');
var util = require('../util/util');
var CierrePersonal = require('../models/CierrePersonal');
var crudUsuario = require('../routes/crudUsuario');

module.exports = {
  filtrarEventos : function (req, res) {
    if (req.session.name == "Supervisor") { 
      var usuarioId;
      var option;
      if(req.body.filtro){
        option = req.body.filtro.split('|');  
        usuarioId = req.body.filtro.split('|')[0];
      }

      //**************************************************************************
      //Preparación de los queries para filtrar datos
      var queryEpoch = filtrarPorFecha(req);
      var titulo = getTitulo(req.route.path);
      var justQuery = {};
      var extraQuery = {tipoSolicitudes:'Extras'};
      var permisosQuery = {tipoSolicitudes:'Permisos'};
      //var cierresQuery = {};
      var marcaQuery = {};
      var cierreQuery = {};//{"usuarios.tiempo.horas":{"$gte":0}};
      var usuarioQuery = {tipo:{'$nin': ['Administrador', "Supervisor"]}};
      var populateQuery = {
        path: 'usuario'
      };

      if(req.body.filtro_departamento && req.body.filtro_departamento!="todos"){
        populateQuery.match = {departamentos:{$elemMatch:{departamento:req.body.filtro_departamento}}};
      }
      if(JSON.stringify(queryEpoch) !== JSON.stringify({})){
        cierreQuery.epoch = marcaQuery.epoch = justQuery.fechaCreada = extraQuery.fechaCreada = permisosQuery.fechaCreada =  queryEpoch;  
      }
      if(usuarioId && usuarioId != 'todos'){
        justQuery.usuario = extraQuery.usuario = permisosQuery.usuario = marcaQuery.usuario = usuarioId;
        cierreQuery.usuario = usuarioId;
      }
      justQuery.estado = extraQuery.estado = permisosQuery.estado = getEstado(titulo);

      crudUsuario.getById(usuarioId, function (err, usuario){
        var querrySupervisores = {
          _id:{
            "$ne":req.user.id
          },
          tipo:"Supervisor"
        };
        crudUsuario.get(querrySupervisores, function (err, supervisores){
          crudUsuario.getEmpleadoPorSupervisor(req.user.id, usuarioQuery, 
            function(error, usuarios, departamentos){
              if(!usuarioId || usuarioId == 'todos'){
                var queryUsers = {"$in":util.getIdsList(usuarios.concat(supervisores))};
                justQuery.usuario = extraQuery.usuario = permisosQuery.usuario = marcaQuery.usuario = queryUsers;
                /*cierreQuery.usuarios = {};
                cierreQuery.usuarios.usuario = queryUsers;*/
              }
              getInformacionRender(req, res, titulo, usuarios.concat(supervisores), departamentos, marcaQuery, 
                justQuery, extraQuery, permisosQuery, cierreQuery, populateQuery, 
                ((!err && usuario) ? (usuario.apellido1+" "+usuario.apellido2+", "+usuario.nombre) : null));
            });
        });
      });
} else {
      //
      req.logout();
      res.redirect('/');
    } 
  },

  //*************************************************************************************************************
  eventos : function (req, res) {
    //var inicioMes = moment().date(1);
    var epochMin = moment();
    epochMin.hours(0);
    epochMin.minutes(0);
    epochMin.seconds(0);
    if (req.session.name != "Administrador") {
      Marca.find({usuario: req.user.id, epoch: {'$gte' : epochMin.unix()}}).exec(function(error, marcas) {
        Justificaciones.find({usuario: req.user.id}).exec(function(error, justificaciones) {
          Solicitudes.find({usuario: req.user.id, tipoSolicitudes:'Extras'}).exec(function(error, extras) {
            Solicitudes.find({usuario: req.user.id, tipoSolicitudes:'Permisos'}).exec(function(error, permisos) {
              CierrePersonal.find({usuario:req.user.id, epoch: {'$gte' : epochMin.unix()}}, function (err, listaCierre) {
                var supervisor = {departamentos: [1]};

                var arrayMarcas = util.eventosAjuste(marcas,supervisor,"eventosEmpl");
                var arrayJust = util.eventosAjuste(justificaciones,supervisor,"eventosEmpl");
                var arrayExtras = util.eventosAjuste(extras,supervisor,"eventosEmpl");
                var arrayPermisos = util.eventosAjuste(permisos,supervisor,"eventosEmpl");

                arrayMarcas = util.unixTimeToRegularDate(arrayMarcas, true);
                arrayJust = util.unixTimeToRegularDate(arrayJust, true);
                arrayExtras = util.unixTimeToRegularDate(arrayExtras, true);
                arrayPermisos = util.unixTimeToRegularDate(arrayPermisos, true);
                listaCierre = util.unixTimeToRegularDate(listaCierre, true);

                if (error) return res.json(error);
                return res.render('eventos', {
                  title: 'Solicitudes/Justificaciones | SIGUCA',
                  usuario: req.user,
                  justificaciones: arrayJust,
                  extras: arrayExtras,
                  permisos: arrayPermisos,
                  cierreUsuarios: listaCierre,
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
      var cierreQuery = {usuario: req.user.id};
      var extraQuery = {usuario: req.user.id, tipoSolicitudes:'Extras', };
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

        marcaQuery.epoch = fechaCreada;
        justQuery.fechaCreada = fechaCreada;
        extraQuery.fechaCreada = fechaCreada;
        permisosQuery.fechaCreada = fechaCreada;
        cierreQuery.epoch = fechaCreada;
      } 
      Marca.find(marcaQuery).exec(function(error, marcas) {
        Justificaciones.find(justQuery).exec(function(error, justificaciones) {
          Solicitudes.find(extraQuery).exec(function(error, extras) {
            Solicitudes.find(permisosQuery).exec(function(error, permisos) {
              CierrePersonal.find(cierreQuery, function (err, listaCierre) {
                var supervisor = {departamentos: [1]};

                var arrayMarcas = util.eventosAjuste(marcas,supervisor,"eventosEmpl");
                var arrayJust = util.eventosAjuste(justificaciones,supervisor,"filtrarEventosEmpl");
                var arrayExtras = util.eventosAjuste(extras,supervisor,"filtrarEventosEmpl");
                var arrayPermisos = util.eventosAjuste(permisos,supervisor,"filtrarEventosEmpl");

                arrayMarcas = util.unixTimeToRegularDate(arrayMarcas, true);
                arrayJust = util.unixTimeToRegularDate(arrayJust, true);
                arrayExtras = util.unixTimeToRegularDate(arrayExtras, true);
                arrayPermisos = util.unixTimeToRegularDate(arrayPermisos, true);
                listaCierre = util.unixTimeToRegularDate(listaCierre, true);
                if (error) return res.json(error);
                return res.render('eventos', {
                  title: 'Solicitudes/Justificaciones | SIGUCA',
                  usuario: req.user,
                  justificaciones: arrayJust,
                  extras: arrayExtras,
                  permisos: arrayPermisos,
                  cierreUsuarios: listaCierre,
                  marcas: marcas
                });//render
              });//CierrePersonal
            });//Permisos
          });//Extras
        });//Justificaciones
      });//
      //
    } else {
      req.logout();
      res.redirect('/');
    }
  }
};

function getInformacionRender(req, res, titulo, usuarios, departamentos, 
  marcaQuery, justQuery, extraQuery, permisosQuery, cierreQuery, populateQuery, nombreUsuario){
  //Filtrar -departamento -usuario -fecha
  Marca.find(marcaQuery).populate(populateQuery).exec(function(error, marcas){
    Justificaciones.find(justQuery).populate(populateQuery).exec(function(error, justificaciones){
      Solicitudes.find(extraQuery).populate(populateQuery).exec(function(error, extras) {
        Solicitudes.find(permisosQuery).populate(populateQuery).exec(function(error, permisos) {
          if(req.route.path!=='/reportes'){
            return renderFiltro(res, titulo, req.user, departamentos, usuarios, marcas, 
              justificaciones, extras, permisos, null, nombreUsuario);
          }
          else {
            
            cierreQuery.usuario = { $in: usuarios };

            Departamento.findOne({_id: req.user.departamentos[0].departamento}).exec(function(error, departamentosList){
              Usuario.find({'departamentos.departamento' : departamentosList}).exec(function(error, usuarios) {
                CierrePersonal.find(cierreQuery).populate("usuario").exec(function(error, cierres) {
                
                return renderFiltro(res, titulo, req.user, departamentos, usuarios, marcas, 
                  justificaciones, extras, permisos, cierres, nombreUsuario);
                });
              });

            });//Fin Departamento
            
          }
        });//Solicitudes permisos
      });//Solicitudes horas extra
    });//Justificaciones
  });//Marcas
}


function renderFiltro(res, titulo, usuario, departamentos, 
  usuarios, marcas, justificaciones, extras, permisos, cierre, nombreUsuario){
  var cList = [];
  if(cierre){
    cList = util.unixTimeToRegularDate(cierre.filter(
      function(m){
        return m.usuario;
      }), true);
  }
    
  /*
  * Se hace el calculo de las horas trabajadas
  */
  var listaSumada = null;
  if(cierre){
    
    var listaSumada = new Array(),
    revisado = false;

    cierre.forEach(function(original) {
    //for(var i = 0; i < cierre.length;i++){

      revisado = false;
      for(var p = 0; p < listaSumada.length;p++){
        if(listaSumada[p].usuario.nombre == original.usuario.nombre){//Si existe lo suma
          //Suma el tiempo trabajado analizando que si esta en el minuto 59 debe sumar la hora
          
          listaSumada[p].tiempo.horas += original.tiempo.horas;
          if(listaSumada[p].tiempo.minutos == 59){
            listaSumada[p].tiempo.minutos = 0;
            listaSumada[p].tiempo.horas++;
          }
          else{
            listaSumada[p].tiempo.minutos += original.tiempo.minutos;
          }
          revisado = true;
        }
      }//Fin de la busqueda del elemento a analizar en la lista de elementos analizados

      //En caso de que no haya sido analizada antes se incerta
      if(!revisado){
        var cierreTem = new CierrePersonal();
        cierreTem.usuario = original.usuario;
        cierreTem.tiempo = original.tiempo;
        cierreTem.epoch = original.tiempo;

        listaSumada.push(cierreTem);
      }
    });//Se han analizado todos los elementos
  }//Se terminan de analizar los cierres


  var filtro = {
    title: titulo,
    usuario: usuario,
    marcas: util.unixTimeToRegularDate(marcas.filter(function(m){
      return m.usuario;
    }), true),
    justificaciones: util.unixTimeToRegularDate(justificaciones.filter(function(m){
      return m.usuario;
    }), true),
    extras: util.unixTimeToRegularDate(extras.filter(function(m){
      return m.usuario;
    }), true),
    permisos: util.unixTimeToRegularDate(permisos.filter(function(m){
      return m.usuario;
    }), true),
    cierreUsuarios: cList,
    usuarios: usuarios,
    departamentos: departamentos,
    nombreUsuario: nombreUsuario,
    horasEmpleado: listaSumada
  };
  return (titulo === 'Reportes | SIGUCA') ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro); 
}
//
function filtrarPorFecha(req){
  //Si el query es para un intervalo de fechas determinado, se agregan a las fechas en formato "unix"
  if(req.body.fechaDesde && req.body.fechaDesde != ''){
    var splitDate1 = req.body.fechaDesde.split('/');
    var date1 = new Date(splitDate1[2], splitDate1[1]-1, splitDate1[0]);
    var epochDesde = (date1.getTime() - date1.getMilliseconds())/1000;

    if(req.body.fechaHasta && req.body.fechaHasta != ''){
      var splitDate2 = req.body.fechaHasta.split('/');
      var date2 = new Date(splitDate2[2], splitDate2[1]-1, parseInt(splitDate2[0])+1);
      var epochHasta = (date2.getTime() - date2.getMilliseconds())/1000;
      return {
        '$gte': epochDesde, 
        '$lte': epochHasta
      }
    }
    return {
      '$gte': epochDesde
    }
  }
  var diaGte = new moment();
  diaGte.hours(0);
  diaGte.minutes(0);
  diaGte.seconds(0);
  diaGte.milliseconds(0);
  /*var epochDesde = (diaGte.getTime() - diaGte.getMilliseconds())/1000 - 86400*7;
  var epochHasta = (diaLt.getTime() - diaLt.getMilliseconds())/1000;*/
  
  
   //Si corresponde a las justificaciones envia todos los registros
  if(req.route.path!=='/reportes'){
    return {};
  }
  
  //Si es la vista de reportes solo envia los registros del día
  return {
    '$gte': diaGte.unix() //Se comenta para que traiga todos los elementos cuando no se indica rango de fechas
  };
  //return {};
  
}

function getTitulo(option){
  //Si es un reporte lo que se quiere, se buscan los que NO están pendientes
  if(option  === '/reportes'){
    return 'Reportes | SIGUCA';
  } 
  return 'Gestionar eventos | SIGUCA';
}

function getEstado(titulo){
  if(titulo=='Gestionar eventos | SIGUCA'){
    return "Pendiente";
  }
  return {
    "$nin": ["Pendiente", "Incompleto"]
  };
}
