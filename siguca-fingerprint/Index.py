#Importaciones
from UtilViews import UtilViews
from threading import Thread
from UtilFingerprint import UtilFingerprint
from UtilBD import UtilBD

#La presente clase es el nucleo del sistema y toda accion 
#debe pasar por al menos una de estas funciones.
class Index:

    #Variable estatica
    semaforo = False
    idUser = 0

    def __init__(self):
        self.instUtilViews = UtilViews(self)
        self.instUtilFingerprint = UtilFingerprint(self)
                
    #Muestra la vista principal
    def home(self): 
        fp = Thread(target=self.instUtilFingerprint.search, args=(self,)) 
        fp.start()
        
        self.instUtilViews.viewPrincipal()

    #Muestra un mensaje
    def message(self, message, color):
        self.instUtilViews.viewMessage(message, color)




#---------------- Flujo pincipal -----------
instUtilBD = UtilBD()

while 1:
    #Llamado a la clase principal
    print "Vista Principal"
    instIndex = Index()
    instIndex.home()
    #print "idUser: " + str(instIndex.idUser)

    #Se muestra mensaje de error
    if str(instIndex.idUser) == "0": 
        print "No se han encontrado coincidencias. \nVista Principal"
        instIndex = Index()
        instIndex.message("No se han encontrado coincidencias.", "red")
    
    #Se busca el codigo de FingerPrint en la BD
    else:
        user = instUtilBD.findCodUser(instIndex.idUser)
        instIndex = Index()
        if user != None:
            print "Mensaje Bienvenida"
            instIndex.message("Bienvenido " + user["nombre"] + " " + user["apellido1"], "light green")

            #Verifica si tiene mas de un usuario
            if(len(user["tipo"]) == 1):
                instIndex.message("Vista para marcar como " + (user["tipo"])[0], "orange") 
                #print (user["tipo"])[0]
            else:
                print (user["tipo"])[0]
                instIndex.message("Seleccionar uno de los tipos", "orange") 

        else:
            instIndex.message("No se encontraron coincidencias", "red") 
