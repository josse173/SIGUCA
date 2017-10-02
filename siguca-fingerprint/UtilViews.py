#Importaciones
from Tkinter import *
import UtilImg
from threading import Thread
import time

def updateTimeText(self): 
    while(1):
        current = time.strftime("%I:%M:%S %p")
        self.lblMessage.configure(text=current)
        time.sleep(1)


class UtilViews:
    
    '''
        Se inicializan metodos generales para administrar las vistas
    '''

    def __init__(self):
        self.instUtilImg = UtilImg.UtilImg()

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
        self.frame.destroy()
        self.initRoot()
    
    '''
       Se construyen las vistas a utilizar
    '''
    
    #Vista principal
    def viewPrincipal(self):
        #Se inicializa la vistaupdateTimeText(self):   
        self.initRoot()
    
        #Label
        self.lblMessage = Label(self.root, text="", font=("Helvetica",33))
        self.lblMessage.config(background="black", fg="white")
        self.lblMessage.pack() 

        #Ejecuta Hilo para actualizar la hora en tiempo real
        subproceso = Thread(target=updateTimeText, args=(self,))
        subproceso.start()
        
        #Muestra la imagen
        photo = self.instUtilImg.getImageURL("siguca.gif")
        Label(self.root,image=photo,bd=0).pack()

        #Muestra vista
        self.showRoot()
       
