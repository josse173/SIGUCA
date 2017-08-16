
$(".justificar").click(function(){
 
    var cantidadCheck=document.getElementsByClassName("justificar");
    var contador=0;
    for(var i=0;i<cantidadCheck.length;i++){
        if( cantidadCheck[i].checked) {
            contador++;
        }
    }

    if(contador>0){
        $("#comentarioDelSupervisor").css('display','block');
        $("#justificarMasa").css('display','block');
        $("#estadoMasa").css('display','block');
     
    }else{
        $("#comentarioDelSupervisor").css('display','none');
        $("#justificarMasa").css('display','none');
        $("#estadoMasa").css('display','none');
    }

});

$("#justificarMasa").click(function() {
    

    var arrayCheck=document.getElementsByClassName("justificarArray");
    var estado=document.getElementsByClassName("estado");
    var comentario=document.getElementsByClassName("comentarioDelSupervisorMasa");
    var estadoTemporal=document.getElementsByClassName("estadoMasa");

    var arrayJustificaciones=new Array();
    if(estadoTemporal[0].value=="Seleccionar"){

       
        for(var i=0;i<arrayCheck.length;i++){
            if( arrayCheck[i].checked) {

                var obj=new Object();
                obj.id=arrayCheck[i].value;
                obj.estado=estado[i].value;
                obj.comentarioSupervisor=comentario[0].value;
                arrayJustificaciones.push(obj);
            }
        }
    }
    else{
     
        for(var i=0;i<arrayCheck.length;i++){
            if( arrayCheck[i].checked) {

                var obj=new Object();
                obj.id=arrayCheck[i].value;
                obj.estado=estadoTemporal[0].value;
                obj.comentarioSupervisor=comentario[0].value;
                arrayJustificaciones.push(obj);
            }
        }

    }

    $.ajax({
        url: '/justificacionMasa',
        type: 'POST',
        dataType : "json",
        data:{vector:arrayJustificaciones},
        success: function(data) {
           location.href="/gestionarEventos";
        },
        error: function(){
            alert("Error al eliminar justificacion.");
        }
    });
       
      
});