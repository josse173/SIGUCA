#Importaciones
from UtilViews import UtilViews
from threading import Thread
from UtilFingerprint import UtilFingerprint
from UtilBD import UtilBD
import time
import urllib

#La presente clase es el nucleo del sistema y toda accion 
#debe pasar por al menos una de estas funciones.
class Index:

    #Variable estatica
    semaforo = False
    idUser = ""
    tipoUsuario = ""

    #Credenciales
    server_ip='10.42.22.176'
    port = '27017'
    app_port = '3000'
    browserSelection = 'curl'

    def __init__(self):
        self.instUtilViews = UtilViews(self)
        self.instUtilFingerprint = UtilFingerprint(self)
    
    #Muestra la vista de fondo
    def viewFondo(self):
        self.instUtilViews.viewFondo()

    #Muestra la vista principal
    def home(self):
        print "Vista Principal"      
        self.instUtilViews.viewPrincipal()

    #Muestra un mensaje
    def message(self, message, color):
        print "Vista Mensaje"
        self.instUtilViews.viewMessage(message, color)

    #Solicita una huella del fingerprint
    def getFingerprint(self):
        print "Solicita Fingerprint"
        fp = Thread(target=self.instUtilFingerprint.search, args=(self,))
        fp.start()

        self.instUtilViews.viewGetFingerprint()
      
    #En caso de tener mas de un rol, debe seleccionar uno
    def obtieneTipoUsuario(self, listTipoUsuario):
        print "Obtiene tipo de usuario"
        return self.instUtilViews.viewObtieneTipoUsuario(listTipoUsuario)

    #Seleccionar la marca a realizar
    def mark(self):
        print "Vista Marcar"
        markTem = self.instUtilViews.viewMark()
        return markTem

    #Realiza la marca
    def markAction(self, markNum, typeUser, cod):
        f = urllib.urlopen('http://'+self.server_ip+':'+self.app_port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of20obai&codTarjeta='+str(cod)+'&tipoMarca='+str(markNum)+'&tipo='+str(typeUser))
        data = f.read()
        self.message("Se ha realizado con exito", "light green") 
        

#---------------- Flujo en caso de marcar -----------
def runMark():
    
    #Al seleccionar una opcion se solicita la huella
    instIndex = Index()
    instIndex.getFingerprint()
    
    time.sleep(1)

    #Se muestra mensaje de error
    if str(instIndex.idUser) == "0":  
        instIndex = Index()
        instIndex.message("No se han encontrado coincidencias.", "red")
    
    #Se busca el codigo de FingerPrint en a BD
    else:
        user = instUtilBD.findCodUser(instIndex.idUser)
        instIndex = Index()
        if user != None:
            #Mensaje de bienvenida
            instIndex.message("Bienvenido " + user["nombre"] + " " + user["apellido1"], "light green")

            #Solo tiene un rol
            if(len(user["tipo"]) == 1):
                tipoUsuario = (user["tipo"])[0]

            #Seleccionar uno de los roles para marcar
            else:
                instIndex.obtieneTipoUsuario(user["tipo"])
                tipoUsuario = instIndex.tipoUsuario
            
            #Una ves seleccionado el tipo se marca
            markTem = instIndex.mark()
            if markTem:    
                instIndex.markAction(markTem, tipoUsuario, user["codTarjeta"])
            #print "La marca seleccionada es: " + str(markTem)

        else:
            instIndex.message("No se encontraron coincidencias", "red") 




# ========== Ejecucion del sistema ==========
instUtilBD = UtilBD()
user = ""
tipoUsuario = ""

#Se muestra la vista de fondo
fp = Thread(target=Index().viewFondo)
fp.start()

while 1:
    #Llamado a la clase principal
    instIndex = Index()
    instIndex.home()

    runMark() #Llama al metodo que tiene el flujo para marcar
