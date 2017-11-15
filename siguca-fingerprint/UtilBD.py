#Importaciones
from pymongo import MongoClient
import bcrypt

#Clase dedicada a gestionar la coneccion a la Base de Datos
class UtilBD:

    #Se configuran las credenciales y atributos globales
    def __init__ (self):

#        self.server_IP = "10.42.30.13" #ip del servidor
        self.server_IP = "10.42.22.175" #ip del servidor

        self.port = "27017" #Puerto de mongoDB
        self.app_Port = "3000" #Puerto del servidor SIGUCA
        #self.browserSelection = "curl"

    #Coneccion a Base de Datos
    def connectBD(self):
        connection = MongoClient("mongodb://" + self.server_IP + ":" + self.port) 
        self.db = connection.sigucadb

    #Obtener lista Usuarios
    def listUser(self):
        self.connectBD()
        return list(self.db.usuarios.find({"estado":"Activo"},{"tipo":1,"codTarjeta":1,"_id":1, "nombre":1, "apellido1":1}))

    #Obtener lista de codigos de las tarjetas o llaveros de los usuarios
    def listCodUser(self):
        self.connectBD()
        return list(self.db.usuarios.find({"estado":"Activo"},{"tipo":1,"codTarjeta":1,"_id":0}))

    #Obtener usuario por medio de codigo
    def findCodUser(self, cod):
        self.connectBD()
        return self.db.usuarios.find_one({"codTarjeta": cod,"estado":"Activo"},{"_id":1, "nombre":1, "cedula":1, "apellido1": 1, "apellido2": 1, "email":1, "username": 1, "codTarjeta": 1, "tipo": 1, "password": 1})

    #Obtener los usuarios que tengan huella dactilar definida
    def listUserFinger(self):
        self.connectBD()
        return list(self.db.usuarios.find({"codTarjeta": {"$ne":-1}},{"tipo":1,"codTarjeta":1,"_id":1, "nombre":1, "apellido1":1}))

    #Actualiza el codTarjeta de un usuario especifico
    def updateCode(self, idUser, code):
        self.connectBD()
        self.db.usuarios.update({"_id":idUser},{"$set":{"codTarjeta":code}})

    def verifySession(self, user, password):
        self.connectBD()

        #Password Encriptada
        hashed = bcrypt.hashpw(password, bcrypt.gensalt())
        
        #print "My password: " + hashed + " user: " +user+ " pass: " + password
        #Verifica contra la Base de datos
        listTem = list(self.db.usuarios.find({"estado":"Activo","username":user, "estado":"Activo"},{"tipo":1,"codtarjeta":1,"_id":1, "nombre":1, "apellido1":1, "password":1}))
        
        #Verifica el username
        if len(listTem) <= 0:
            return "faildUser"
        else:
            resultBD = listTem[0]    
            
            #Verifica el password
            if bcrypt.checkpw(password, str(resultBD["password"])):
                
                # La contrasena es corrrecta por lo que
                # verifica si tiene rol de administrador
                admin = False
                for tem in list(resultBD["tipo"]):
                    if tem == "Administrador":
                        admin =  True
            
                if admin == False:
                    return "faildPermission"
                else:
                    return "success"

            else:
                return "faildPassword"
