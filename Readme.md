
SIGUCA
=========

SIGUCA is an acronym for User Managnent and Assistance Control System, in spanish (Sistema de Gestion de Usuarios y Control de Asistencia). The based aplications are [MongoDB][mongodb], [Node.js][nodejs], [Express][express], and [Jade][jade]. 


## Prerequisite Technologies

-Linux 
-Node.Js : sudo apt install nodejs nodejs-legacy
-MongoDB: sudo apt install mongodb
-npm: sudo apt install npm


## Technologies 

*[Node.js][nodejs]* 
	Node.js is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications. 

*[Express][express]*
	Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. 

*[MongoDB][mongodb]*
	MongoDB is a NoSQL database, go through MongoDB Official Website and learn more about it. As an additional help, here is a guide than widely explain the differences betweend [SQL and NoSQL ][guideSQL]

*[JadeJS][jade]* 
		Jade is a templating engine,designed primarily for server side templating in node.js .

### Additional Tools

*[MongooseJS][mongoose]* - The mongodb node.js driver in charge of providing elegant mongodb object modeling for node.js. Provides a straight-forward, schema-based solution to modeling your application data and includes built-in type casting, validation, query building, business logic hooks and more, out of the box

*[PassportJS][passport]* - Passport is authentication middleware for Node.js. Extremely flexible and modular, Passport can be unobtrusively dropped in to any Express-based web application.

*[Bootstrap][bootstrap]* - The most popular HTML, CSS, and JS framework for developing responsive, mobile first projects.

*[Node-cron][cron]* - Is an openSource project for Timed tasks.

Install
==========

  -  Download from: https://github.com/Greencorecr/SIGUCA.git
  -  Open the SIGUCA folder: cd SIGUCA
  -  install dependencies: npm install 
  -  Create the database: into the folder "DB" use the command mongorestore

/////////////////////////////////////////
Para restaurar una sola base de datos, debe proporcionar la ruta al directorio de volcado como parte de la mongorestorelínea de comando.
Por ejemplo:
# Backup the training database
mongodump --db training
# Restore the training database to a new database called training2
mongorestore --db training2 dump/training
La --dbopción para mongodumpespecifica la base de datos de origen para volcar.
La --dbopción para mongorestoreespecifica la base de datos de destino para restaurar.
/////////////////////////////////////////

  -  Start the web application: into the folder SIGUCA, use the command "nodejs app.js"

### Files structure

**Server**

Packages are registered in the **app.js** 
Defines package name, version, `start=node app.js` and dependencies in the **package.json**   

All of the Server side code resides in the `/server` directory.

    Server
    --- config        # Configuration files
    --- models        # Database Schema Models
    --- routes        # Rest api endpoints for routing
    --- views         # Jade templates for html

**Client**

All of the Client side code resides in the `/public` directory.

    public            
    --- font          # All the fonts used
    --- images        # Images used
    --- js            # JavaScript
    --- stylesheets   # CSS

License
==========

***AGPL License***

[downloadNodejs]:http://nodejs.org/download/
[downloadMongodb]:http://www.mongodb.org/downloads
[nodejs]:http://www.nodejs.org/
[nodeschool]:http:nodeschool.io/#workshoppers
[mongodb]:http://www.mongodb.org/
[manualMongodb]:http://docs.mongodb.org/manual
[express]:http://expressjs.com/starter/hello-world.html
[jade]:http://jade-lang.com/tutorial/
[guide]:https://github.com/rodrigopolo/node-mongo-demo/tree/master/install_instructions
[guideSQL]:http://code.tutsplus.com/articles/mapping-relational-databases-and-sql-to-mongodb--net-35650
[passport]:http://passportjs.org/guide/
[mongoose]:http://mongoosejs.com/
[bootstrap]:http://getbootstrap.com/
[cron]:https://github.com/Mireya538/node-cron
