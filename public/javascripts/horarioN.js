function disableElemnts(){
	if(document.getElementById("jFija").checked){
		document.getElementById("hEntrada").disabled = false;
	}
}
$(document).ready(function (){

   //Este objeto agrega el reloj al elemento con id = flipClock
   var cal = new CalHeatMap($('#grafico');
    cal.init({
      start: new Date(2000, 0),
      range: 12,
      domain: 'year',
      subDomain: 'month'
      
    });
});
