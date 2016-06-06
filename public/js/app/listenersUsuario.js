var urlHorario = 'asignarHorario';

$.each(["#btnEntrada","#btnSalida",
    "#btnSalidaAlmuerzo","#btnEntradaAlmuerzo",
    "#btnSalidaReceso","#btnEntradaReceso"],
    function(i, id){
        var cerrado = false;
        $(id).click(function() { 
            $.ajax({
                url: "marca",
                type: "POST",
                dataType : "json",
                data: {marca:$(this).val()},
                success: function(data) {
                    $("#lblMensajeMarca").text(data.result);
                    $("#mensajeMarca").modal("show");
                    $("#mensajeMarca").fadeIn(1);
                    $("#closeMensajeMarca").click(function(){
                        cerrado = true; 
                        if(data.result!="Marca registrada correctamente."){
                            $("#addMarca").modal("show");
                            $("#addMarca").fadeIn(1000);
                        } 
                        else {
                            window.location.replace(window.location.href);
                        }
                    });
                    $("#addMarca").fadeOut(500);
                    setTimeout(function() {
                        $("#addMarca").modal("hide");
                    }, 500);
                    var time = 8000;
                    if(data.result=="Marca registrada correctamente."){
                        time = 4000;
                        $("#lblMensajeMarca").text(data.result+
                            "\n Cuenta con 5 minutos para eliminar la marca, en caso de ser errónea.");
                    }
                    if(data.justificacion && data.justificacion!=""){
                        time = 4000;
                        $("#lblMensajeMarca").text(
                        $("#lblMensajeMarca").text()+
                        "\n ALERTA: Debe justificar un nuevo pendiente. \""+data.justificacion+"\"");
                    }
                    alert(JSON.stringify(data));
                    setTimeout(function() {
                        window.location.replace(window.location.href);
                    }, time);
                },
                error: function(){
                    $("#closeMensajeMarca").click(function(){
                        cerrado = true;
                        $("#addMarca").fadeIn(1000);
                    });
                    $("#addMarca").fadeOut(500);
                    $("#lblMensajeMarca").text("No se pudo contactar con el sistema.\n"+
                        "El error ocurrió al realizar marca y esta no se registró.\n"+
                        "Puede intentar refrescando la página.");
                    $("#mensajeMarca").modal("show");
                }
            });
            //
        });
});

$("#solicitud-extra-form").submit(function(e){
    e.preventDefault();  
    $.ajax({
        url: 'solicitud_extra',
        type: 'POST',
        dataType : "json",
        data: $('#solicitud-extra-form').serialize(),
        success: function(data) {
            $("#lblMensajeMarca").text(data.result);
            $("#mensajeMarca").modal("show");
            $("#mensajeMarca").fadeIn(1);
            var cerrado = false;
            $("#closeMensajeMarca").click(function(){
                cerrado = true; 
                if(data.result!="Guardado correctamente."){
                    $("#horaExtra").modal("show");
                    $("#horaExtra").fadeIn(1000);
                } 
                else {
                    window.location.replace(window.location.href);
                }
            });
            $("#horaExtra").fadeOut(500);
            setTimeout(function() {
                $("#horaExtra").modal("hide");
            }, 500);
            if(data.result=="Guardado correctamente."){
                $("#lblMensajeMarca").text("Solicitud realizada correctamente.");
            }
        },
        error: function(err){
            $("#closeMensajeMarca").click(function(){
                cerrado = true;
                $("#horaExtra").fadeIn(1000);
            });
            $("#horaExtra").fadeOut(500);
            $("#lblMensajeMarca").text("No se pudo contactar con el sistema.\n"+
                "El error ocurrió al realizar la solicitud y esta no se registró.\n"+
                "Puede intentar refrescando la página.");
            $("#mensajeMarca").modal("show");
        }
    });
});
