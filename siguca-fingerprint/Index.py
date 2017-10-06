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

#Llamado a la clase principal

print "Vista Principal"
instIndex = Index()
instIndex.home()
#print "idUser: " + str(instIndex.idUser)

#Llamado a la clase principal
instIndex = Index()
instIndex.home()
#print "idUser: " + str(instIndex.idUser)
