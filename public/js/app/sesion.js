/*
* Función que actualiza los tipos de usuario disponibles
*/
var global=0;

$(document).keypress(function(e) {

    if(e.which == 13) {
    if(global==0){
        var username = $("#username").val(),
        password =  $("#passInput").val();
        var selectTipo = $("#selectTem").empty();
        $.ajax({
            url: '/empleado/tipo/get/',
            type: 'POST',
            dataType : "json",
            data: {username2:username,password2 : password},
            success: function(data) {
                if(data){
                    var selectTem = document.getElementById("selectTem");
                    if(data.departamentos instanceof Array){
                        for( var i in data.departamentos){
                            var option = document.createElement("option");
                            option.text = data.departamentos[i].tipo;
                            selectTem.add(option);
                        }

                        if(data.departamentos.length <= 1){
                            $("#login-form").submit();
                        }else{
                            global++;
                            /* Se muestran los input para iniciar sesion y se oculta el boton para verificar */
                            $("#btnIngresar").css('display', 'block');
                            $("#selectTem").css('display', 'block');
                            $("#btnVerificar").css('display', 'none');
                            alertify.success('Seleccione el rol con el que desea ingresar.').delay(10);
                        }
                    }
                }

            },
            error: function(){
            }
        });

        return false;
     }else if(global>0){
        global=0;
        $("#login-form").submit();
     }

    }

});

function verificarTipos(){
    var username = $("#username").val(),
    password =  $("#passInput").val();
    var selectTipo = $("#selectTem").empty();
    $.ajax({
        url: '/empleado/tipo/get/',
        type: 'POST',
        dataType : "json",
        data: {username2:username,password2 : password},
        success: function(data) {
            if(data){
                var selectTem = document.getElementById("selectTem");

                if(data.departamentos instanceof Array){
                    var roles = [];
                    data.departamentos.forEach(function (departamento) {
                        if(!roles.includes(departamento.tipo)){
                            roles.push(departamento.tipo);
                        }
                    });

                    for( var i in roles){
                        var option = document.createElement("option");
                        option.text = roles[i];
                        selectTem.add(option);
                    }

                    if(data.departamentos.length <= 1){
                        $("#login-form").submit();
                    }else{



                        alertify.success('Seleccione el rol con el que desea ingresar.').delay(10);

                        /* Se muestran los input para iniciar sesion y se oculta el boton para verificar */
                        $("#btnIngresar").css('display', 'block');
                        $("#selectTem").css('display', 'block');
                        $("#btnVerificar").css('display', 'none');
                    }
                }
            }else{
                var notification = alertify.error('Error:Los credenciales no coinciden con ningún usuario', 'success', 4, function(){

                 });
            }

        },
        error: function(){
        }
    });

    return false;
}

/**
 * Función que capta un cambio en los input
 */
 $("#username,#passInput").keyup(function(){
    $("#btnIngresar").css('display', 'none');
    $("#selectTem").css('display', 'none');
    $("#btnVerificar").css('display', 'block');
 });
