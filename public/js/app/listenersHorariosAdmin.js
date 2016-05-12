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
