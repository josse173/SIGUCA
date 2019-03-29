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
        format:'Y-m-d',
        onShow:function( ct ){
            this.setOptions({
                maxDate:jQuery('#diaFinal').val()?jQuery('#diaFinal').val():false
            })
        },
        timepicker:false
    });
    jQuery('#diaFinal').datetimepicker({
        format:'Y-m-d',
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
        if($('#selectMotivo').val() == 'Otro') $("#motivoOtro").removeAttr('disabled');
        else $("#motivoOtro").attr('disabled','disabled');
    });

    $('#selectMotivoJust').change(function (){
        if($('#selectMotivoJust').val() == 'Otro') $("#motivoOtroJust").removeAttr('disabled');
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
                $('#selectMotivoJust').val('Otro');
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
    $('.formUpdateExtra').attr('action', '/guardarHoraExtra/'+id);
    $.get('/horaExtra/edit/'+id, function( data ) {
        var epochInicio = moment.unix(data.fechaInicial).format("DD/MM/YYYY HH:mm"),
        epochTermino = moment.unix(data.fechaFinal).format("DD/MM/YYYY HH:mm");

        $('#date_timepicker_start').val(epochInicio);
        $('#date_timepicker_end').val(epochTermino);
        $('#cliente').val(data.ubicacion);
        $('#motivo').val(data.motivo);
    });
});

 $("button[data-target=#editPermiso]").click( function() {
    var id = $(this).val();
    $.get('/solicitud/edit/'+id, function( data ) {
        $('#diaInicio').val(data.diaInicio);
        $('#diaFinal').val(data.diaFinal);

        $('#cantidadDias').val(data.cantidadDias);
        document.getElementById("lblnumDias").innerHTML = "Días: " + data.cantidadDias;

        $('#selectMotivo').val(data.motivo);
        $('#hiddenMotivo').val(data.motivo);
        $('#detallePermiso').val(data.detalle);

        document.getElementById("divArticulo51").style.display = "none";
        document.getElementById("divOtro").style.display = "none";
        document.getElementById("selectOpcionesPermisosSinSalario").style.display = "none";

        if(data.motivo === 'Otro'){
            document.getElementById("divOtro").style.display = "block";
            $('#motivoOtro').val(data.motivoOtro);
        } else if(data.motivo === 'Articulo 51'){
            document.getElementById("divArticulo51").style.display = "block";
            $('#motivoArticulo51').val(data.motivoArticulo51 + ' (' + data.inciso + ')');
        } else if(data.motivo === 'Permiso sin goce de salario') {
            document.getElementById("selectOpcionesPermisosSinSalario").style.display = "block";
            $('#selectPermisosSinSalario').val(data.inciso);
        }else if(data.motivo === 'Salida-Visita (INS)') {
            jQuery('#diaInicio').datetimepicker({
                format: 'Y-m-d H:i:00',
                timepicker:true,
                onShow:function( ct ){
                    this.setOptions({
                        maxDate:jQuery('#diaFinal').val()?jQuery('#diaFinal').val():false
                    })
                }
            });
            jQuery('#diaFinal').datetimepicker({
                format: 'Y-m-d H:i:00',
                timepicker:true,
                onShow:function( ct ){
                    this.setOptions({
                        minDate:jQuery('#diaInicio').val()?jQuery('#diaInicio').val():false
                    })
                }
            });
        }

    });
});

 $("button[data-target=#editDep]").click( function() {
    var id = $(this).val();

    $('.formUpdate').attr('action', '/departamento/'+id);

    $.get('/departamento/editDepartamento/'+id, function( data ) {
        $('#nombreDepa').val(data.nombre);

        if(data.departamentoSupervisor){
            $('#selectDepartamentosEdit').selectpicker('val', data.departamentoSupervisor._id);
        } else {
            $('#selectDepartamentosEdit').selectpicker('val', '');
        }

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

        if(data.teleTrabajo == "on"){
            $('#teleTrabajo').attr("checked",true);
        }else {
            $('#teleTrabajo').attr("checked",false);
        }

        $('#cedula').val(data.cedula);
        $('#apellido1').val(data.apellido1);
        $('#fechaIngresoo').val(result);
        $('#vacaciones').val(data.vacaciones);
        $('#apellido2').val(data.apellido2);
        $('#email').val(data.email);
        $('#codTarjeta').val(data.codTarjeta);
        $('#username').val(data.username);

        $('#selectHorario').selectpicker('val', data.horario);
        $('#selectHorarioFijo').selectpicker('val', data.horarioFijo);
        $('#HorarioEmpleado').selectpicker('val', data.horarioEmpleado);

        $('#idEmpleado').val(data._id);
        $("#idEmpleado").css('display','none');

        $('#selectHorario').selectpicker('refresh');
        $('#selectHorarioFijo').selectpicker('refresh');
        $('#HorarioEmpleado').selectpicker('refresh');
        $('#estadoEmpleado').selectpicker('refresh');

        agregarLiUpdate(data.departamentos);

    });
});

 function agregarLiUpdate(departamentos){

     var ul = document.getElementById("listDepartamentos");

     var selected = [];

     departamentos.forEach(function (departamento) {

         var text = '';
         if(departamento.departamento){
             text = departamento.departamento._id + ';' + departamento.tipo;
         }else{
             text = 'Sin Departamento;' + departamento.tipo;
         }

         selected.push(text);

        var li = document.createElement("li");

        var button = document.createElement("BUTTON");
         li.id = text;
         button.innerHTML = "Eliminar";
         button.classList.add('btn');
         button.classList.add('btn-danger');
         button.style.marginLeft = "5px";
         button.style.marginBottom = "5px";

         button.onclick = function() {

             var selected = $('#rolesDepartamento').val().split("|");

             var index = selected.indexOf(text);
             if (index > -1) {
                 selected.splice(index, 1);
             }

             $('#rolesDepartamento').val(selected.join('|'));

             var lis = document.querySelectorAll('#listDepartamentos li');
             for(var i=0; li=lis[i]; i++) {
                 if(li.id === text){
                     li.parentNode.removeChild(li);
                 }
             }
         };
         var text2 = '';
         if (departamento.tipo !== 'Administrador' && departamento.tipo !== 'Administrador de Reportes'){
             text2 = departamento.departamento.nombre + ' (' + departamento.tipo + ')';
         } else {
             text2 = 'Sin Departamento (' + departamento.tipo + ')';
         }

         li.appendChild(document.createTextNode(text2));
         li.appendChild(button);
         ul.appendChild(li);

     });

     $('#rolesDepartamento').val(selected.join('|'));
 }

 $('.btnDescargaPdf').click(function(){

     var doc = new jsPDF();
     doc.autoTable({html: 'solicitudesTable'});
     doc.save("table.pdf");

     alertify.dialog('confirm')
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

 $("#permiso").click(function(){
     var testYear = moment().format('YYYY');
     $('#anno').val(testYear);
 });

 $("#btn-permiso").click(function(e){

     e.preventDefault();
     var $self = $(this);
     var val = $('#selectMotivo').val();
     var inciso = $('#selectInciso').val();
     var cantidadDias = Number($('#cantidadDias').val());
     var fecha = $('#diaInicio').val();
     var fechaFormateada = moment(fecha).format('MM/DD/YYYY').valueOf();
     var nuevaFecha = moment(fechaFormateada);
     var fechaAConfirmar = nuevaFecha.format();
     var usuario = $('#btn-marca').val();
     var diasVacacionesDisponibles = $('#totalDiasDisponibles').val();

     if(val === 'seleccionar') {
         alertify.error('Motivo no valido');
         return false;
     } else if(val === 'Articulo 51') {
         if(inciso === 'Inciso A'){
             if(cantidadDias > 5){
                 alertify.error('No puede ingresar un Inciso A debido que la cantidad maxima a solicitar son 5 días');
                 return false;
             }else{
                 $('.formSoli').attr('action', '/solicitud_permisos/');
                 $self.off('click').get(0).click();
             }
         }else if(inciso === 'Inciso B'){
             if(cantidadDias > 1){
                 alertify.error('No puede ingresar Inciso B cantidad maxima a solicitar es 1 día');
                 return false;
             }else{
                 $('.formSoli').attr('action', '/solicitud_permisos/');
                 $self.off('click').get(0).click();
             }
         }else if(inciso === 'Inciso C'){

             var promiseCantidadSolicitudes = $.cantidadSolicitudes(usuario);

             promiseCantidadSolicitudes.done(function(respuestaCantidad){

                 if(respuestaCantidad.quantity.length >= 3){
                     alertify.error('No se puede usar el Inciso C más de 3 veces');
                     return false;
                 }else{
                     var promiseValidarFechaSiguienteAnterior = $.validarFechaSiguienteAnterior(usuario, fechaAConfirmar);

                     promiseValidarFechaSiguienteAnterior.done(function(repuestaValidacion){
                         if(repuestaValidacion > 0){
                             alertify.error('No puede ingresar Inciso C debido a que tiene una solicitud del mismo tipo el día anterior o el día siguiente');
                             return false;
                         } else {
                             if(cantidadDias > 1){
                                 alertify.error('No puede ingresar Inciso C cantidad maxima a solicitar es 1 día');
                                 return false;
                             } else {
                                 $('.formSoli').attr('action', '/solicitud_permisos/');
                                 $self.off('click').get(0).click();
                             }
                         }
                     });
                 }
             });
         }
     } else if(val === 'Vacaciones'){

         if(cantidadDias && cantidadDias > 0){

             if(parseInt(cantidadDias) > parseInt(diasVacacionesDisponibles)){
                 alertify.error('La cantidad de días solicitados supera la cantidad de Vacaciones disponibles');
                 return false;

             }else{

                 $('.formSoli').attr('action', '/solicitud_permisos/');
                 $self.off('click').get(0).click();
             }
         }
     }else {
         $('.formSoli').attr('action', '/solicitud_permisos/');
         $self.off('click').get(0).click();
     }
 });

 $.cantidadSolicitudes = function (usuario) {
     return $.get('/solicitud/inciso', {id: usuario}, function( data ) {});
 };

 $.validarFechaSiguienteAnterior = function (usuario, fecha) {
     return $.get('/solicitud/solicitudAyer/'+usuario+'/'+fecha, function( data ) {});
 };

 $('#permiso').on('hidden.bs.modal', function () {
     limpiarformularioPermiso();
 });

 $('#permiso').on('shown.bs.modal', function () {
     limpiarformularioPermiso();
 });

 $("#cerrarModalPermiso").click(function(){
     limpiarformularioPermiso();
 });

 $("#btn-permiso-cancelar").click(function(){
     limpiarformularioPermiso();
 });

 function limpiarformularioPermiso(){
     $("#diaInicio").val("");
     $("#diaFinal ").val("");
     $("#cantidadDias").val("");
     $("#motivoOtro ").val("");
     $("#detalle").val("");
     $("#selectMotivo").get(0).selectedIndex = 0;
     $("#selectDerechoDisfrutar").get(0).selectedIndex = 0;
     $("#selectPermisosSinSalario").get(0).selectedIndex = 0;
     $("#selectInciso").get(0).selectedIndex = 0;

     $("#divOtro").attr('style','display:none');
     $("#selectOpcionesArticulo").attr('style','display:none');
     $("#selectOpcionesPermisosSinSalario").attr('style','display:none');
     $("#selectOpcionesDepartamento").attr('style','display:none');
     $("#divDerechoDisfrutarPorPeriodo").attr('style','display:none');
     $("#divDiasDisfrutadosPorPeriodo").attr('style','display:none');
     $("#divTotalDiasDisponibles").attr('style','display:none');
     $("#divInciso").attr('style','display:none');
     $("#divcantidadDiasDisfrutados").attr('style','display:none');
     $("#divcantidadDiasDisponibles").attr('style','display:none');
     $("#divcantidadDiasSolicitados").attr('style','display:none');
     $("#divsaldoDiasDisfrutar").attr('style','display:none');
     $("#divanno").attr('style','display:none');
 }

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
                    alertify.success('Solicitud actualizada.');
                    if(estado !== 'Pendiente'){
                        footable.removeRow(row);
                    }
                });
        });


 $('.tableExtras').footable().on('click', '.row-delete',
     function(e) {
         e.preventDefault();
         //get the footable object
         var footable = $('.tableExtras').data('footable');
         //get the row we are wanting to delete
         var row = $(this).parents('tr:first');

         var id = $(this).val();
         var comentarioSupervisor = row.find('.comentarioSupervisor').val();
         var estadoreal = "#estado"+id;
         var estado = $(estadoreal).val();
         $.post('/getionarHorasExtrasAjax/'+id,
             {comentarioSupervisor: comentarioSupervisor, estado: estado},
             function (data){
                 alertify.success('Hora extra actualizada.');
                 if(estado !== 'Pendiente'){
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
            var motivo= row.find('#motivo').text();

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
                {comentarioSupervisor: comentarioSupervisor, estado: estado, motivo: motivo},
                function (data){
                    alertify.success('Hora extra actualizada.');
                    if(estado !== 'Pendiente'){
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
                    alertify.success('Justificación actualizada.');
                    if(estado !== 'Pendiente'){
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
        }).setHeader('<em> Eliminar justificación </em> ').show();
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
    }).setHeader('<em> Eliminar Solicitud </em> ').show();
});

 $('.tableSolicitudesSinGoce').footable().on('click', '.solicitudDelete', function(e) {

     var footable = $('.tableSolicitudes').data('footable');
     var row = $(this).parents('tr:first');
     var solicitud = $(this).val();
     var split = solicitud.split(',');
     alertify.dialog('confirm')
         .set({
             'label': 'test',
             'labels':{ok:'Eliminar', cancel:'Cancelar'},
             'transition': 'slide',
             'message': '¿Está seguro de eliminar la solicitud de <br/><strong>' +  split[0] + '</strong> creada el día <i><b> ' + split[2] + ' </b></i>?',
             'onok': function(){
                 $.get('/solicitud/delete/'+split[1], function (data){
                     if(data === 'Se elimino'){
                         footable.removeRow(row);
                         alertify.message('Se eliminó la solicitud de <strong>' +  split[0] + '</strong> con éxito');
                     } else {
                         alertify.error(data);
                     }
                 });
             }
         }).setHeader('<em> Eliminar Solicitud </em> ').show();
 });



 $('.tableVacaciones').footable().on('click', '.solicitudDelete', function(e) {
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
   }).setHeader('<em> Eliminar Solicitud </em> ').show();
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
        'message': '¿Está seguro de eliminar la marca de <br/><strong>' +  split[2] + '</strong>?',
        'onok': function(){
            $.get('/marca/delete/'+split[1]+'/'+split[2], function (data){
                if(data == 'Se eliminó correctamente.'){
                    footable.removeRow(row);
                    alertify.message('Se eliminó la marca <strong>' +  split[2] + '</strong> con éxito');
                } else {
                    alertify.error(data);
                }
            });
        }
    }).setHeader('<em> Eliminar Marca </em> ').show();
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
        }).setHeader('<em> Eliminar Departamento </em> ').show();
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
    }).setHeader('<em> Eliminar Horario </em> ').show();
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
    }).setHeader('<em> Eliminar Horario </em> ').show();
});

 $('.tablePeriodo').footable().on('click', '.periodoDelete', function(e) {
     var footable = $('.tablePeriodo').data('footable');
     var row = $(this).parents('tr:first');

     var periodo = $(this).val();
     var split = periodo.split(',');
     alertify.dialog('confirm')
         .set({
             'labels':{ok:'Eliminar', cancel:'Cancelar'},
             'transition': 'slide',
             'message': '¿Está seguro de eliminar el periodo <strong>' +  split[0] + '</strong>?' ,
             'onok': function(){
                 $.get('/periodo/delete/'+split[2], function (data){
                     if(data == 'Se elimino'){
                         footable.removeRow(row);
                         alertify.message('Se eliminó el periodo ' +  split[0] + ' con éxito');
                     } else {
                         alertify.error('No se puede eliminar el periodo <strong>' +  split[0] + '</strong>');
                     }
                 });
             }
         }).setHeader('<em> Eliminar Horario </em> ').show();
 });

$('.tableCorreo').footable().on('click', '.correoDelete', function(e) {
    var footable = $('.tableCorreo').data('footable');
    var row = $(this).parents('tr:first');

    var correo= $(this).val();
    var split = correo.split(',');
    alertify.dialog('confirm')
    .set({
        'labels':{ok:'Eliminar', cancel:'Cancelar'},
        'transition': 'slide',
        'message': '¿Está seguro de eliminar el horario <strong>' +  split[0] + '</strong>?' ,
        'onok': function(){
            $.get('/correo/delete/'+split[1], function (data){
                if(data == 'Se elimino'){
                    footable.removeRow(row);
                    alertify.message('Se eliminó el correo ' +  split[0] + ' con éxito');
                } else {
                    alertify.error('No se puede eliminar el correo <strong>' +  split[0] + '</strong>,');
                }
            });
        }
    }).setHeader('<em> Eliminar Horario </em> ').show();
});

$('.tableRed').footable().on('click', '.redDelete', function(e) {
    var footable = $('.tableRed').data('footable');
    var row = $(this).parents('tr:first');

    var red= $(this).val();
    var split = red.split(',');
    alertify.dialog('confirm')
    .set({
        'labels':{ok:'Eliminar', cancel:'Cancelar'},
        'transition': 'slide',
        'message': '¿Está seguro de eliminar la red <strong>' +  split[0] + '</strong>?' ,
        'onok': function(){
            $.get('/red/delete/'+split[1], function (data){
                if(data == 'Se elimino'){
                    footable.removeRow(row);
                    alertify.message('Se eliminó la red ' +  split[0] + ' con éxito');
                } else {
                    alertify.error('No se puede eliminar la red <strong>' +  split[0] + '</strong>');
                }
            });
        }
    }).setHeader('<em> Eliminar Red </em> ').show();
});

 $('.tableCorreoRH').footable().on('click', '.correoRHDelete', function(e) {
     var footable = $('.tableCorreoRH').data('footable');
     var row = $(this).parents('tr:first');

     var red= $(this).val();
     var split = red.split(',');
     alertify.dialog('confirm')
         .set({
             'labels':{ok:'Eliminar', cancel:'Cancelar'},
             'transition': 'slide',
             'message': '¿Está seguro de eliminar el correo <strong>' +  split[0] + '</strong>?' ,
             'onok': function(){
                 $.get('/correoRH/delete/'+split[1], function (data){
                     if(data == 'Se elimino'){
                         footable.removeRow(row);
                         alertify.message('Se eliminó el correo ' +  split[0] + ' con éxito');
                     } else {
                         alertify.error('No se puede eliminar el correo <strong>' +  split[0] + '</strong>');
                     }
                 });
             }
         }).setHeader('<em> Eliminar Correo </em> ').show();
 });

$("button[data-target=#editFeriado]").click( function() {
    var id = $(this).val();
    $('.formUpdateFeriado').attr('action', '/feriadoUpdate/'+id);
    $.get('/feriado/editFeriado/'+id, function( data ) {
       $('#nombreFeriado').val(data.nombreFeriado);
       $('.epoch').val(moment.unix(data.epoch).format("DD/MM/YYYY"));
    });
});

 $("button[data-target=#editPeriodo]").click( function() {
     var id = $(this).val();
     var split = id.split(',');
     $('.formUpdatePeriodo').attr('action', '/periodoUpdate/'+ id);
     $.get('/periodo/editPeriodo/'+split[0], function( data ) {
         $('#periodoUpdate').val(data.numeroPeriodo);
         $('#fechaCreadaUpdate').val(moment.unix(data.fechaCreada).format("YYYY-MM-DD hh:mm:ss"));
         $('#fechaInicioUpdate').val(moment.unix(data.fechaInicio).format("YYYY-MM-DD hh:mm:ss"));
         $('#fechaFinalUpdate').val(moment.unix(data.fechaFinal).format("YYYY-MM-DD hh:mm:ss"));
         $('#diasAsignadosUpdate').val(data.diasAsignados);
         $('#diasDisfrutadosUpdate').val(data.diasDisfrutados);

     });
 });

$("button[data-target=#editContenido]").click( function() {
    var id = $(this).val();
    $('.formUpdateContenido').attr('action', '/contenidoUpdate/'+id);
    $.get('/contenido/editContenido/'+id, function( data ) {
       $('#titulo').val(data.titulo);
       $('#seccion').val(data.seccion);
       $('#llave').val(data.llave);
    });
});

$("button[data-target=#editConfiguracion]").click( function() {
     var id = $(this).val();
     $('.formUpdateConfiguracion').attr('action', '/configuracionAlertasUpdate/'+id);
     $.get('/configuracionAlertas/editConfiguracion/'+id, function( data ) {
         $('#nombreUnico').val(data.nombreUnico);
         $('#nombre').val(data.nombre);
         $('#valor').val(data.valor);
     });
 });

$("button[data-target=#editCorreo]").click( function() {
    var id = $(this).val();
    $('.formUpdateCorreo').attr('action', '/correoUpdate/'+id);
    $.get('/correo/editCorreo/'+id, function( data ) {
       $('#nombreCorreo').val(data.nombreCorreo);
       $('#dominioCorreo').val(data.dominioCorreo);
       $('#password').val(data.password);
    });
});

$("button[data-target=#editRed]").click( function() {
    var id = $(this).val();
    $('.formUpdateRed').attr('action', '/redUpdate/'+id);
    $.get('/red/editRed/'+id, function( data ) {
       $('#nombreRed').val(data.nombreRed);
    });
});

 $("button[data-target=#editCorreoRH]").click( function() {
     var id = $(this).val();
     $('.formUpdateCorreoRH').attr('action', '/correoRHUpdate/'+id);
     $.get('/correoRH/editCorreoRH/'+id, function( data ) {
         $('#nombreCorreoRH').val(data.correo);
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
    }).setHeader('<em> Eliminar Horario </em> ').show();

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
    }).setHeader('<em> Eliminar Horario </em> ').show();

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
        'message': '¿Está seguro de <i>eliminar</i> al empleado(a) <strong>' +  split[0] + '</strong>?' ,
        'onok': function(){
            $.get('/empleado/delete/'+split[1], function (data){
                if(data == 'Se elimino'){
                    footable.removeRow(row);
                    alertify.message('Se eliminó el empleado(a) <strong>' +  split[0] + '</strong> con éxito');
                } else {
                    alertify.error(data);
                }
            });
        }
    }).setHeader('<em> Eliminar Empleado </em> ').show();
});

$('.tableJustificaciones').footable().on('click', '.justificacionBoleta',
 function(e) {

     e.preventDefault();

     var parametros = $(this).val().split(';');

     var req = new XMLHttpRequest();
     req.open("POST", '/generarBoleta/{"id":"'+parametros[0]+'", "tipo":"'+parametros[1]+'"}', true);
     req.responseType = "blob";

     req.onload = function (event) {
         var blob = req.response;

         const url = window.URL.createObjectURL(new Blob([req.response]));
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', 'Boleta-' + parametros[1] + '-' + parametros[0] + '.pdf');
         document.body.appendChild(link);
         link.click();
     };

     req.send();
 });

 $('.solicitudesTable').footable().on('click', '.solicitudesBoleta',
     function(e) {

         e.preventDefault();

         var parametros = $(this).val().split(';');

         var req = new XMLHttpRequest();
         req.open("POST", '/generarBoleta/{"id":"'+parametros[0]+'", "tipo":"'+parametros[1]+'"}', true);
         req.responseType = "blob";

         req.onload = function (event) {
             var blob = req.response;

             const url = window.URL.createObjectURL(new Blob([req.response]));
             const link = document.createElement('a');
             link.href = url;
             link.setAttribute('download', 'Boleta-' + parametros[1] + '-' + parametros[0] + '.pdf');
             document.body.appendChild(link);
             link.click();
         };

         req.send();
     });

 $('.tableSolicitudes').footable().on('click', '.solicitudesBoleta',
     function(e) {

         e.preventDefault();
         var parametros = $(this).val().split(';');

         var req = new XMLHttpRequest();
         req.open("POST", '/generarBoleta/{"id":"'+parametros[0]+'", "tipo":"'+parametros[1]+'"}', true);
         req.responseType = "blob";

         req.onload = function (event) {
             var blob = req.response;

             const url = window.URL.createObjectURL(new Blob([req.response]));
             const link = document.createElement('a');
             link.href = url;
             link.setAttribute('download', 'Boleta-' + parametros[1] + '-' + parametros[0] + '.pdf');
             document.body.appendChild(link);
             link.click();
         };

         req.send();
     });

 $('.tableVacaciones').footable().on('click', '.vacacionesBoleta',
     function(e) {

         e.preventDefault();
         var parametros = $(this).val().split(';');

         var req = new XMLHttpRequest();
         req.open("POST", '/generarBoleta/{"id":"'+parametros[0]+'", "tipo":"'+parametros[1]+'"}', true);
         req.responseType = "blob";

         req.onload = function (event) {
             var blob = req.response;

             const url = window.URL.createObjectURL(new Blob([req.response]));
             const link = document.createElement('a');
             link.href = url;
             link.setAttribute('download', 'Boleta-' + parametros[1] + '-' + parametros[0] + '.pdf');
             document.body.appendChild(link);
             link.click();
         };

         req.send();
     });

 $('.tablaHorasExtra').footable().on('click', '.extrasBoleta',
 function(e) {

     e.preventDefault();
     var parametros = $(this).val().split(';');

     var req = new XMLHttpRequest();
     req.open("POST", '/generarBoleta/{"id":"'+parametros[0]+'", "tipo":"'+parametros[1]+'"}', true);
     req.responseType = "blob";

     req.onload = function (event) {
         var blob = req.response;

         const url = window.URL.createObjectURL(new Blob([req.response]));
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', 'Boleta-' + parametros[1] + '-' + parametros[0] + '.pdf');
         document.body.appendChild(link);
         link.click();
     };

     req.send();
 });

 $('.tableExtras').footable().on('click', '.extrasBoleta',
     function(e) {

         e.preventDefault();

         var parametros = $(this).val().split(';');

         var req = new XMLHttpRequest();
         req.open("POST", '/generarBoleta/{"id":"'+parametros[0]+'", "tipo":"'+parametros[1]+'"}', true);
         req.responseType = "blob";

         req.onload = function (event) {
             var blob = req.response;

             const url = window.URL.createObjectURL(new Blob([req.response]));
             const link = document.createElement('a');
             link.href = url;
             link.setAttribute('download', 'Boleta-' + parametros[1] + '-' + parametros[0] + '.pdf');
             document.body.appendChild(link);
             link.click();
         };

         req.send();
     });

 $("button[data-target=#addEmpl]").click( function() {
     alertify.error('La fecha de creación no se podrá modificar una vez creado el usuario');
 });
