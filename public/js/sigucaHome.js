
var socket = require('socket.io-client')('http://localhost');;

    socket.emit('solicitaCierre', {a:"1"});

    socket.on('listaCierre', function(cierre){
        console.log("Obtuve los cierres: "+ JSON.stringify(cierre));
    });

$(document).ready(function(){

    var dd = {"1426710016":7,"1426450814":3};

    // var stats = {};
    // for (var d in estadoCierre) {
    //     stats[estadoCierre[d].fecha] = estadoCierre[d].estado;
    // }
    var cal = new CalHeatMap();
    cal.init({
        itemSelector: "#cal",
        domain: "month",
        subDomain: "x_day", //"x_hour",
        subDomainTextFormat: "%d",
        range: 4,
        cellSize: 24,
        domainGutter:   5, // separa los dias
        tooltip: true, // muestra el fecha y hora de cada cuadro
        //start: new Date(2015, 0, 2), //default es el día de hoy
        data: dd,//"/js/datas-years.json",
        previousSelector: "#previous",
        nextSelector: "#next",
        highlight: "now", //se puede quitar mas adelante, señala la hora actual.
        legend: [2, 4, 6],
        legendCellSize: 15,
        legendColors: {
            min: "#95EE6B",//"#74D943",//"#00C322",
            max: "#F66F89",//"#EA4868",//"#FF0D00",
            solExtra: "yellow",
            empty: "gray",
        },
        legendTitleFormat: {
            lower: "Tardía",
            inner: "Permiso",
            solExtra: "Horas Extra",
            upper: "Ausencia",
        },
        itemName: ["", ""]
    });
    // cal.highlight(new Date(2014, 5, 18));

    // // // Add January 5th to already highlighted dates
    // cal.highlight(cal.options.highlight.push(new Date(2014, 5, 14)));

});


// $(document).ready(function(estadoCierre){
//     $.getJSON( "/escritorio", function( estadoCierre ) {

//         for(i in estadoCierre){
//            alert(i.fecha+i.estado);
//         }
//     });
// });

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




