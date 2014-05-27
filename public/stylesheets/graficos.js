

$(document).ready(function(){
  var cal = new CalHeatMap();
  cal.init({
    itemSelector: "#graf",
    cellSize: 3,
    range: 7,
    cellSize: 20,
    tooltip: true,
    legendColors: ["gray","green"],
    domain: "day",
    colLimit: 24,
    cellPadding: 8,
    verticalOrientation: true,
    legend: [1, 2, 3, 4],
	legendColors: ["#B2E9B2", "#232181"],
    label: {
		position: "right",
		width: 500,
		offset: {x: 10, y: 30}
	}

   
   });

cal.highlight(new Date(2014, 5, 18));

// Add January 5th to already highlighted dates
cal.highlight(cal.options.highlight.push(new Date(2014, 5, 14)));
});
