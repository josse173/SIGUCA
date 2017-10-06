#Importaciones
from pymongo import MongoClient

#Clase dedicada a gestionar la coneccion a la Base de Datos
class UtilBD:

    #Se configuran las credenciales y atributos globales
    def __init__ (self):

#        self.server_IP = "10.42.30.13" #ip del servidor
        self.server_IP = "10.42.22.176" #ip del servidor

        self.port = "27017" #Puerto de mongoDB
        self.app_Port = "3000" #Puerto del servidor SIGUCA
        #self.browserSelection = "curl"

    #Coneccion a Base de Datos
    def connectBD(self):
        connection = MongoClient("mongodb://" + self.server_IP + ":" + self.port) 
        self.db = connection.sigucadb

    #Obtener lista de codigos de las tarjetas o llaveros de los usuarios
    def listCodUser(self):
        self.connectBD()
        return list(self.db.usuarios.find({},{"tipo":1,"codTarjeta":1,"_id":0}))

    #Obtener usuario por medio de codigo
    def findCodUser(self, cod):
        self.connectBD()
        return self.db.usuarios.find_one({"codTarjeta": cod},{"_id":1, "nombre":1, "cedula":1, "apellido1": 1, "apellido2": 1, "email":1, "username": 1, "codTarjeta": 1, "tipo": 1, "password": 1})



    



