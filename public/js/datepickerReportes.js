
    $('#datepicker input').datepicker({
        format: "dd/mm/yyyy",
        autoclose: true,
        language: "es",
        todayHighlight: true
    });

    $('#timepicker input').timepicker();

    $('.footable').footable();


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