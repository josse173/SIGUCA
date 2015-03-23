
    //#1 Declaramos el objeto socket que se conectará en este caso a localhost
    var socket = io.connect('http://localhost:3000');


    //#3 Si estamos conectados, muestra el log y cambia el mensaje
    socket.on('connected', function () {
        console.log('Conectado!');
    });

    socket.on('listaCierre', function(cierre){
        var stats = {};
        for (var d in cierre) {
            stats[cierre[d].epoch] = cierre[d].estado;
        }
        calendario(stats);
    });


    //#6 Si nos desconectamos, muestra el log y cambia el mensaje.
    socket.on('disconnect', function () {
        console.log('Desconectado!');
    });


function calendario(stats){

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
        data: stats,//"/js/datas-years.json",
        previousSelector: "#previous",
        nextSelector: "#next",
        highlight: "now", //se puede quitar mas adelante, señala la hora actual.
        legend: [2, 5, 10],
        legendCellSize: 15,
        legendColors: {
            min: "#95EE6B",//"#74D943",//"#00C322",
            max: "#F66F89",//"#EA4868",//"#FF0D00",
            solExtra: "yellow",
            empty: "#620CAC",
        },
        /*legendTitleFormat: {
            lower: "Normal",
            inner: "Permiso",
            solExtra: "Horas Extra",
            upper: "10-*",
        },*/
        itemName: ["", ""]
    });
    // cal.highlight(new Date(2014, 5, 18));

    // // // Add January 5th to already highlighted dates
    // cal.highlight(cal.options.highlight.push(new Date(2014, 5, 14)));

};