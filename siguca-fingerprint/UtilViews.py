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
        self.photo = None
        self.root.destroy()
   
    #Actualiza la hora en tiempo real
    def updateTimeText(self):
        tem = 1
        while(tem):
            time.sleep(1)
           
            current = time.strftime("%I:%M:%S %p")
            self.lblMessage.configure(text=current)  
            if self.instIndex.semaforo == True:
                self.destroyRoot()
                tem = 0   

    '''
       Se construyen las vistas a utilizar
    '''
    
    #Vista principal
    def viewPrincipal(self):
        #Se inicializa la vistaupdateTimeText(self):   
        self.initRoot()
 
        #Label
        self.lblMessage = Label(self.root, text="00:00:00", font=("Helvetica",33))
        
        self.lblMessage.config(background="black", fg="white")
        self.lblMessage.pack()

        #Muestra la imagen
        self.photo = UtilImg().getImageURL("siguca.gif",self.root)
        lblImg2 = Label(self.root,image=self.photo,bd=0).pack()

        #Ejecuta Hilo para actualizar la hora en tiempo real
        subproceso = Thread(target=self.updateTimeText)
        subproceso.start()

       
        #label indicativo
        lblIndication = Label(self.root, text="Coloque su dedo en el dispositivo.", font=("Helvetica",33))
        lblIndication.config(background="black", fg="white")
        lblIndication.pack()
 
        #Muestra vista
        self.showRoot()
