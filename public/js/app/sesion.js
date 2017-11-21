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
                if(data && data.tipo){
                    var selectTem = document.getElementById("selectTem");
                    if(data.tipo instanceof Array){
                        for( var i in data.tipo){
                            var option = document.createElement("option");
                            option.text = data.tipo[i];
                            selectTem.add(option); 
                        }
                        
                        if(data.tipo.length <= 1){
                            $("#login-form").submit();
                        }else{
                            global++;
                            /* Se muestran los input para iniciar sesion y se oculta el boton para verificar */
                            $("#btnIngresar").css('display', 'block');
                            $("#selectTem").css('display', 'block');
                            $("#btnVerificar").css('display', 'none');
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
            if(data && data.tipo){
                var selectTem = document.getElementById("selectTem");
                if(data.tipo instanceof Array){
                    for( var i in data.tipo){
                        var option = document.createElement("option");
                        option.text = data.tipo[i];
                        selectTem.add(option); 
                    }
                    
                    if(data.tipo.length <= 1){
                        $("#login-form").submit();
                    }else{
                        /* Se muestran los input para iniciar sesion y se oculta el boton para verificar */
                        $("#btnIngresar").css('display', 'block');
                        $("#selectTem").css('display', 'block');
                        $("#btnVerificar").css('display', 'none');
                    }
                    
                    
                }
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