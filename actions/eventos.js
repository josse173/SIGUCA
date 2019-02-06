
var moment = require('moment');
var Marca = require('../models/Marca');
var Usuario = require('../models/Usuario');
var Horario = require('../models/Horario');
var HorarioEmpleado = require('../models/HorarioEmpleado');
var HorarioFijo = require('../models/HorarioFijo');
var Departamento = require('../models/Departamento');
var crudFeriado=require('../routes/crudFeriado');
var Justificaciones = require('../models/Justificaciones');
var Contenido = require('../models/Contenido');
var Solicitudes = require('../models/Solicitudes');
var Cierre = require('../models/Cierre');
var util = require('../util/util');
var CierrePersonal = require('../models/CierrePersonal');
var crudUsuario = require('../routes/crudUsuario');
var EventosTeletrabajo = require('../models/EventosTeletrabajo');
var HoraExtra = require('../models/HoraExtra');

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
      var titulo = getTitulo(req.route.path.substring(0, 9));
      var justQuery = {};
      var extraQuery = {tipoSolicitudes:'Extras'};
      var permisosQuery = {tipoSolicitudes:'Permisos'};
      //var cierresQuery = {};
      var marcaQuery = {};
      var cierreQuery = {};//{"usuarios.tiempo.horas":{"$gte":0}};
      var usuarioQuery = {estado:"Activo",tipo:{'$nin': ['Administrador', "Supervisor"]}};
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
      Marca.find({usuario: req.user.id, tipoUsuario: req.session.name, epoch: {'$gte' : epochMin.unix()}}).exec(function(error, marcas) {
        Justificaciones.find({usuario: req.user.id, tipoUsuario: req.session.name}).exec(function(error, justificaciones) {
          Solicitudes.find({usuario: req.user.id, tipoSolicitudes:'Extras'}).exec(function(error, extras) {
            Solicitudes.find({usuario: req.user.id, tipoSolicitudes:'Permisos'}).exec(function(error, permisos) {
              CierrePersonal.find({usuario:req.user.id, epoch: {'$gte' : epochMin.unix()}}, function (err, listaCierre) {
                HoraExtra.find({usuario:req.user.id}, function (error, horasExtra) {

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

                  //En caso de ser profesor no se pasan las justificaciones
                  if(req.user.tipo.length > 1 && req.session.name == config.empleadoProfesor){
                    arrayJust = new Array();
                    listaCierre = new Array();
                  }

                  //Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
                  req.user.tipo = req.session.name;
                  if (error) return res.json(error);
                  Contenido.find({seccion:"Eventos"},function(errorContenido,contenido){
                    return res.render('eventos', {
                      title: 'Solicitudes/Justificaciones | SIGUCA',
                      usuario: req.user,
                      justificaciones: arrayJust,
                      extras: arrayExtras,
                      permisos: arrayPermisos,
                      cierreUsuarios: listaCierre,
                      marcas: marcas,
                      textos:contenido,
                      horasExtra: horasExtra,
                      moment: require( 'moment' )
                    });
                  });
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

      var marcaQuery = {usuario: req.user.id, tipoUsuario: req.session.name};
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

                //En caso de ser profesor no se pasan las justificaciones
                if(req.user.tipo.length > 1 && req.session.name == config.empleadoProfesor){
                  arrayJust = new Array();
                  listaCierre =  new Array();
                }

                //Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
                req.user.tipo = req.session.name;

                if (error) return res.json(error);
                Contenido.find({seccion:"Eventos"},function(errorContenido,contenido){
                  return res.render('eventos', {
                    title: 'Solicitudes/Justificaciones | SIGUCA',
                    usuario: req.user,
                    justificaciones: arrayJust,
                    extras: arrayExtras,
                    permisos: arrayPermisos,
                    cierreUsuarios: listaCierre,
                    marcas: marcas,
                    textos:contenido
                  });//render
                });

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

    Justificaciones.find(justQuery).populate(populateQuery).exec(function(error, justificaciones){
      Solicitudes.find(extraQuery).populate(populateQuery).exec(function(error, extras) {
        Solicitudes.find(permisosQuery).populate(populateQuery).exec(function(error, permisos) {
          if(req.route.path.substring(0, 9) !=='/reportes'){
            //Se asigna el tipo de usuario con el cual ha iniciado sesion
            req.user.tipo = req.session.name;
            return renderFiltro(req, res, titulo, req.user, departamentos, usuarios, null,
              justificaciones, extras, permisos, null, nombreUsuario, null);
          }
          else {
            Marca.find(marcaQuery).populate(populateQuery).exec(function(error, marcas){

              var usuarioQueryFiltrado = {};
              //Si se realizo un filtrado por departamento
              if(req.body.filtro_departamento && req.body.filtro_departamento!="todos"){
                usuarioQueryFiltrado.departamentos = {$elemMatch:{departamento:{"$in":req.body.filtro_departamento}}};
              }

              Usuario.find(usuarioQueryFiltrado).exec(function(error, usuariosFiltradoDepartamento){
                //Si no se filtro por usuario se hace el filtrado por departamentos
                if(!cierreQuery.usuario && (!req.body.filtro_departamento || req.body.filtro_departamento=="todos")){
                  cierreQuery.usuario = { $in: usuarios };
                }else if(req.body.filtro_departamento && req.body.filtro_departamento!="todos"){
                  cierreQuery.usuario = {$in: usuariosFiltradoDepartamento};
                }

                CierrePersonal.find(cierreQuery).populate("usuario").exec(function(error, cierres) {
                      //Se asigna el tipo de usuario con el cual ha iniciado sesion
                      req.user.tipo = req.session.name;

                      EventosTeletrabajo.find(marcaQuery).exec(function(error, eventosTeletrabajo) {
                          return renderFiltro(req, res, titulo, req.user, departamentos, usuarios, marcas,
                            justificaciones, extras, permisos, cierres, nombreUsuario, eventosTeletrabajo);
                          });
                    });
              });//Fin usuarios filtrados por departamento

            });//Marcas
          }
        });//Solicitudes permisos
      });//Solicitudes horas extra
    });//Justificaciones
}


function renderFiltro(req, res, titulo, usuario, departamentos,
  usuarios, marcas, justificaciones, extras, permisos, cierre, nombreUsuario, eventosTeletrabajo){
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
        if(listaSumada[p].tipoUsuario == original.tipoUsuario
        && listaSumada[p].usuario._id==original.usuario._id){//Si existe lo suma
          //Suma el tiempo trabajado analizando que si esta en el minuto 59 debe sumar la hora

          listaSumada[p].tipoUsuario = original.tipoUsuario;
          listaSumada[p].tiempo.horas += original.tiempo.horas;
          listaSumada[p].tiempo.minutos += original.tiempo.minutos;

          if(listaSumada[p].tiempo.minutos > 59){
            listaSumada[p].tiempo.minutos = listaSumada[p].tiempo.minutos -60;
            listaSumada[p].tiempo.horas++;
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
        cierreTem.tipoUsuario=original.tipoUsuario;
        listaSumada.push(cierreTem);
      }
    });//Se han analizado todos los elementos
  }//Se terminan de analizar los cierres


  //Filtrado seleccionado por el usuario. En caso de que no se reciba, se usa por defecto marcas
  var filtrado = req.params.filtrado || 'marcas';

  //En caso de no recibir rango de fechas se pasa la fecha de hoy
  var fechaDesde, fechaHasta;

  var fecha = new Date();
  var dia = fecha.getDate();
  var mes = fecha.getMonth()+1;

  if(dia < 10)
    dia = "0" + dia;
  if(mes < 10)
    mes = "0" + mes;

  fechaDesde = dia + "/" + mes + "/" + fecha.getFullYear();
  fechaHasta = dia + "/" + mes + "/" + fecha.getFullYear();
  if(req.body.fechaDesde != "" && req.body.fechaDesde != null){
    fechaDesde = req.body.fechaDesde;
  }

  if(req.body.fechaHasta != "" && req.body.fechaHasta != null){
    fechaHasta = req.body.fechaHasta;
  }

  //Se declara el json en el que se envia la información a la vista
  var filtro = {
    title: titulo,
    usuario: usuario,
    usuarios: usuarios,//También se usa para mostrar las vacaciones
    departamentos: departamentos,
    nombreUsuario: nombreUsuario,
    filtradoReporte: filtrado,
    tipoReporte: filtrado,
    rangoFecha: {
      fechaDesde: fechaDesde,
      fechaHasta: fechaHasta
    },
    eventosTeletrabajo: eventosTeletrabajo,
    moment: require( 'moment' )
  };

  //Se especifica el valor por defecto de los select para filtrado por usuario
  if(req.body.filtro && req.body.filtro.split('|')[0] != 'todos'){
    filtro.filtroUsuario = req.body.filtro.split('|')[0];
  }

  //Se especifica el valor por defecto de los select para filtrado por departamento
  if(req.body.filtro_departamento && req.body.filtro_departamento!="todos"){
    filtro.filtroDepartamento = req.body.filtro_departamento;
  }

  //Si el filtrado es "marcas/tardia"
  if(filtrado && filtrado == "marcas" && req.route.path.substring(0, 9) =='/reportes'){
      filtro.marcas = util.unixTimeToRegularDate(marcas.filter(function(m){
          return m.usuario;
        }), true);
        ordenarTardias(filtro.marcas, function (arregloTardias){
          filtro.arregloTardias=arregloTardias;
        });

        marcasPorDias(filtro.marcas, function (marcasPorDia){
          filtro.marcasPorDia=marcasPorDia;
        });

  }

  console.log(req.route.path.substring(0, 9));
  //Si el filtrado es por vacaciones
  if(filtrado && filtrado == "vacaciones" && req.route.path.substring(0, 9) =='/reportes'){
    filtro.vacaciones = true;
  }

  //Si el filtrado es por horas
  if(filtrado && filtrado == "horas" || filtrado=="todosEventos" ){
    filtro.horasEmpleado = listaSumada;
    filtro.cierreUsuarios = cList;

  }

  //Si el filtrado es por justificaciones
  if(filtrado && filtrado == "justificaciones" || filtrado=="todosEventos"  ){
    filtro.justificaciones = util.unixTimeToRegularDate(justificaciones.filter(function(m){
      return m.usuario;
    }), true);
  }

  //Si el filtrado es por extras
  if(filtrado && filtrado == "extras"  || filtrado=="todosEventos" ){

    filtro.extras = util.unixTimeToRegularDate(extras.filter(function(m){
      return m.usuario;
    }), true);

    filtro.permisos = util.unixTimeToRegularDate(permisos.filter(function(m){
      return m.usuario;
    }), true);
  }

  if(filtrado && filtrado == "Feriados" && req.route.path.substring(0, 9) =='/reportes'){
      crudFeriado.listaFeriados(function (feriados){
        filtro.feriado=feriados;
      });

  }

  //|| filtrado=== "extras" || filtrado=== "justificaciones"
  console.log(filtrado);
  if(filtrado==="todosEventos" || req.route.path.substring(0, 9) =='/gestiona'){
    Contenido.find({seccion:"todosEventos"},function(error,contenido){
      if(!error &&contenido.length>0){
        filtro.textos=contenido;
        return (titulo === 'Reportes | SIGUCA') ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro);
      }
    });
  }else{
    Contenido.find({seccion:"Reportes"},function(error,contenido){
      if(!error &&contenido.length>0){
        filtro.textos=contenido;
        return (titulo === 'Reportes | SIGUCA') ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro);
      }
    });
  }

  //return (titulo === 'Reportes | SIGUCA') ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro);
}



function marcasPorDias(marcas,cb){
  var primeraVez=0;
  var entro=false;
  var ordenadas=new Array();
  var temporal = new Array();
  for (var i = 0; i <marcas.length; i++){
    if (primeraVez==0){
        var objMarcas = new Object();
        objMarcas.nombre=marcas[i].usuario.nombre;
        objMarcas.dia=marcas[i].fecha.dia;
        objMarcas.mes=marcas[i].fecha.mes;
        objMarcas.año=marcas[i].fecha.año;
        objMarcas.apellido1=marcas[i].usuario.apellido1;
        objMarcas.tipoUsuario=marcas[i].tipoUsuario;
        temporal.push(objMarcas);
        primeraVez++ ;
    }else{


      for (var j = 0; j <temporal.length; j++){
        entro=false;;
        if (temporal[j].nombre==marcas[i].usuario.nombre &&
          temporal[j].apellido1==marcas[i].usuario.apellido1 && temporal[j].dia==marcas[i].fecha.dia
          && temporal[j].mes==marcas[i].fecha.mes  && temporal[j].año==marcas[i].fecha.año
        &&temporal[j].tipoUsuario==marcas[i].tipoUsuario){
          entro=true;
          j=temporal.length;
        }
      }

      if(entro==false){
        var objMarcas = new Object();
        objMarcas.nombre=marcas[i].usuario.nombre;
        objMarcas.dia=marcas[i].fecha.dia;
        objMarcas.mes=marcas[i].fecha.mes;
        objMarcas.año=marcas[i].fecha.año;
        objMarcas.apellido1=marcas[i].usuario.apellido1;
        objMarcas.tipoUsuario=marcas[i].tipoUsuario;
        temporal.push(objMarcas);
      }
    }
  }


  for(var r=0; r<temporal.length;r++){
    var marcasOrdenadas = new Object();
    for(var m=0;m<marcas.length;m++){
      if (temporal[r].nombre==marcas[m].usuario.nombre &&
         temporal[r].apellido1==marcas[m].usuario.apellido1 && temporal[r].dia==marcas[m].fecha.dia
         && temporal[r].mes==marcas[m].fecha.mes && temporal[r].año==marcas[m].fecha.año
         && marcas[m].tipoMarca=="Entrada" && temporal[r].tipoUsuario==marcas[m].tipoUsuario){

        marcasOrdenadas.nombre=marcas[m].usuario.nombre;
        marcasOrdenadas.tipoUsuario=marcas[m].tipoUsuario;
        marcasOrdenadas.apellido1=marcas[m].usuario.apellido1;
        marcasOrdenadas.entrada=marcas[m].fecha.str;

      }else if (temporal[r].nombre==marcas[m].usuario.nombre &&
        temporal[r].apellido1==marcas[m].usuario.apellido1 && temporal[r].dia==marcas[m].fecha.dia
         && temporal[r].mes==marcas[m].fecha.mes && temporal[r].año==marcas[m].fecha.año
         && marcas[m].tipoMarca=="Salida" && temporal[r].tipoUsuario==marcas[m].tipoUsuario){
        marcasOrdenadas.salida=marcas[m].fecha.str;
      }
      else if (temporal[r].nombre==marcas[m].usuario.nombre && temporal[r].apellido1==
        marcas[m].usuario.apellido1 && temporal[r].dia==marcas[m].fecha.dia &&
        temporal[r].mes==marcas[m].fecha.mes && temporal[r].año==marcas[m].fecha.año
        && marcas[m].tipoMarca=="Salida a Receso" && temporal[r].tipoUsuario==marcas[m].tipoUsuario){

        marcasOrdenadas.salidaReceso=marcas[m].fecha.str;

      }else if (temporal[r].nombre==marcas[m].usuario.nombre &&
        temporal[r].apellido1==marcas[m].usuario.apellido1 && temporal[r].dia==marcas[m].fecha.dia
        && temporal[r].mes==marcas[m].fecha.mes && temporal[r].año==marcas[m].fecha.año
        && marcas[m].tipoMarca=="Entrada de Receso" && temporal[r].tipoUsuario==marcas[m].tipoUsuario){
        marcasOrdenadas.entradaReceso=marcas[m].fecha.str;

      }else if (temporal[r].nombre==marcas[m].usuario.nombre &&
        temporal[r].apellido1==marcas[m].usuario.apellido1 && temporal[r].dia==marcas[m].fecha.dia
        && temporal[r].mes==marcas[m].fecha.mes && temporal[r].año==marcas[m].fecha.año
        && marcas[m].tipoMarca=="Salida al Almuerzo" && temporal[r].tipoUsuario==marcas[m].tipoUsuario){
        marcasOrdenadas.salidaAlmuerzo=marcas[m].fecha.str;
      }
      else if (temporal[r].nombre==marcas[m].usuario.nombre && temporal[r].apellido1==marcas[m].usuario.apellido1
         && temporal[r].dia==marcas[m].fecha.dia && temporal[r].mes==marcas[m].fecha.mes &&
         temporal[r].año==marcas[m].fecha.año && marcas[m].tipoMarca=="Entrada de Almuerzo"
         && temporal[r].tipoUsuario==marcas[m].tipoUsuario){
        marcasOrdenadas.entradaAlmuerzo=marcas[m].fecha.str;
      }
    }
    ordenadas.push(marcasOrdenadas) ;
  }
  cb(ordenadas);



}

function ordenarTardias(marcas, cb){


  var temporal =new Array();
  var hEmpleado=0;
  for(var x=0;x<marcas.length;x++){

    if(marcas[x].tipoMarca=="Entrada" && marcas[x].usuario.horarioEmpleado){
      var obj=new Object();
      obj._id=marcas[x].usuario.horarioEmpleado;
      temporal.push(obj);
      hEmpleado++;
    }else if(marcas[x].tipoMarca=="Entrada" && marcas[x].usuario.horarioFijo){
      var obj=new Object();
      obj._id=marcas[x].usuario.horarioFijo;
      temporal.push(obj);
      hEmpleado++;
    }
  }

  if(hEmpleado>0){
    var arregloTardias=new Array();
    HorarioEmpleado.find({_id: {$in:temporal}}, function(err,horarioEmpleado){
      if(horarioEmpleado) {

        for(var p=0;p<marcas.length;p++){
          var obj=new Object();
          for(var x=0;x<horarioEmpleado.length;x++){
            if(marcas[p].usuario.horarioEmpleado){


              if(marcas[p].tipoMarca=="Entrada" && marcas[p].usuario.horarioEmpleado.equals(horarioEmpleado[x]._id) ){

                if(marcas[p].fecha.dia=="Lunes"){

                  if(parseInt(horarioEmpleado[x].lunes.entrada.hora)!=0){
                    if(parseInt(String(marcas[p].fecha.hora).substr(0,2))>parseInt(horarioEmpleado[x].lunes.entrada.hora)
                    ||(parseInt(String(marcas[p].fecha.hora).substr(0,2))==parseInt(horarioEmpleado[x].lunes.entrada.hora)&&
                    parseInt(String(marcas[p].fecha.hora).substr(3,2))>parseInt(horarioEmpleado[x].lunes.entrada.minutos)
                  ))
                  {
                    obj.fecha=marcas[p].fecha.str;
                    obj.nombre=marcas[p].usuario.nombre;
                    obj.apellido=marcas[p].usuario.apellido1;
                    obj.horarioMinutos=horarioEmpleado[x].lunes.entrada.minutos;
                    obj.horarioHora=horarioEmpleado[x].lunes.entrada.hora;
                    obj.tipoUsuario=marcas[p].tipoUsuario;

                    }
                  }

                }else if(marcas[p].fecha.dia=="Martes"){
                  if(parseInt(horarioEmpleado[x].martes.entrada.hora)!=0){
                    if(parseInt(String(marcas[p].fecha.hora).substr(0,2))>parseInt(horarioEmpleado[x].martes.entrada.hora)
                    ||(parseInt(String(marcas[p].fecha.hora).substr(0,2))==parseInt(horarioEmpleado[x].martes.entrada.hora)&&
                    parseInt(String(marcas[p].fecha.hora).substr(3,2))>parseInt(horarioEmpleado[x].martes.entrada.minutos)
                  ))
                  {
                    obj.fecha=marcas[p].fecha.str;
                    obj.nombre=marcas[p].usuario.nombre;
                    obj.apellido=marcas[p].usuario.apellido1;
                    obj.horarioMinutos=horarioEmpleado[x].martes.entrada.minutos;
                    obj.horarioHora=horarioEmpleado[x].martes.entrada.hora;
                    obj.tipoUsuario=marcas[p].tipoUsuario;

                  }
                  }


                }
                else if(marcas[p].fecha.dia=="Miércoles"){
                  if(parseInt(horarioEmpleado[x].miercoles.entrada.hora)!=0){
                    if(parseInt(String(marcas[p].fecha.hora).substr(0,2))>parseInt(horarioEmpleado[x].miercoles.entrada.hora)
                    ||(parseInt(String(marcas[p].fecha.hora).substr(0,2))==parseInt(horarioEmpleado[x].miercoles.entrada.hora)&&
                    parseInt(String(marcas[p].fecha.hora).substr(3,2))>parseInt(horarioEmpleado[x].miercoles.entrada.minutos)
                  ))
                  {
                    obj.fecha=marcas[p].fecha.str;
                    obj.nombre=marcas[p].usuario.nombre;
                    obj.apellido=marcas[p].usuario.apellido1;
                    obj.horarioMinutos=horarioEmpleado[x].miercoles.entrada.minutos;
                    obj.horarioHora=horarioEmpleado[x].miercoles.entrada.hora;
                    obj.tipoUsuario=marcas[p].tipoUsuario;
                  }
                  }


                }
                else if(marcas[p].fecha.dia=="Jueves"){
                  if(parseInt(horarioEmpleado[x].jueves.entrada.hora)!=0){
                    if(parseInt(String(marcas[p].fecha.hora).substr(0,2))>parseInt(horarioEmpleado[x].jueves.entrada.hora)
                    ||(parseInt(String(marcas[p].fecha.hora).substr(0,2))==parseInt(horarioEmpleado[x].jueves.entrada.hora)&&
                    parseInt(String(marcas[p].fecha.hora).substr(3,2))>parseInt(horarioEmpleado[x].jueves.entrada.minutos)
                  ))
                  {
                    obj.fecha=marcas[p].fecha.str;
                    obj.nombre=marcas[p].usuario.nombre;
                    obj.apellido=marcas[p].usuario.apellido1;
                    obj.horarioMinutos=horarioEmpleado[x].jueves.entrada.minutos;
                    obj.horarioHora=horarioEmpleado[x].jueves.entrada.hora;
                    obj.tipoUsuario=marcas[p].tipoUsuario;
                  }
                  }

                }
                else if(marcas[p].fecha.dia=="Viernes"){
                  if(parseInt(horarioEmpleado[x].viernes.entrada.hora)!=0){
                    if(parseInt(String(marcas[p].fecha.hora).substr(0,2))>parseInt(horarioEmpleado[x].viernes.entrada.hora)
                    ||(parseInt(String(marcas[p].fecha.hora).substr(0,2))==parseInt(horarioEmpleado[x].viernes.entrada.hora)&&
                    parseInt(String(marcas[p].fecha.hora).substr(3,2))>parseInt(horarioEmpleado[x].viernes.entrada.minutos)
                  ))
                  {

                    obj.fecha=marcas[p].fecha.str;
                    obj.nombre=marcas[p].usuario.nombre;
                    obj.apellido=marcas[p].usuario.apellido1;
                    obj.horarioMinutos=horarioEmpleado[x].viernes.entrada.minutos;
                    obj.horarioHora=horarioEmpleado[x].viernes.entrada.hora;
                    obj.tipoUsuario=marcas[p].tipoUsuario;
                  }
                  }

                }
                else if(marcas[p].fecha.dia=="Sábado"){
                  if(parseInt(horarioEmpleado[x].sabado.entrada.hora)!=0){
                    if(parseInt(String(marcas[p].fecha.hora).substr(0,2))>parseInt(horarioEmpleado[x].sabado.entrada.hora)
                    ||(parseInt(String(marcas[p].fecha.hora).substr(0,2))==parseInt(horarioEmpleado[x].sabado.entrada.hora)&&
                    parseInt(String(marcas[p].fecha.hora).substr(3,2))>parseInt(horarioEmpleado[x].sabado.entrada.minutos)
                  ))
                  {
                    obj.fecha=marcas[p].fecha.str;
                    obj.nombre=marcas[p].usuario.nombre;
                    obj.apellido=marcas[p].usuario.apellido1;
                    obj.horarioMinutos=horarioEmpleado[x].sabado.entrada.minutos;
                    obj.horarioHora=horarioEmpleado[x].sabado.entrada.hora;
                    obj.tipoUsuario=marcas[p].tipoUsuario;

                    }
                  }

                }
                else if(marcas[p].fecha.dia=="Domingo"){

                  if(parseInt(horarioEmpleado[x].domingo.entrada.hora)!=0){
                    if(parseInt(String(marcas[p].fecha.hora).substr(0,2))>parseInt(horarioEmpleado[x].domingo.entrada.hora)
                    ||(parseInt(String(marcas[p].fecha.hora).substr(0,2))==parseInt(horarioEmpleado[x].domingo.entrada.hora)&&
                    parseInt(String(marcas[p].fecha.hora).substr(3,2))>parseInt(horarioEmpleado[x].domingo.entrada.minutos)
                  ))
                  {
                    obj.fecha=marcas[p].fecha.str;
                    obj.nombre=marcas[p].usuario.nombre;
                    obj.apellido=marcas[p].usuario.apellido1;
                    obj.horarioMinutos=horarioEmpleado[x].domingo.entrada.minutos;
                    obj.horarioHora=horarioEmpleado[x].domingo.entrada.hora;
                    obj.tipoUsuario=marcas[p].tipoUsuario;
                  }
                  }

                }

              }
            }//fin del if que pregunta si tiene un horario
          }
          if(obj.fecha){
            arregloTardias.push(obj);
          }
        }

      }

  });
  HorarioFijo.find({_id: {$in:temporal}}, function(err,horarioFijo){

    if(horarioFijo){

      for(var i=0;i<marcas.length;i++){
        var obj=new Object();

        for(var j=0;j<horarioFijo.length;j++){

          if( marcas[i].usuario.horarioFijo){
            if(marcas[i].tipoMarca=="Entrada" && marcas[i].usuario.horarioFijo.equals(horarioFijo[j]._id) ){


              if(marcas[i].fecha.dia=="Sábado"){
                marcas[i].fecha.dia="Sabado";
              }else if(marcas[i].fecha.dia=="Miércoles"){
                marcas[i].fecha.dia="Miercoles";
              }
              if(horarioFijo[j].Domingo==marcas[i].fecha.dia){
                obj.fecha=marcas[i].fecha.str;
                obj.nombre=marcas[i].usuario.nombre;
                obj.apellido=marcas[i].usuario.apellido1;
                obj.horarioMinutos=parseInt(String(horarioFijo[j].horaEntrada).substr(3,2));
                obj.horarioHora=parseInt(String(horarioFijo[j].horaEntrada).substr(0,2));
                obj.tipoUsuario=marcas[i].tipoUsuario;
              }else if(horarioFijo[j].Lunes==marcas[i].fecha.dia){
                obj.fecha=marcas[i].fecha.str;
                obj.nombre=marcas[i].usuario.nombre;
                obj.apellido=marcas[i].usuario.apellido1;
                obj.horarioMinutos=parseInt(String(horarioFijo[j].horaEntrada).substr(3,2));
                obj.horarioHora=parseInt(String(horarioFijo[j].horaEntrada).substr(0,2));
                obj.tipoUsuario=marcas[i].tipoUsuario;

              }else if(horarioFijo[j].Martes==marcas[i].fecha.dia){
                obj.fecha=marcas[i].fecha.str;
                obj.nombre=marcas[i].usuario.nombre;
                obj.apellido=marcas[i].usuario.apellido1;
                obj.horarioMinutos=parseInt(String(horarioFijo[j].horaEntrada).substr(3,2));
                obj.horarioHora=parseInt(String(horarioFijo[j].horaEntrada).substr(0,2));
                obj.tipoUsuario=marcas[i].tipoUsuario;

              }else if(horarioFijo[j].Miercoles==marcas[i].fecha.dia){
                obj.fecha=marcas[i].fecha.str;
                obj.nombre=marcas[i].usuario.nombre;
                obj.apellido=marcas[i].usuario.apellido1;
                obj.horarioMinutos=parseInt(String(horarioFijo[j].horaEntrada).substr(3,2));
                obj.horarioHora=parseInt(String(horarioFijo[j].horaEntrada).substr(0,2));
                obj.tipoUsuario=marcas[i].tipoUsuario;

              }
              else if(horarioFijo[j].Jueves==marcas[i].fecha.dia){
                obj.fecha=marcas[i].fecha.str;
                obj.nombre=marcas[i].usuario.nombre;
                obj.apellido=marcas[i].usuario.apellido1;
                obj.horarioMinutos=parseInt(String(horarioFijo[j].horaEntrada).substr(3,2));
                obj.horarioHora=parseInt(String(horarioFijo[j].horaEntrada).substr(0,2));
                obj.tipoUsuario=marcas[i].tipoUsuario;

              }
              else if(horarioFijo[j].Viernes==marcas[i].fecha.dia){
                obj.fecha=marcas[i].fecha.str;
                obj.nombre=marcas[i].usuario.nombre;
                obj.apellido=marcas[i].usuario.apellido1;
                obj.horarioMinutos=parseInt(String(horarioFijo[j].horaEntrada).substr(3,2));
                obj.horarioHora=parseInt(String(horarioFijo[j].horaEntrada).substr(0,2));
                obj.tipoUsuario=marcas[i].tipoUsuario;

              }else if(horarioFijo[j].Sabado==marcas[i].fecha.dia){
                obj.fecha=marcas[i].fecha.str;
                obj.nombre=marcas[i].usuario.nombre;
                obj.apellido=marcas[i].usuario.apellido1;
                obj.horarioMinutos=parseInt(String(horarioFijo[j].horaEntrada).substr(3,2));
                obj.horarioHora=parseInt(String(horarioFijo[j].horaEntrada).substr(0,2));
                obj.tipoUsuario=marcas[i].tipoUsuario;

              }
            }
          }//fin del if que pregunta si tiene horario fijo

        }
        if(obj.fecha){
          arregloTardias.push(obj);

        }

      }
    }

    cb(arregloTardias);

  });


 cb(arregloTardias);


  }

}





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

  if(req.route.path.substring(0, 9) !=='/reportes'){
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
