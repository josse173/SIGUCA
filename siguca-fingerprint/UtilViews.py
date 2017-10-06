#Importaciones
from Tkinter import *
from UtilImg import UtilImg
from threading import Thread
import time

#Clase dedicada a administrar las distintas vistas del sistema
class UtilViews:
    
    '''
        Se inicializan metodos generales para administrar las vistas
    '''

    def __init__(self, instIndex):
        self.instIndex = instIndex
        #self.instUtilImg = UtilImg.UtilImg()

    #Inicializa las propiedades generales
    def initRoot(self):
        self.root = Tk()
        self.root.attributes("-fullscreen", True)
        self.root.config(background = "black", cursor="none", width=300, height=300)
        
        self.frame = Frame(self.root)
        self.frame.pack()


    #Muestra la vista
    def showRoot(self):
        self.root.mainloop()

    #Destrueye la vista e inicializa las propiedades generales
    def destroyRoot(self):
        print "Entro a destruir" 
        #self.frame.quit()
        #self.frame.destroy()
        self.root.destroy()
        #print "termino"
   
    #Actualiza la hora en tiempo real
    def updateTimeText(self):
        tem = 1
        while(tem):
        #    try:
                time.sleep(1)

                if self.instIndex.semaforo == True:
                    print "222"
                    self.destroyRoot()
                    tem = 0
#                    exit(0)
                #current = time.strftime("%I:%M:%S %p")
                #self.lblMessage.configure(text=current)
                #time.sleep(1)
         #   except Exception as e:
                print "Termina reloj"
                #tem = 0
          

    '''
       Se construyen las vistas a utilizar
    '''
    
    #Vista principal
    def viewPrincipal(self):
        #Se inicializa la vistaupdateTimeText(self):   
        self.initRoot()
 
        #Label
        lblMessage = Label(self.root, text="", font=("Helvetica",33))
        
        lblMessage.config(background="black", fg="white")
        lblMessage.pack()

        #Ejecuta Hilo para actualizar la hora en tiempo real
        #subproceso = Thread(target=self.updateTimeText)
        #subproceso.start()
        
        #Muestra la imagen
        photo2 = UtilImg().getImageURL("siguca.gif")
        lblImg2 = Label(self.root,image=photo2,bd=0).pack()

        #Ejecuta Hilo para actualizar la hora en tiempo real
        subproceso = Thread(target=self.updateTimeText)
        subproceso.start()

       
        #label indicativo
        lblIndication = Label(self.root, text="Coloque su dedo en el dispositivo.", font=("Helvetica",33))
        lblIndication.config(background="black", fg="white")
        lblIndication.pack()
 
        #Muestra vista
        self.showRoot()
