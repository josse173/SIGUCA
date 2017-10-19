#Importaciones
from UtilViews import UtilViews
from threading import Thread
from UtilFingerprint import UtilFingerprint
from UtilBD import UtilBD
import time
import urllib
import socket

#La presente clase es el nucleo del sistema y toda accion 
#debe pasar por al menos una de estas funciones.
class Index:

    #Variable estatica
    semaforo = False
    idUser = ""
    tipoUsuario = ""
    flujo = "mark"#Lleva el control de cual flujo se ejecuta admin o marca
    result = "" #Utilizado para obtener datos desde subprocesos (Thread)
    sessionUser = ""
    sessionPassword = ""

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
    
    #Se ejecuta la vista referente a sesion
    def session(self):
        self.instUtilViews.viewSession()

    #Se ejecuta la vista administrativa
    def admin(self):
        self.instUtilViews.viewAdmin()

    #Obtiene el usuario a administrar
    def getUser(self,listUser):
        self.instUtilViews.viewGetUser(listUser)

    #Elimina una huella dactilar en especifico
    def deleteFingerprint(self, codUser):
       self.instUtilFingerprint.delete(codUser, self) 

    #Actualiza la huella dactilar de un usuario especifico
    def updateFingerPrint(self):

        #Se verifica que no exista la huella dactilar
        self.semaforo = False
        fp = Thread(target=self.instUtilFingerprint.exist, args=(self,))
        fp.start()
        self.instUtilViews.viewGetFingerprint()
        time.sleep(3)
        self.semaforo = False
        if self.result == "timeout":
            self.message("ERROR! No se ha colocado el dedo en el dispositivo", "red")
        
        else:
            if self.result != "-1":
                self.deleteFingerprint(int(self.result))

            #Se verifica que se obtenga correctamente la huella y se almacena
            fp = Thread(target=self.instUtilFingerprint.save, args=(self,))
            fp.start()
            self.instUtilViews.viewGetFingerprint()

    #Obtiene ipv4
    def getIpv4(self):
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        s.connect(('<broadcast>', 0))
        return s.getsockname()[0]

    #Realiza la marca
    def markAction(self, markNum, typeUser, cod):
        ip = self.getIpv4()
        
        f = urllib.urlopen('http://'+self.server_ip+':'+self.app_port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of20obai&codTarjeta='+str(cod)+'&tipoMarca='+str(markNum)+'&tipo='+str(typeUser)+"&ipv4="+ip)
        data = f.read()
        self.message("Se ha realizado con exito", "light green") 
        
#---------------- Flujo en caso de marcar -----------
def runMark():
    
    #Al seleccionar una opcion se solicita la huella
    instIndex = Index()
    instIndex.getFingerprint()
    
    time.sleep(1)
    
    #print "El usuario es: " + str(instIndex.idUser)
    #Se muestra mensaje de error
    if instIndex.idUser == -1:  
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

#--------- Flujo administrativo del sistema -----------
def runAdmin():
    instIndex = Index()
    instIndex.session()
   
    resultSession = instUtilBD.verifySession(instIndex.sessionUser, instIndex.sessionPassword)

    if resultSession == "faildUser":
        instIndex.message("El usuario es incorrecto","orange")
        return 0
    elif resultSession == "faildPassword":
        instIndex.message("La contrasena es incorrecta","orange")
        return 0
    elif resultSession == "faildPermission":
        instIndex.message("ERROR, no cuenta con permisos para acceder","red")
        return 0

   
    #Si inicia sesion con exito
    instIndex.message("Bienvenido al modulo administrativo","orange")
    
    #Controla si seguir en el flujo administrativo o volver al flujo principal
    tem = True
    while tem == True:
        #Muestra el menu administrativo
        instIndex.admin()

        #Muestra el listado de empleados para aplicarles la accion
        if instIndex.actionAdmin == "delete" or instIndex.actionAdmin == "update":

            # En caso de elegir eliminar solo obtiene los usuarios
            # que tengan guardadas huellas en el sistema
            if instIndex.actionAdmin == "delete":
                listUserTem = instUtilBD.listUserFinger()
            elif instIndex.actionAdmin == "update":
                listUserTem = instUtilBD.listUser()

            #Se crea array solo con los valores que se desean mostrar
            listNameUser = list()
            for userTem in listUserTem:
                listNameUser.append(userTem["nombre"] + " " + userTem["apellido1"])
           
            #Muestra vista
            instIndex.getUser(listNameUser)
  
            if instIndex.actionAdmin != "Cancelar":
                userSelectedTem = listUserTem[instIndex.posUser]
            
                #Elimina la huella del usuario seleccionado
                if instIndex.actionAdmin == "delete":
                    instIndex.deleteFingerprint(userSelectedTem["codTarjeta"])
                    instUtilBD.updateCode(userSelectedTem["_id"], -1)
                    #print "El codigo del usuario es: " + (listUserTem[instIndex.posUser])["codTarjeta"]

                #Actualiza o inserta la huella de un usuario en especifico
                elif instIndex.actionAdmin == "update":
                    instIndex.semaforo = True
                    instIndex.updateFingerPrint()
                    time.sleep(2)#Da tiempo a que termine de ejecutarse el Thread
                    print "El id es " + str(instIndex.idUser)
                    instUtilBD.updateCode(userSelectedTem["_id"], instIndex.idUser)


        #El usuario decide volvr al flujo principal del sistema
        else:
            tem = False


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

    #Si el usuario decide realizar marcas
    if instIndex.flujo == "mark":
        runMark() #Llama al metodo que tiene el flujo para marcar
    
    #Si el usuario decide ingresar al modulo de configuracion
    else:
        runAdmin()
