$('#btnActualizarEmpleado').click(function(){
    var empleado=new Object();
    empleado._id= $('#idEmpleado').val();
    empleado.cedula= $('#cedula').val();
    empleado.codTarjeta= $('#codTarjeta').val();
    empleado.username=$('#username').val();
    $.ajax({
        url: "/verificarEmpleadoActualizar",
        type: 'POST',
        dataType : "json",
        data:{"empleado":empleado},
        success: function(data) {
            if(data=="Correcto"){
                $('#actualizarEmpleado').submit();
            }else{
                alertify.error("el usuario ya existe");
            }
        },
        error: function(){
            alertify.error("error");
        }
    });
});

 $('[name="horario"]').change(function () {
        if($('[name="horario"]').val()!="Sin horario"){
            document.getElementsByName("horarioFijo")[0].disabled = true;
            document.getElementsByName("horarioEmpleado")[0].disabled = true;
        }
        else {
            document.getElementsByName("horarioFijo")[0].disabled = false;
            document.getElementsByName("horarioEmpleado")[0].disabled = false;
        }

     });

$('[name="horarioFijo"]').change(function () {
    if($('[name="horarioFijo"]').val()!="Sin horario"){
        document.getElementsByName("horario")[0].disabled = true;
        document.getElementsByName("horarioEmpleado")[0].disabled = true;
    }
    else {
        document.getElementsByName("horario")[0].disabled = false;
        document.getElementsByName("horarioEmpleado")[0].disabled = false;
    }

});

$('[name="horarioEmpleado"]').change(function () {

    if($('[name="horarioEmpleado"]').val()!="Sin horario"){
        document.getElementsByName("horario")[0].disabled = true;
        document.getElementsByName("horarioFijo")[0].disabled = true;
    }
    else {
        document.getElementsByName("horario")[0].disabled = false;
        document.getElementsByName("horarioFijo")[0].disabled = false;
    }

});



