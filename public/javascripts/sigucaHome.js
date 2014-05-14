

$(document).ready(function(){
  

  var cal = new CalHeatMap();
  cal.init({
    itemSelector: "#cal",
    cellSize: 3,
    domain: "day",
    subDomain: "x_day",
    range: 6,
    cellSize: 15,
    tooltip: true,
    legendColors: ["red","yellow"],
   });

});
