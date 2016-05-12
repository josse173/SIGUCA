
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
var crud = require('../routes/crud');
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
      var cierresQuery = {};
      var marcaQuery = {};
      var cierreQuery = {"tiempo.horas":{"$gte":0}};
      var usuarioQuery = {tipo:{'$nin': ['Administrador', 'Supervisor']}};
      var populateQuery = {
        path: 'usuario'
      };

      if(req.body.filtro_departamento && req.body.filtro_departamento!="todos"){
        populateQuery.match = {departamentos:{$elemMatch:{departamento:req.body.filtro_departamento}}};
      }
      if(JSON.stringify(queryEpoch) !== JSON.stringify({})){
        cierresQuery.epoch = marcaQuery.epoch = justQuery.fechaCreada = extraQuery.fechaCreada = permisosQuery.fechaCreada =  queryEpoch;  
      }
      if(usuarioId && usuarioId != 'todos'){
        cierresQuery.usuario = justQuery.usuario = extraQuery.usuario = permisosQuery.usuario = marcaQuery.usuario = usuarioId;
      }
      justQuery.estado = extraQuery.estado = permisosQuery.estado = getEstado(titulo);

      crudUsuario.getById(usuarioId, function (err, usuario){
        crudUsuario.getEmpleadoPorSupervisor(req.user.id, usuarioQuery, 
          function(error, usuarios, departamentos){
            if(!usuarioId || usuarioId == 'todos'){
              var queryUsers = {"$in":util.getIdsList(usuarios)};
              cierresQuery.usuario = justQuery.usuario = extraQuery.usuario = permisosQuery.usuario = marcaQuery.usuario = queryUsers;
            }
            getInformacionRender(req, res, titulo, usuarios, departamentos, marcaQuery, 
              justQuery, extraQuery, permisosQuery, cierreQuery, populateQuery, 
              ((!err && usuario) ? (usuario.apellido1+" "+usuario.apellido2+", "+usuario.nombre) : null));
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
              justificaciones, extras, permisos, nombreUsuario);
          }
          else {
            CierrePersonal.find(cierreQuery).populate(populateQuery).exec(function(error, cierres) {
              return renderFiltro(res, titulo, req.user, departamentos, usuarios, marcas, 
                justificaciones, extras, permisos, cierres, nombreUsuario);
            });
          }
        });//Solicitudes permisos
      });//Solicitudes horas extra
    });//Justificaciones
  });//Marcas
}


function renderFiltro(res, titulo, usuario, departamentos, 
  usuarios, marcas, justificaciones, extras, permisos, cierres, nombreUsuario){
  var resumen = [];
  if(cierres){
    cierres = util.unixTimeToRegularDate(cierres.filter(function(m){
      return m.usuario;
    }));
  }
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
    cierres: cierres,
    usuarios: usuarios,
    departamentos: departamentos,
    nombreUsuario: nombreUsuario
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
  return {
    '$gte': diaGte.unix()
  }
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
