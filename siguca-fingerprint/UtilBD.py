#Importaciones
from pymongo import MongoClient

#Clase dedicada a gestionar la conección a la Base de Datos
class UtilBD:

    #Se configuran las credenciales y atributos globales
    def __init__ (self):

        self.server_IP = "10.42.30.13" #ip del servidor
        self.port = "27017" #Puerto de mongoDB
        self.app_Port = "3000" #Puerto del servidor SIGUCA
        #self.browserSelection = "curl"


    #Conección a Base de Datos
    def connectBD(self):
        connection = MongoClient("mongodb://" + server_IP + ":" + port) 
        self.db = connection.sigucadb

    #Obtener lista de codigos de las tarjetas o llaveros de los usuarios
    def listCodUser(self):
        return list(self.collection.find({},{"tipo":1,"codTarjeta":1,"_id":0}))


    



