/**
* Dependencias del módulo
*/

var express = require('express');
//Aqui se define la ruta de carga de las imagenes  de la sección de configuración refierase a /routes/index.js  Línea 524 

var rutaDeCarga = "/mnt/siguca-imagenes/"
module.exports = function (app, config, passport) {

  app.set('showStackError', true);

  //Compress needs to be called high in the stack
  app.use(express.compress ({
    filter: function(req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
    },
    level: 9
  }));

  app.use(express.favicon(config.root + '/public/images/favicon.ico'));
  app.use(express.static(config.root + '/public'));

  app.use(express.logger('dev'));

  app.set('views', config.root + '/views');
  app.set('view engine', 'jade');

  app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.json());
    app.use(express.bodyParser({uploadDir:rutaDeCarga}));//Aqui se  llama l path definido al principio de este archivo
    app.use(express.cookieParser('your secret here'));
    app.use(express.methodOverride());
    app.use(express.session());
    //Use Passport Session
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(app.router);

    app.configure('development', function () {
      app.locals.pretty = true;
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });

    app.configure('production', function(){
        app.use(express.errorHandler());
    });
  });
};