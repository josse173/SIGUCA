
    $('#datepicker input').datepicker({
        format: "dd/mm/yyyy",
        daysOfWeekDisabled: "0",
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