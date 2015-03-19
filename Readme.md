SIGUCA: Sistema de Gestión de Usuarios y Control de Asistencia

Se utiliza node.js y mongodb de base de datos para su instalación ingrese a este link: https://github.com/rodrigopolo/node-mongo-demo/tree/master/install_instructions

Modulos de Node.js
	- Express
		Es un framework de node.js se comunica con otros modulos y se realizan HTTP request del lado del servidor.
		Para aprender más visite el sitio http://expressjs.com/starter/hello-world.html

	- Passport
		Es el Middleware encargado de la autenticación en node.js. En siguca es utilizado para autentificar el usuario y su contraseña.
		Para aprender más visite el sitio http://passportjs.org/guide/

	- Mongoose
		Es el modulo que se encarga de comunicarse con la base de datos mongodb desde node.js
		Para aprender más visite el sitio http://mongoosejs.com/

	- Jade
		Es un lenguaje para escribir plantillas html.
		Para aprender más visite el sitio http://jade-lang.com/tutorial/

Para iniciar la aplicación, desde la terminal se ubica en la carpeta de siguca. Se instalan las dependencias antes de iniciar la aplicación por primera vez (sudo apt-get npm install), internamente se lee el package.json de SIGUCA, donde estan definidas las dependencias que se utilizarán. Se corre la aplicación (node app.js).
	Comandos:
		- sudo apt-get npm install
		- node app.js

MongoDB
	Es una base de datos no relacional la cual no utiliza SQL.
	Este link explica ampliamente la direncia entre SQL y noSQL http://code.tutsplus.com/articles/mapping-relational-databases-and-sql-to-mongodb--net-35650
	Esta es la lista de métodos que posee MongoDB http://docs.mongodb.org/manual/reference/method/

---------------------------------------------------------------------------------

Estructura de directorios:
	config
		Contiene las configuraciones principales de SIGUCA como las rutas y sesiones. 
	models
		Contiene los modelos de la base de datos
	public
		Contiene los archivos estáticos que serán entregados al cliente
	routes
		Contiene las clases generadoras de contenido
	views
		Contiene las plantillas Jade de cada vista