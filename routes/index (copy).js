         
    Usuario.find({_id:req.user.id}).exec(function(error, supervisor){
        //console.log(supervisor);
        //, "departamentos.departamento":{'$in': supervisor.departamentos}
        var queryDeps = {$elemMatch: {dapartamento:{'$in': supervisor.departamentos}}};
        //{tipo:{'$nin': ['Administrador']}, _id:queryDeps}
        Usuario.find({tipo:{'$nin': ['Administrador']}}).exec(function(error, usuarios){
          //console.log(JSON.stringify(usuarios, null, 1));
          var depIds = [];
          for(depSup in supervisor[0].departamentos){
            if(supervisor[0].departamentos[depSup].departamento)
              depIds.push(supervisor[0].departamentos[depSup].departamento.toString());
          }
          var usersId = [];
          if(req.body.filtro_departamento && req.body.filtro_departamento!="todos"){
            usersId = util.filtrarDepartamentos(usuarios, [req.body.filtro_departamento]);
            //console.log([req.body.filtro_departamento]);
          }else{
            usersId = util.filtrarDepartamentos(usuarios, depIds);
            //console.log(depIds);
          }
          justQuery.usuario = extraQuery.usuario = permisosQuery.usuario = marcaQuery.usuario = cierresQuery.usuario = {"$in": usersId};

          //Si el query no es para todos, se agrega el id del usuario a los queries
          if(usuarioId && usuarioId != 'todos'){
            justQuery.usuario = extraQuery.usuario = permisosQuery.usuario = marcaQuery.usuario = cierresQuery.usuario = usuarioId;
          } 

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

                      //console.log(permisos);
                      var marc = util.unixTimeToRegularDate(marcas);
                      var just = util.unixTimeToRegularDate(justificaciones);
                      var ext = util.unixTimeToRegularDate(extras);
                      var perm = util.unixTimeToRegularDate(permisos);
                      var cier = util.unixTimeToRegularDate(cierres);

                      var resumen = [];
                      console.log(supervisor[0].departamentos);
                      console.log(departamentos);
                      var filtro = {
                        title: titulo,
                        usuario: req.user,
                        justificaciones: just,
                        extras: ext,
                        permisos: perm,
                        usuarios: usuarios_departamento,
                        departamentos: supervisor[0].departamentos,
                        departamentos_todos: departamentos,
                        todos: array,
                        marcas: marc,
                        horasSemanales: cier,
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
                          } else    if(justificaciones[i].motivo == "Ausencia"){
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
                          return (req.route.path === '/reportes') ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro); 
                          //return (option && option[1] === 'reportes') ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro); 
                        });
                      } else {
                        filtro.empleado = 'Todos los usuarios';
                        if (error) return res.json(error);
                        return (req.route.path === '/reportes') ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro); 
                        //return (option &&option[1] === 'reportes') ? res.render('reportes', filtro) : res.render('gestionarEventos', filtro); 
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