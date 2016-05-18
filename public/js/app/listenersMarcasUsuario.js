var urlHorario = 'asignarHorario';

$.each(["#btnEntrada","#btnSalida",
    "#btnSalidaAlmuerzo","#btnEntradaAlmuerzo",
    "#btnSalidaReceso","#btnEntradaReceso"],
    function(i, id){
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
                    var cerrado = false;
                    $("#closeMensajeMarca").click(function(){
                        cerrado = true;
                        $("#addMarca").modal("show");
                        $("#addMarca").fadeIn(1000);
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