#Importaciones
from UtilViews import UtilViews
from threading import Thread
from UtilFingerprint import UtilFingerprint

#La presente clase es el nucleo del sistema y toda accion 
#debe pasar por al menos una de estas funciones.
class Index:

    #Variable estatica
    semaforo = False
    idUser = 0

    def __init__(self):
        self.instUtilViews = UtilViews(self)
        self.instUtilFingerprint = UtilFingerprint(self)
        
    def home(self):
        #Muestra la vista de forma paralela
        fp = Thread(target=self.instUtilFingerprint.search, args=(self,)) 
        fp.start()
        
        self.instUtilViews.viewPrincipal()

        #Pone en escucha al fingerprint
        #userTem = self.instUtilFingerprint.search()
        
        #Se proccesa el usuario UNA VES QUE SE HA LEIDO UNA HUELLA  
        if(self.idUser != 0):
            print "El usuario es: " + str(self.idUser)
        else:
            print "No se encuentran coincidencias"
            #self.instUtilViews.destroyRoot()
            #Muestra la vista de forma paralela

            #Muestra la vista de forma paralela
            #viewTem = Thread(target=self.instUtilViews.viewPrincipal)
            #viewTem.start()

        #viewTem.join()            
        print "luego"
            

#Llamado a la clase principal
Index().home()
Index().home()
