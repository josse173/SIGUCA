 'use strict';

/*--------------------------------------------------------------------
    Inicialización de componentes
---------------------------------------------------------------------*/
    $('#datepicker input').datepicker({
        format: "dd/mm/yyyy",
        autoclose: true,
        language: "es",
        todayHighlight: true
    });

    $('#timepicker input').timepicker();

    $('.footable').footable();

    alertify.defaults.theme.ok = "btn btn-danger";
    alertify.defaults.theme.cancel = "btn btn-default";
    alertify.defaults.theme.input = "form-control";

/*--------------------------------------------------------------------
    Carga información a los modal
---------------------------------------------------------------------*/
    $('#selectMotivo').change(function (){
        if($('#selectMotivo').val() == 'otro') $("#motivoOtro").removeAttr('disabled');
        else $("#motivoOtro").attr('disabled','disabled');
    });

    $('#selectMotivoJust').change(function (){
        if($('#selectMotivoJust').val() == 'otro') $("#motivoOtroJust").removeAttr('disabled');
        else $("#motivoOtroJust").attr('disabled','disabled');
    });


    $("button[data-target=#editJust]").click( function() {
        var id = $(this).val();
        $('.formUpdateJust').attr('action', '/justificacion/'+id);
        $.get('/justificacion/edit/'+id, function( data ) {

            //$('#motivo').val(data.motivo);   
            var optionValues = [];

            $('#selectMotivoJust option').each(function() {
                optionValues.push($(this).val());
            });

            if(jQuery.inArray( data.motivo, optionValues ) == -1){
                $("#motivoOtroJust").removeAttr('disabled');
                $('#selectMotivoJust').val('otro');
                $('#motivoOtroJust').val(data.motivo);
            } else {
                $("#motivoOtroJust").attr('disabled','disabled');
                $('#selectMotivoJust').val(data.motivo);
            }

            $('#detalles').val(data.detalle);    
        });
    });

    $("button[data-target=#editExtra]").click( function() {
        var id = $(this).val();
        $('.formUpdateExtra').attr('action', '/extra/'+id);
        $.get('/solicitud/edit/'+id, function( data ) {
            $('#datepicker input').val(data.diaInicio);
            $('#timepicker input').timepicker('setTime', data.horaInicio);
            $('#timepicker1 input').timepicker('setTime', data.horaFinal);
            $('#cliente').val(data.cliente);
            $('#motivo').val(data.motivo);
        });
    });

    $("button[data-target=#editPermiso]").click( function() {
        var id = $(this).val();
        $('.formUpdatePermiso').attr('action', '/permiso/'+id);
        $.get('/solicitud/edit/'+id, function( data ) {
            $('#datepicker input').val(data.diaFinal);
            $('#diaInicio').val(data.diaInicio);
            $('#cantidadDias').val(data.cantidadDias);
            var optionValues = [];

            $('#selectMotivo option').each(function() {
                optionValues.push($(this).val());
            });

            if(jQuery.inArray( data.motivo, optionValues ) == -1){
                $("#motivoOtro").removeAttr('disabled');
                $('#selectMotivo').val('otro');
                $('#motivoOtro').val(data.motivo);
            } else {
                $("#motivoOtro").attr('disabled','disabled');
                $('#selectMotivo').val(data.motivo);
            }

            $('#detallePermiso').val(data.detalle); 
        });
    });

    $("button[data-target=#editDep]").click( function() {
        var id = $(this).val();
        $('.formUpdate').attr('action', '/departamento/'+id);

        $.get('/departamento/editDepartamento/'+id, function( data ) {
            $('#nombreDepa').val(data.nombre);            
        });
    });

    $("button[data-target=#editHorario]").click( function() {
        var id = $(this).val();
        $('.formUpdate').attr('action', '/horarioN/'+id);

        $.get('/horarioN/editHorario/'+id, function( data ) {
            $('#nombre').val(data.nombre);            
            $('#tipoJornada').val(data.tipo);            
            if(data.tipo == 'Libre'){
                $('#tipoJornada').prop('checked', true);
                $('#timepicker input').attr('disabled','disabled');
                $('#timepicker1 input').attr('disabled','disabled');
                $('#timepicker4').show();
                $('#rangoJornada').hide();
            }
            else{
                $('#tipoJornada').prop('checked', false);
                $('#timepicker input').removeAttr('disabled');
                $('#timepicker1 input').removeAttr('disabled');
                $('#rangoJornada').show();
                $('#timepicker4').hide();
            }
            $('#horaEntrada').val(data.horaEntrada);            
            $('#horaSalida').val(data.horaSalida);            
            $('#rangoJornada').text(data.rangoJornada);            
            $('#inputRango').val(data.rangoJornada); 
            $('#tiempoReceso').val(data.tiempoReceso); 
            $('#tiempoAlmuerzo').val(data.tiempoAlmuerzo); 
        });
    });

    $("button[data-target=#editEmpl]").click( function() {
        var id = $(this).val();
        $('.formUpdate').attr('action', '/empleado/'+id);

        $.get('/empleado/edit/'+id, function( data ) {
            $('#nombre').val(data.nombre);            
            $('#cedula').val(data.cedula);            
            $('#apellido1').val(data.apellido1);            
            $('#apellido2').val(data.apellido2);            
            $('#email').val(data.email);            
            $('#codTarjeta').val(data.codTarjeta);            
            $('#username').val(data.username);     
            $('#selectTipo').selectpicker('val', data.tipo);       
            $('#selectHorario').selectpicker('val', data.horario);       
            $('#selectDepartamentos').selectpicker('val', data.horario);    

            var val = [];
            for (var i = 0; i < data.departamentos.length; i++) {
                val.push(data.departamentos[i].departamento);
            }
            $('#selectDepartamentos').selectpicker('val', val);
            $('#selectDepartamentos').selectpicker('refresh');    
            $('#selectHorario').selectpicker('refresh');    
            $('#selectTipo').selectpicker('refresh');    

        });
    });


    $('.btnCancelar').click(function(){
        $('#selectMotivoJust').val("");
        $('#motivoOtroJust').val("");
        $('#detalles').val("");
        $('#datepicker input').val("");
        $('#timepicker input').timepicker('setTime', "");
        $('#timepicker1 input').timepicker('setTime', "");
        $('#motivo').val("");
        $('#diaInicio').val("");
        $('#cantidadDias').val("");
        $('#selectMotivo').val("");
        $('#motivoOtro').val("");
        $('#detallePermiso').val(""); 
    });

/*--------------------------------------------------------------------
    Notificaciones y gestión de eventos
---------------------------------------------------------------------*/

    $('.tableSolicitudes').footable().on('click', '.row-delete', function(e) {
        e.preventDefault();
        //get the footable object
        var footable = $('.tableSolicitudes').data('footable');

        //get the row we are wanting to delete
        var row = $(this).parents('tr:first');

        var id = $(this).val();
        var comentarioSupervisor = row.find('.comentarioSupervisor').val();
        var estado = row.find('.selectpicker').val();

        $.post('/getionarSolicitudAjax/'+id, {comentarioSupervisor: comentarioSupervisor, estado: estado}, function (data){
            if(data == 'Se elimino'){
                footable.removeRow(row);
            }
        });
    });

    $('.tableJustificaciones').footable().on('click', '.row-delete', function(e) {
        e.preventDefault();
        //get the footable object
        var footable = $('.tableJustificaciones').data('footable');

        //get the row we are wanting to delete
        var row = $(this).parents('tr:first');

        var id = $(this).val();
        var comentarioSupervisor = row.find('.comentarioSupervisor').val();
        var estado = row.find('.selectpicker').val();

        $.post('/getionarJustificacionAjax/'+id, {comentarioSupervisor: comentarioSupervisor, estado: estado}, function (data){
            if(data == 'Se elimino'){
                footable.removeRow(row);
            }
        });
    });

/*--------------------------------------------------------------------
    Notificaciones por alertify/correo y eliminación de eventos
---------------------------------------------------------------------*/
    $('.tableJustificaciones').footable().on('click', '.justificacionDelete', function(e) {
        var footable = $('.tableJustificaciones').data('footable');
        var row = $(this).parents('tr:first');

        var justificacion = $(this).val();
        var split = justificacion.split(',');
        alertify.dialog('confirm')
          .set({
            'labels':{ok:'Eliminar', cancel:'Cancelar'},
            'transition': 'slide',
            'message': '¿Está seguro de eliminar la justificación de <br/><strong>' +  split[0] + '</strong> creada el día <i><b> ' + split[2] + ' </b></i>?',
            'onok': function(){ 
                $.get('/justificacion/delete/'+split[1], function (data){
                    if(data == 'Se elimino'){
                        footable.removeRow(row);
                        alertify.message('Se eliminó la justificación de <strong>' +  split[0] + '</strong> con éxito');
                    } else {
                        alertify.error(data);
                    }
                });
            }
          }).show(); 
    });

    $('.tableSolicitudes').footable().on('click', '.solicitudDelete', function(e) {
        var footable = $('.tableSolicitudes').data('footable');
        var row = $(this).parents('tr:first');

        var solicitud = $(this).val();
        var split = solicitud.split(',');
        alertify.dialog('confirm')
          .set({
            'labels':{ok:'Eliminar', cancel:'Cancelar'},
            'transition': 'slide',
            'message': '¿Está seguro de eliminar la solicitud de <br/><strong>' +  split[0] + '</strong> creada el día <i><b> ' + split[2] + ' </b></i>?',
            'onok': function(){ 
                $.get('/solicitud/delete/'+split[1], function (data){
                    if(data == 'Se elimino'){
                        footable.removeRow(row);
                        alertify.message('Se eliminó la solicitud de <strong>' +  split[0] + '</strong> con éxito');
                    } else {
                        alertify.error(data);
                    }
                });
            }
          }).show(); 
    });

    $('.tableMarcas').footable().on('click', '.marcaDelete', function(e) {
        var footable = $('.tableMarcas').data('footable');
        var row = $(this).parents('tr:first');

        var marca = $(this).val();
        var split = marca.split(',');
        alertify.dialog('confirm')
          .set({
            'labels':{ok:'Eliminar', cancel:'Cancelar'},
            'transition': 'slide',
            'message': '¿Está seguro de eliminar la marca de <br/><strong>' +  split[0] + '</strong>?',
            'onok': function(){ 
                $.get('/marca/delete/'+split[1], function (data){
                   if(data == 'Se elimino'){
                        footable.removeRow(row);
                        alertify.message('Se eliminó la marca <strong>' +  split[0] + '</strong> con éxito');
                    } else {
                        alertify.error(data);
                    }
                });
            }
          }).show(); 
    });

/*--------------------------------------------------------------------
    Notificaciones y eliminación de departamentos/horarios/empleados
---------------------------------------------------------------------*/
    $('.tableDepartamento').footable().on('click', '.departamentoDelete', function(e) {
        var footable = $('.tableDepartamento').data('footable');
        var row = $(this).parents('tr:first');

        var departamento = $(this).val();
        var split = departamento.split(',');
        alertify.dialog('confirm')
          .set({
            'labels':{ok:'Eliminar', cancel:'Cancelar'},
            'transition': 'slide',
            'message': '¿Está seguro de eliminar el departamento de <strong>' +  split[0] + '</strong>?' ,
            'onok': function(){ 
                $.get('/departamento/delete/'+split[1], function (data){
                    if(data == 'Se elimino'){
                        footable.removeRow(row);
                        alertify.message('Se eliminó el departamento ' +  split[0] + ' con éxito');
                    } else {
                        alertify.error('No se puede eliminar el departamento <strong>' +  split[0] + '</strong>, ya que un empleado lo tiene asignado');
                    }
                });
            }
          }).show();        
    });

    $('.tableHorario').footable().on('click', '.horarioDelete', function(e) {
        var footable = $('.tableHorario').data('footable');
        var row = $(this).parents('tr:first');

        var horario = $(this).val();
        var split = horario.split(',');
        alertify.dialog('confirm')
          .set({
            'labels':{ok:'Eliminar', cancel:'Cancelar'},
            'transition': 'slide',
            'message': '¿Está seguro de eliminar el horario <strong>' +  split[0] + '</strong>?' ,
            'onok': function(){ 
                $.get('/horarioN/delete/'+split[1], function (data){
                    if(data == 'Se elimino'){
                        footable.removeRow(row);
                        alertify.message('Se eliminó el horario ' +  split[0] + ' con éxito');
                    } else {
                        alertify.error('No se puede eliminar el horario <strong>' +  split[0] + '</strong>, ya que un empleado lo tiene asignado');
                    }
                });
            }
          }).show();    
    });
        
    $('.tableEmpleado').footable().on('click', '.empleadoDelete', function(e) {
        var footable = $('.tableEmpleado').data('footable');
        var row = $(this).parents('tr:first');

        var empleado = $(this).val();
        var split = empleado.split(',');
        alertify.dialog('confirm')
          .set({
            'labels':{ok:'Eliminar', cancel:'Cancelar'},
            'transition': 'slide',
            'message': '¿Está seguro de <i>inactivar</i> al empleado(a) <strong>' +  split[0] + '</strong>?' ,
            'onok': function(){ 
                $.get('/empleado/delete/'+split[1], function (data){
                    if(data == 'Se elimino'){
                        footable.removeRow(row);
                        alertify.message('Se inactivo el empleado(a) <strong>' +  split[0] + '</strong> con éxito');
                    } else {
                        alertify.error(data);
                    }
                });
            }
          }).show();        
    });
