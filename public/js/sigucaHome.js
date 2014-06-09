$(document).ready(function(){


var cal = new CalHeatMap();
cal.init({
    itemSelector: "#cal",
    domain: "day",
    subDomain: "hour",
    data: "/js/datas-years.json",
    start: new Date(2000, 0, 5),
    cellSize: 24,
    range: 7,
    previousSelector: "#example-c-PreviousDomain-selector",
    nextSelector: "#example-c-NextDomain-selector",
    legend: [2, 4, 6, 8]
});
cal.highlight(new Date(2014, 5, 18));

// // Add January 5th to already highlighted dates
cal.highlight(cal.options.highlight.push(new Date(2014, 5, 14)));

});





//   var cal = new CalHeatMap();
//   cal.init({
//     itemSelector: "#cal",
//     cellSize: 3,
//     range: 2,
//     cellSize: 20,
//     tooltip: true,
//     legendColors: ["gray","green"],
//     domain: "week",
//     subDomain: "hour",
//     colLimit: 24,
//     cellPadding: 8,
//     verticalOrientation: true,
//     legend: [2, 4, 6, 8],
// 	legendColors: ["#B2E9B2", "#232181"],
//     label: {
// 		position: "right",
// 		width: 500,
// 		offset: {x: 10, y: 30}
// 	},
//     previousSelector: "#previous",
//     nextSelector: "#next"

   
//    });




