$("#diaFinal,#diaInicio").change(function(e){

    try{
        var fecha1 = new Date(document.getElementById("diaInicio").value);
        var fecha2 = new Date(document.getElementById("diaFinal").value);
        var diasDif = fecha2.getTime() - fecha1.getTime();
        var dias = Math.round(diasDif/(1000 * 60 * 60 * 24));

        dias++;
        if(dias && dias!= null){
            document.getElementById("lblnumDias").innerHTML = "Días: " + dias;
            document.getElementById("cantidadDias").value = dias;
        }


    }catch(error){
        // alert(error.message);
    }
});
