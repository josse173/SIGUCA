 'use strict';

/*--------------------------------------------------------------------
    Inicialización de componentes
    ---------------------------------------------------------------------*/
    // $('#datepicker input').datepicker({
    //     format: "dd/mm/yyyy",
    //     autoclose: true,
    //     language: "es",
    //     todayHighlight: true
    // });

    // $('#timepicker input').timepicker();

//Muestra el modal "justificaciones" al cargar la pagina, validando que haya más de una justificación.

var contador=0;

$(".justificarMasaUsuario").click(function(){
    
       var cantidadCheck=document.getElementsByClassName("justificarMasaUsuario");
       var contador=0;
       for(var i=0;i<cantidadCheck.length;i++){
           if( cantidadCheck[i].checked) {
               contador++;
           }
       }
   
       if(contador>0){
           $("#detalleJustificacionMasa").css('display','block');
           $("#botonJustificacionMasa").css('display','block');
         
       }else{
           $("#detalleJustificacionMasa").css('display','none');
           $("#botonJustificacionMasa").css('display','none');
       
       }
   
   });

$("#botonJustificacionMasa").click(function() {
    var detalle=document.getElementsByClassName("detalleJustificacionMasa");
    var arrayCheck=document.getElementsByClassName("justificarMasaUsuario");
    var arrayOrdenado=new Array();
    for(var i=0;i<arrayCheck.length;i++){
        if( arrayCheck[i].checked) {
            var obj=new Object();
            var temporal=new Array();
            temporal=arrayCheck[i].value.split(":/");
            obj.id=temporal[0];
            obj.motivoOtroJust=temporal[1];
            obj.detalle=detalle[0].value;
            arrayOrdenado.push(obj);
        }
    }
    
    var entro=false;
    var primeraVez=arrayOrdenado[0].motivoOtroJust;
    for(var i=0;i<arrayOrdenado.length;i++){
        if(primeraVez!=arrayOrdenado[i].motivoOtroJust){
            entro=true;
            i=arrayOrdenado.length;
        }
    }
    if(entro==false){
        $.ajax({
            url: "/justificacionMasaEmpleado",
            type: 'POST',
            dataType : "json",
            data:{"ordenadas":arrayOrdenado},
            success: function(data) {    
                if(data.result=="Empleado"){
                    location.href="/escritorioEmpl";
                }else{
                    location.href="/escritorio";
                   
                 
                }
              
            },
            error: function(){
                alert("Error al justificar en masa.");
            }
        }); 
    }else{
            
            var notification = alertify.error('Error,seleccione justificaciones con el mismo motivo', 'success', 4, function(){ 
                location.href="/escritorioEmpl";
             });
             
            
    }

});





$(document).ready(function()
   {

     var elementos = $('.miClase');
     var size = elementos.size();
      if(size>0){
         $("#mostrarSolicitudes").modal("show");
      }
     
   });


    jQuery('#date_range_marca').datetimepicker({
        format: 'd/m/Y'
    });
    jQuery('#date_timepicker_start').datetimepicker({
        format: 'd/m/Y H:i'
    });
    jQuery('#date_timepicker_end').datetimepicker({
        format: 'd/m/Y H:i'
    });

    jQuery('#diaInicio').datetimepicker({
        format:'Y/m/d',
        onShow:function( ct ){
            this.setOptions({
                maxDate:jQuery('#diaFinal').val()?jQuery('#diaFinal').val():false
            })
        },
        timepicker:false
    });
    jQuery('#diaFinal').datetimepicker({
        format:'Y/m/d',
        onShow:function( ct ){
            this.setOptions({
                minDate:jQuery('#diaInicio').val()?jQuery('#diaInicio').val():false
            })
        },
        timepicker:false
    });

    jQuery('#date_range_start').datetimepicker({
        format: 'd/m/Y',
        timepicker: false
    });
    jQuery('#date_range_end').datetimepicker({
        format: 'd/m/Y',
        timepicker: false
    });
    jQuery('#fechaIngreso').datetimepicker({
        format: 'd/m/Y',
        timepicker: false
    });
     


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
    $("button[data-target=#updateJustificacion]" ).click( function() {
        var id = $(this).data('value').replace(/\"/g, "");
        $.get('/justificacion/edit/'+id, function( data ) {
            $("#updateJustificacion #motivoOtroJust").prop("readonly", true);
            $("#updateJustificacion #motivoOtroJust").text(data.motivo);
            $("#updateJustificacion #infoJust").text(data.informacion);
            $("#updateJustificacion #detalles").text(data.detalle);
            $("#updateJustificacion #comentSupervisor").prop("readonly", true);
            $("#updateJustificacion #comentSupervisor").text(data.comentarioSupervisor);
            $("#updateJustificacion #identificador").val(id);

            $("#updateJustificacion #motivoOtroJust").val(data.motivo);
          
        });
});

 $("button[data-target=#editExtra]").click( function() {
    var id = $(this).val();
    $('.formUpdateExtra').attr('action', '/extra/'+id);
    $.get('/solicitud/edit/'+id, function( data ) {
        var epochInicio = moment.unix(data.epochInicio).format("YYYY/MM/DD HH:mm"),
        epochTermino = moment.unix(data.epochTermino).format("YYYY/MM/DD HH:mm")
        $('#date_timepicker_start').val(epochInicio);
        $('#date_timepicker_end').val(epochTermino);
        $('#cliente').val(data.cliente);
        $('#motivo').val(data.motivo);
    });
});

 $("button[data-target=#editPermiso]").click( function() {
    var id = $(this).val();
    $.get('/solicitud/edit/'+id, function( data ) {
        $('#diaInicio').val(data.diaInicio);
        $('#diaFinal').val(data.diaFinal);
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
            $('#rangoJornada').show();
        }
        else{
            $('#tipoJornada').prop('checked', false);
            $('#timepicker input').removeAttr('disabled');
            $('#timepicker1 input').removeAttr('disabled');
            $('#rangoJornada').show();
            $('#timepicker4').show();
        }
        $('#horaEntrada').val(data.horaEntrada);            
        $('#horaSalida').val(data.horaSalida);            
        $('#rangoJornada').text(data.rangoJornada);            
        $('#inputRango').val(data.rangoJornada); 
        $('#tiempoReceso').val(data.tiempoReceso); 
        $('#tiempoAlmuerzo').val(data.tiempoAlmuerzo); 
    });
});


$("button[data-target=#editHorarioPersonalizado]").click( function() {
    var id = $(this).val();
    $('.formUpdatePersonalizado').attr('action', '/formUpdatePersonalizado/'+id);

    $.get('/horarioN/buscarPersonalizado/'+id, function( data ) {
        $('#nombreHorarioPersonalizado').val(data.nombreHorarioPersonalizado);
       


        if(data.lunes.entrada.minutos<10){
            $('#lunesEntrada').val(data.lunes.entrada.hora+":"+0+data.lunes.entrada.minutos);
        }else{
            $('#lunesEntrada').val(data.lunes.entrada.hora+":"+data.lunes.entrada.minutos)
        }
        
        if(data.lunes.salida.minutos<10){
            $('#lunesSalida').val(data.lunes.salida.hora+":"+0+data.lunes.salida.minutos);
        }else{
            $('#lunesSalida').val(data.lunes.salida.hora+":"+data.lunes.salida.minutos)
        }

        if(data.martes.entrada.minutos<10){
            $('#martesEntrada').val(data.martes.entrada.hora+":"+0+data.martes.entrada.minutos);
        }else{
            $('#martesEntrada').val(data.martes.entrada.hora+":"+data.martes.entrada.minutos)
        }
    
        if(data.martes.salida.minutos<10){
            $('#martesSalida').val(data.martes.salida.hora+":"+0+data.martes.salida.minutos);
        }else{
            $('#martesSalida').val(data.martes.salida.hora+":"+data.martes.salida.minutos)
        }

        if(data.miercoles.entrada.minutos<10){
            $('#miercolesEntrada').val(data.miercoles.entrada.hora+":"+0+data.miercoles.entrada.minutos);
        }else{
            $('#miercolesEntrada').val(data.miercoles.entrada.hora+":"+data.miercoles.entrada.minutos)
        }
    
        if(data.miercoles.salida.minutos<10){
            $('#miercolesSalida').val(data.miercoles.salida.hora+":"+0+data.miercoles.salida.minutos);
        }else{
            $('#miercolesSalida').val(data.miercoles.salida.hora+":"+data.miercoles.salida.minutos)
        }

        if(data.jueves.entrada.minutos<10){
            $('#juevesEntrada').val(data.jueves.entrada.hora+":"+0+data.jueves.entrada.minutos);
        }else{
            $('#juevesEntrada').val(data.jueves.entrada.hora+":"+data.jueves.entrada.minutos)
        }
    
        if(data.jueves.salida.minutos<10){
            $('#juevesSalida').val(data.jueves.salida.hora+":"+0+data.jueves.salida.minutos);
        }else{
            $('#juevesSalida').val(data.jueves.salida.hora+":"+data.jueves.salida.minutos)
        }


        if(data.viernes.entrada.minutos<10){
            $('#viernesEntrada').val(data.viernes.entrada.hora+":"+0+data.viernes.entrada.minutos);
        }else{
            $('#viernesEntrada').val(data.viernes.entrada.hora+":"+data.viernes.entrada.minutos)
        }

        if(data.viernes.salida.minutos<10){
            $('#viernesSalida').val(data.viernes.salida.hora+":"+0+data.viernes.salida.minutos);
        }else{
            $('#viernesSalida').val(data.viernes.salida.hora+":"+data.viernes.salida.minutos)
        }


        if(data.sabado.entrada.minutos<10){
            $('#sabadoEntrada').val(data.sabado.entrada.hora+":"+0+data.sabado.entrada.minutos);
        }else{
            $('#sabadoEntrada').val(data.sabado.entrada.hora+":"+data.sabado.entrada.minutos)
        }

        if(data.sabado.salida.minutos<10){
            $('#sabadoSalida').val(data.sabado.salida.hora+":"+0+data.sabado.salida.minutos);
        }else{
            $('#sabadoSalida').val(data.sabado.salida.hora+":"+data.sabado.salida.minutos)
        }

        if(data.domingo.entrada.minutos<10){
            $('#domingoEntrada').val(data.domingo.entrada.hora+":"+0+data.domingo.entrada.minutos);
        }else{
            $('#domingoEntrada').val(data.domingo.entrada.hora+":"+data.domingo.entrada.minutos)
        }

        if(data.domingo.salida.minutos<10){
            $('#domingoSalida').val(data.domingo.salida.hora+":"+0+data.domingo.salida.minutos);
        }else{
            $('#domingoSalida').val(data.domingo.salida.hora+":"+data.domingo.salida.minutos)
        }


        if(data.tiempoAlmuerzo.minutos<10){
            $('#tiempoAlmuerzoo').val(data.tiempoAlmuerzo.hora+":"+0+data.tiempoAlmuerzo.minutos);
        }else{
            $('#tiempoAlmuerzoo').val(data.tiempoAlmuerzo.hora+":"+data.tiempoAlmuerzo.minutos)
        }

        
        if(data.tiempoReceso.minutos<10){
            $('#tiempoRecesoo').val(data.tiempoReceso.hora+":"+0+data.tiempoReceso.minutos);
        }else{
            $('#tiempoRecesoo').val(data.tiempoReceso.hora+":"+data.tiempoReceso.minutos)
        }

        


        
       
        
    });
});



$("button[data-target=#editHorarioFijo]").click( function() {
    var id = $(this).val();
    $('.formUpdateFijo').attr('action', '/horarioFijoN/'+id);

    $.get('/horarioFijo/editHorario/'+id, function( data ) {
        $('#nombreFijo').val(data.nombre);            
        $('#horaEntradaFijo').val(data.horaEntrada);  
        $('#horaSalidaFijo').val(data.horaSalida);   
        $('#tiempoRecesoFijo').val(data.tiempoReceso);  
        $('#tiempoAlmuerzoFijo').val(data.tiempoAlmuerzo); 
        if(data.Lunes=="Lunes"){
            $('#Lunes').prop('checked', true);
            $('#Lunes').val('Lunes');
        }else{
            $('#Lunes').prop('checked', false);
        }
        
        if(data.Martes=="Martes"){
            $('#Martes').prop('checked', true);
            $('#Martes').val('Martes');
        } else{
            $('#Martes').prop('checked', false);
        }

        if(data.Miercoles=="Miercoles"){
            $('#Miercoles').prop('checked', true);
            $('#Miercoles').val('Miercoles');
        } else{
            $('#Miercoles').prop('checked', false);
        }

        if(data.Jueves=="Jueves"){
            $('#Jueves').prop('checked', true);
            $('#Jueves').val('Jueves');
        } else{
            $('#Jueves').prop('checked',false);
        }
        if(data.Viernes=="Viernes"){
            $('#Viernes').prop('checked', true);
            $('#Viernes').val('Viernes');
        } else{
             $('#Viernes').prop('checked', false);
        }
        if(data.Sabado=="Sabado"){
            $('#Sabado').prop('checked', true);
            $('#Sabado').val('Sabado');
        } else{
             $('#Sabado').prop('checked', false);
        }
        if(data.Domingo=="Domingo"){
            $('#Domingo').prop('checked', true);
            $('#Domingo').val('Domingo');
        }else{
             $('#Domingo').prop('checked', false);
        }
        

       
    });
});



 $("button[data-target=#editEmpl]").click( function() {
    var id = $(this).val();
    $('.formUpdate').attr('action', '/empleado/'+id);

    $.get('/empleado/edit/'+id, function( data ) {

        if(contador>0){

            $('#estadoEmpleado').find('option').remove();
            $('#estadoEmpleado').find('option').remove();
        }else{
            contador++;
        }
       

        var x = document.getElementById("estadoEmpleado");
        var option = document.createElement("option");
        option.text = data.estado;
        x.add(option);

        if(data.estado=="Activo"){
            var x = document.getElementById("estadoEmpleado");
            var option = document.createElement("option");
            option.text = "Inactivo";
            x.add(option);
    
        }else{
            var x = document.getElementById("estadoEmpleado");
            var option = document.createElement("option");
            option.text = "Activo";
            x.add(option);
        }
        
        //Se crea la fecha
        if(data.fechaIngreso>0){
            var fechaIngesoTem = new Date((data.fechaIngreso*1000));
            var result = fechaIngesoTem.getDate() + "/" + (fechaIngesoTem.getMonth()+1) + "/" + fechaIngesoTem.getFullYear();
        }else{
            var result = "";
        }

        $('#nombre').val(data.nombre);            
        $('#cedula').val(data.cedula);
        $('#apellido1').val(data.apellido1);            
        $('#fechaIngreso').val(result);
        $('#vacaciones').val(data.vacaciones);
        $('#apellido2').val(data.apellido2);            
        $('#email').val(data.email);            
        $('#codTarjeta').val(data.codTarjeta);            
        $('#username').val(data.username);     
        $('#selectTipo').selectpicker('val', data.tipo);       
        $('#selectHorario').selectpicker('val', data.horario);  
        $('#selectHorarioFijo').selectpicker('val', data.horarioFijo);   
        $('#HorarioEmpleado').selectpicker('val', data.horarioEmpleado);     
        $('#selectDepartamentos').selectpicker('val', data.horario);    

        var val = [];
        for (var i = 0; i < data.departamentos.length; i++) {
            val.push(data.departamentos[i].departamento);
        }
        $('#selectDepartamentos').selectpicker('val', val);
        $('#selectDepartamentos').selectpicker('refresh');    
        $('#selectHorario').selectpicker('refresh');    
        $('#selectHorarioFijo').selectpicker('refresh'); 
        $('#HorarioEmpleado').selectpicker('refresh'); 
        $('#selectTipo').selectpicker('refresh');    
        $('#estadoEmpleado').refresh();
        
         

    });
});


 $('.btnCancelar').click(function(){
    $('#selectMotivoJust').val("");
    $('#motivoOtroJust').val("");
    $('#detalles').val("");
    /*$('#datepicker input').val("");*/
    $('#timepicker input').timepicker('setTime', "");
    $('#timepicker1 input').timepicker('setTime', "");
    $('#motivo').val("");
    $('#diaInicio').val("");
    $('#cantidadDias').val("");
    $('#selectMotivo').val("");
    $('#motivoOtro').val("");
    $('#detallePermiso').val(""); 
});

$("#btn-soli-cancelar").click(function(){
  $('#motivo').val("");
  $('#date_timepicker_start').val("");
  $('#date_timepicker_end').val("");
  $('#clienteSoli').val("");
});
$("#extraLink").click(function(){
  $('#motivo').val("");
  $('#date_timepicker_start').val("");
  $('#date_timepicker_end').val("");
  $('#clienteSoli').val("");
});

 $("#btn-permiso").click(function(){
    var val = $('#selectMotivo').val();
    if(val == 'seleccionar') {
        alertify.error('Motivo no valido');
        return false;
    } else {
        $('.formSoli').attr('action', '/solicitud_permisos/');
        $("#btn-permiso").submit();
    }
});

 $("#btn-permiso-cancelar").click(function(){
       $("#diaInicio").val("");
       $("#diaFinal ").val("");
       $("#selectMotivo").val("seleccionar")
       $("#cantidadDias").val("");  
       $("#motivoOtro ").val("");
       $("#detalle").val("");
 });

 $("#btn-just").click(function(){
    var val = $('#selectMotivoJust').val();
    if(val == 'seleccionar') {
        alertify.error('Motivo no valido');
        return false;
    } else {
        $('.formJust').attr('action', 'justificacion_nueva');
        $("#btn-just").submit();
    }
});

 $("#btn-just-cancelar").click(function(){
        $("#selectMotivoJust").val("seleccionar")
        $("#motivoOtroJust").val("")
        $("#detalles").val("")
    
 });







 $("#btn-editPermiso").click(function(){
    var id = $("button[data-target=#editPermiso]").val();
    var val = $('#selectMotivo').val();
    if(val == 'seleccionar') {
        alertify.error('Motivo no valido');
        return false;
    } else {
        $('.formUpdatePermiso').attr('action', '/permiso/'+id);
        $("#btn-editPermiso").submit();
    }
});




 $("#btn-editJust").click(function(){
    var id = $("button[data-target=#editJust]").val();
    var val = $('#selectMotivoJust').val();
    if(val == 'seleccionar') {
        alertify.error('Motivo no valido');
        return false;
    } else {
        $('.formUpdateJust').attr('action', '/justificacion/'+id);
        $("#btn-editJust").submit();
    }
});




/*--------------------------------------------------------------------
    Notificaciones y gestión de eventos
    ---------------------------------------------------------------------*/


    $('.tableSolicitudes').footable().on('click', '.row-delete', 
        function(e) {
            e.preventDefault();
            //get the footable object
            var footable = $('.tableSolicitudes').data('footable');

            //get the row we are wanting to delete
            var row = $(this).parents('tr:first');

            var id = $(this).val();
            var comentarioSupervisor = row.find('.comentarioSupervisor').val();
            var estadoreal = "#estado"+id;
            var estado = $(estadoreal).val();
         
            $.post('/getionarSolicitudAjax/'+id, 
                {comentarioSupervisor: comentarioSupervisor, estado: estado}, 
                function (data){
                    if(data == 'Se elimino'){
                        footable.removeRow(row);
                    }
                });
        });



    $('.tableVacaciones').footable().on('click', '.row-delete', 
        function(e) {
            e.preventDefault();
            //get the footable object
            var footable = $('.tableSolicitudes').data('footable');

            //get the row we are wanting to delete
            var row = $(this).parents('tr:first');
            try {
            /**
             * Se obtienen los datos necesarios
             */
            var valueBtn = $(this).val();
            var id = valueBtn.split(",")[0].split(":")[1];
            var idUsuario = valueBtn.split(",")[1].split(":")[1];
            var numDias = valueBtn.split(",")[2].split(":")[1];
            var disponibles = document.getElementsByClassName(idUsuario);

            var comentarioSupervisor = row.find('.comentarioSupervisor').val();
            var estadoreal = "#estado"+id;
            var estado = $(estadoreal).val();

            //Se actualizan las horas disponibles al usuario que fue aceptado
            if(estado == "Aceptada"){
                for(var cont = 0; cont < disponibles.length; cont ++){
                    (disponibles[cont]).innerHTML = parseInt((disponibles[cont]).innerHTML)-parseInt(numDias);
                }
            }
            
            /**
             * Se hace la actualización en Base de datos por medio de Ajax
             */
            $.post('/getionarSolicitudAjax/'+id, 
                {comentarioSupervisor: comentarioSupervisor, estado: estado}, 
                function (data){
                    if(data == 'Se elimino'){
                        footable.removeRow(row);
                    }
                });
                }
            catch(err) {
                alert(err.message);
            }
        });

    $('.tableJustificaciones').footable().on('click', '.row-delete', 
        function(e) {
            e.preventDefault();
            //get the footable object
            var footable = $('.tableJustificaciones').data('footable');

            //get the row we are wanting to delete
            var row = $(this).parents('tr:first');

            var id = $(this).val();
            var comentarioSupervisor = row.find('.comentarioSupervisor').val();
            var estado = row.find('.select_picker').val();

            $.post('/getionarJustificacionAjax/'+id, 
                {comentarioSupervisor: comentarioSupervisor, estado: estado}, 
                function (data){
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
        for(var i =0;i<split.length;i++){
         
            //alert( split[1]);
        }
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
            $.get('/marca/delete/'+split[1]+'/'+split[2], function (data){
                if(data == 'Se eliminó correctamente.'){
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
    ----------------------------------------------------------------    -----*/
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



 $('.tableFeriado').footable().on('click', '.feriadoDelete', function(e) {
    var footable = $('.tableFeriado').data('footable');
    var row = $(this).parents('tr:first');

    var feriado = $(this).val();
    var split = feriado.split(',');
    alertify.dialog('confirm')
    .set({
        'labels':{ok:'Eliminar', cancel:'Cancelar'},
        'transition': 'slide',
        'message': '¿Está seguro de eliminar el horario <strong>' +  split[0] + '</strong>?' ,
        'onok': function(){ 
            $.get('/feriado/delete/'+split[1], function (data){
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



$("button[data-target=#editFeriado]").click( function() {
    var id = $(this).val();
    $('.formUpdateFeriado').attr('action', '/feriadoUpdate/'+id);
    $.get('/feriado/editFeriado/'+id, function( data ) {
       $('#nombreFeriado').val(data.nombreFeriado);
       $('.epoch').val(moment.unix(data.epoch).format("DD/MM/YYYY"));
    });
});





$('.tableHorarioEliminar').footable().on('click','.eliminarFijo',function(e) {  
    var footable = $('.tableHorarioEliminar').data('footable');
    var row = $(this).parents('tr:first');
    var horario = $(this).val();
    var split = horario.split(',');
    alertify.dialog('confirm')
    .set({
        'labels':{ok:'Eliminar', cancel:'Cancelar'},
        'transition': 'slide',
        'message': '¿Está seguro de eliminar el horario <strong>' +  split[0] + '</strong>?' ,
        'onok': function(){ 
            $.get('/horarioFijo/delete/'+split[1], function (data){
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



$('.tableHorarioPersonalizado').footable().on('click','.eliminarPersonalizado',function(e) {  
    var footable = $('.tableHorarioPersonalizado').data('footable');
    var row = $(this).parents('tr:first');
    var horario = $(this).val();
    var split = horario.split(',');
    alertify.dialog('confirm')
    .set({
        'labels':{ok:'Eliminar', cancel:'Cancelar'},
        'transition': 'slide',
        'message': '¿Está seguro de eliminar el horario <strong>' +  split[0] + '</strong>?' ,
        'onok': function(){ 
            $.get('/horarioPersonalizado/delete/'+split[1], function (data){
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

/*--------------------------------------------------------------------
    Exportar a PDF
    ----------------------------------------------------------------    -----*/
/*    var doc = new jsPDF();

    // We'll make our own renderer to skip this editor
    var specialElementHandlers = {
        '#editor': function(element, renderer){
            return true;
        }
    };

    // All units are in the set measurement for the document
    // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
    doc.fromHTML($('body').get(0), 15, 15, {
        'width': 170, 
        'elementHandlers': specialElementHandlers
    });*/


/*--------------------------------------------------------------------
    Listener
    ---------------------------------------------------------------------*/
//
