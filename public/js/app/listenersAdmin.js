var urlHorario = 'asignarHorario';
$("#asignar-horario-form").submit(function(e) {
    e.preventDefault();   
    //alert($.ajax);
    $.ajax({
        url: urlHorario,
        type: 'POST',
        dataType : "json",
        data: $('#asignar-horario-form').serialize(),
        success: function(data) {
            alert("Horario asignado correctamente.");
            $("#asignarHorario").fadeOut(800,
                function(){
                    $("#asignarHorario").modal("hide");
                });
        },
        error: function(){
            alert("Error al asignarse horario.");
        }
    });
});

function ajustarCero(num){
    if(num<10) return 0+""+num;
    return num;
}
function actualizarHorarioModal(){
    var idUser = $("#asignar-horario-form #selectFiltro").val();
    $.ajax({
        url: '/horario/get/',
        type: 'POST',
        dataType : "json",
        data: {usuario:idUser},
        success: function(data) {
            var dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
            if(data){
                $.each(dias,function(i, dia){
                    $("#"+dia+"HoraEntrada").val(
                        ajustarCero(data[dia].entrada.hora)+":"+
                        ajustarCero(data[dia].entrada.minutos));
                    $("#"+dia+"HoraSalida").val(
                        ajustarCero(data[dia].salida.hora)+":"+
                        ajustarCero(data[dia].salida.minutos));
                });
                $("#tiempoAlmuerzo").val(
                        ajustarCero(data["tiempoAlmuerzo"].hora)+":"+
                        ajustarCero(data["tiempoAlmuerzo"].minutos));
                $("#tiempoReceso").val(
                        ajustarCero(data["tiempoReceso"].hora)+":"+
                        ajustarCero(data["tiempoReceso"].minutos));
                
                urlHorario = "/horario/actualizar/"+idUser;
            }else{
                $.each(dias,function(i, dia){
                    $("#"+dia+"HoraEntrada").val("00:00");
                    $("#"+dia+"HoraSalida").val("00:00");
                });
                $("#tiempoAlmuerzo").val("01:00");
                $("#tiempoReceso").val("00:15");
                urlHorario = "asignarHorario";
            }
        },
        error: function(){
            alert("Error al actualizar el formulario del horario.");
        }
    });
}
$("button[data-target=#asignarHorario]").click( function() {
    actualizarHorarioModal();
});

$("#asignar-horario-form #selectFiltro").change( function() {
    actualizarHorarioModal();
});



//Valida alfanumerico
/*
$.validator.addMethod("alfanum", function(value, element) {
    return /^[ a-z0-9áéíóúüñ]*$/i.test(value);
}, "Ingrese sólo letras, números o espacios.");

--solo numeros
$.validator.addMethod("numero", function(value, element) {
    return /^[0-9]*$/i.test(value);
}, "Acepta solo valores numéricos.");



*/
$.validator.addMethod("letras", function(value, element) {
    return /^[a-zA-ZáéíóúàèìòùÀÈÌÒÙÁÉÍÓÚñÑüÜ_\s]+$/i.test(value);
}, "Ingrese únicamente letras.");

$.validator.addMethod("numeros", function(value, element) {
    return /^[0-9]*$/i.test(value);
}, "Ingrese valores numéricos.");


$('#agregarEmpleado').click(function(){
    
    
    $('#agregarEmpleadoFormulario').validate({
        
        rules:{
            nombre:{required:true,letras:true},
            cedula:{required:true,numeros:true},
            apellido1:{required:true,letras:true},
            apellido2:{required:true,letras:true},
            email:{required:true,email:true},
            codTarjeta:{required:true,numeros:true},
            username:{required:true},
            password:{required:true}
        },
        messages:{
            nombre:{required:'El campo es requerido'},
            cedula:{required:'El campo es requerido'},
            apellido1:{required:'El campo es requerido'},
            apellido2:{required:'El campo es requerido'},
            codTarjeta:{required:'El campo es requerido'},
            username:{required:'El campo es requerido'},
            username:{required:'El campo es requerido'},
            password:{required:'El campo es requerido'}
        }
    });
});

