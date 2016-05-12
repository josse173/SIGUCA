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
                    alert(data.result);
                    if(data.result=="Marca registrada correctamente.")
                        window.location.replace(window.location.href);
                },
                error: function(){
                    alert("No se pudo contactar con el sistema.\n"+
                        "El error ocurrió al realizar marca y esta no se registró.");
                }
            });
            //
        });
    });