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
                        $("#addMarca").fadeIn(1000);
                    });
                    $("#addMarca").fadeOut(500);
                    var time = 10000;
                    if(data.result=="Marca registrada correctamente.")
                        time = 2000;
                    setTimeout(function() {
                        $("#mensajeMarca").fadeOut(1000);
                        //$("#mensajeMarca").modal("hide");
                        setTimeout(function() {
                            if(data.result=="Marca registrada correctamente.")
                                window.location.replace(window.location.href);
                            else $("#addMarca").fadeIn(500);
                        }, 1000);
                    }, time);
                },
                error: function(){
                    $("#lblMensajeMarca").text("No se pudo contactar con el sistema.\n"+
                        "El error ocurrió al realizar marca y esta no se registró.");
                    $("#mensajeMarca").modal("show");
                }
            });
            //
        });
});