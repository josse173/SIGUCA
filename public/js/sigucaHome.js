
$(document).ready(function(){

  var cal = new CalHeatMap();
  cal.init({
    itemSelector: "#cal",
    cellSize: 3,
    range: 2,
    cellSize: 20,
    tooltip: true,
    legendColors: ["gray","green"],
    domain: "week",
    subDomain: "hour",
    colLimit: 24,
    cellPadding: 8,
    verticalOrientation: true,
    legend: [2, 4, 6, 8],
	legendColors: ["#B2E9B2", "#232181"],
    label: {
		position: "right",
		width: 500,
		offset: {x: 10, y: 30}
	},
    previousSelector: "#previous",
    nextSelector: "#next"

   
   });

cal.highlight(new Date(2014, 5, 18));

// Add January 5th to already highlighted dates
cal.highlight(cal.options.highlight.push(new Date(2014, 5, 14)));

});


