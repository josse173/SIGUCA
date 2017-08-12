function verificarTipos(){
    var username = $("#username").val();
    $("#selectTem").empty();
    var retorno = false;
    $.ajax({
        url: '/empleado/tipo/get/',
        type: 'GET',
        dataType : "json",
        data: {username2:username},
        success: function(data) {
            if(data && data.tipo){
                var selectTem = document.getElementById("selectTem");
                if(data.tipo instanceof Array){
                    for( var i in data.tipo){
                        var option = document.createElement("option");
                        option.text = data.tipo[i];
                        selectTem.add(option); 
                    }
                }
                else{
                    var option = document.createElement("option");
                    option.text = data.tipo;
                    selectTem.add(option); 
                }
                
                

                //alert("tipos : " + data.tipo);
                retorno = false;

                        
                
            }
        
        },
        error: function(){
        }
    });
    return retorno;
}