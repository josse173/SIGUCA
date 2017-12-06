
$(".horario").click(function(){
    var cantidadCheck=document.getElementsByClassName("horario");
    var contador=0;
    for(var i=0;i<cantidadCheck.length;i++){
        if( cantidadCheck[i].checked) {
            contador++;
        }
    }
    if(contador>0){
        $("#hPersonalizado").css('display','block');
        $("#lbPersonalizado").css('display','block');
        $("#hLibre").css('display','block');
        $("#titulo").css('display','block');
        $("#lbFijo").css('display','block');
        $("#hFijo").css('display','block');
        $("#lbLibre").css('display','block');
        $("#horarioMasa").css('display','block');

    }else{
        $("#titulo").css('display','none');
        $("#hFijo").css('display','none');
        $("#hLibre").css('display','none');
        $("#lbFijo").css('display','none');
        $("#lbLibre").css('display','none');
        $("#horarioMasa").css('display','none');
    }
});

$("#horarioMasa").click(function() {
    
    var usuariosId=document.getElementsByClassName("horarioId");
    var hLibre= document.getElementsByClassName("hLibre");
    var hFijo= document.getElementsByClassName("hFijo");
    var hPersonalizado= document.getElementsByClassName("hPersonalizado");
    var arrayHorarios=new Array();
   

    if(hLibre[0].value!=""){
        for(var i=0;i<usuariosId.length;i++){
            if( usuariosId[i].checked) {
                var obj=new Object();
                obj.id=usuariosId[i].value;
                obj.idHorario=hLibre[0].value;
                arrayHorarios.push(obj);
         
            }
        }

        $.ajax({
            url: '/horarioMasaLibre',
            type: 'POST',
            dataType : "json",
            data:{vector:arrayHorarios},
            success: function(data) {
                location.href="/horarioMasa";
            },
            error: function(){
                alert("Error al agregar el horario.");
            }
        });
       
    }else if(hFijo[0].value!=""){
       
        for(var i=0;i<usuariosId.length;i++){
            if(usuariosId[i].checked) {
                var obj=new Object();
                obj.id=usuariosId[i].value;
                obj.idHorario=hFijo[0].value;
                arrayHorarios.push(obj);
         
            }
        }
        $.ajax({
            url: '/horarioMasaFijo',
            type: 'POST',
            dataType : "json",
            data:{vector:arrayHorarios},
            success: function(data) {
                location.href="/horarioMasa";
            },
            error: function(){
                alert("Error al agregar el horario.");
            }
        });
    }
    else if(hPersonalizado[0].value!=""){
      
         for(var i=0;i<usuariosId.length;i++){
             if(usuariosId[i].checked) {
                 var obj=new Object();
                 obj.id=usuariosId[i].value;
                 obj.idHorario=hPersonalizado[0].value;
                 arrayHorarios.push(obj);
          
             }
         }
         $.ajax({
             url: '/horarioMasaPersonalizado',
             type: 'POST',
             dataType : "json",
             data:{vector:arrayHorarios},
             success: function(data) {
                 location.href="/horarioMasa";
             },
             error: function(){
                 alert("Error al agregar el horario.");
             }
         });
     } 
    
    
    else if(hLibre[0].value=="" && hFijo[0].value=="" && hPersonalizado[0].value==""){
        for(var i=0;i<usuariosId.length;i++){
            if(usuariosId[i].checked) {
                var obj=new Object();
                obj.id=usuariosId[i].value;
                obj.idHorario=hFijo[0].value;
                arrayHorarios.push(obj);
         
            }
        }
        $.ajax({
            url: '/horarioMasaSinHorario',
            type: 'POST',
            dataType : "json",
            data:{vector:arrayHorarios},
            success: function(data) {
                location.href="/horarioMasa";
            },
            error: function(){
                alert("Error al agregar el horario.");
            }
        });
    }

});

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
        $("#justificacionDeleteMasa").css('display','block');
        $("#justificacionesTitulo").css('display','block');
       
    
     
    }else{
        $("#comentarioDelSupervisor").css('display','none');
        $("#justificarMasa").css('display','none');
        $("#estadoMasa").css('display','none');
        $("#justificacionDeleteMasa").css('display','none');
        $("#justificacionesTitulo").css('display','none');
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
           location.href="/gestionarEventos/justificaciones";
        },
        error: function(){
            alert("Error al eliminar justificacion.");
        }
    });
       
      
});







$("#justificacionDeleteMasa").click(function() {

    var arrayCheck=document.getElementsByClassName("justificarArray");
    var arrayJustificaciones=new Array();
    for(var i=0;i<arrayCheck.length;i++){
            if( arrayCheck[i].checked) {
              
                var obj=new Object();
                obj.id=arrayCheck[i].value;
                
                arrayJustificaciones.push(obj);
            }
    }
 
    
     $.ajax({
        url: '/justificacionDeleteMasa',
        type: 'POST',
        dataType : "json",
        data:{vector:arrayJustificaciones},
        success: function(data) {
           location.href="/gestionarEventos/justificaciones";
        },
        error: function(){
            alert("Error al eliminar justificacion.");
        }
    });
   
   
    
    

});