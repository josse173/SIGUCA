window.onload = function(){
    try{
        var listElement = document.getElementsByClassName("activeControl");
        for(var cont = 0; cont < listElement.length; cont ++){
            if(listElement[cont].getAttribute("href") == window.location.pathname){
                listElement[cont].classList.add("btn-primary");
                listElement[cont].style.color = "#ffffff";

                //Valida si el elemento activado sea hija, en caso de serlo se activa el padre
                var size = listElement[cont].classList.length;
                for(var cont2 = 0; cont2 < size; cont2++){
                    var result = listElement[cont].classList.item(cont2).split("-");
                    if(result.length > 1 && result[0] == "son"){
                        document.getElementsByClassName("father-"+result[1])[0].classList.add("btn-primary");
                        document.getElementsByClassName("father-"+result[1])[0].style.color = "#ffffff";
                    }
                }
            }
        }
    }catch(err){
        alert(err);
    }
}   