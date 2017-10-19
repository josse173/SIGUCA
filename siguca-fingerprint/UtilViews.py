#Importaciones
from Tkinter import *
from UtilImg import UtilImg
from threading import Thread
import time

#Clase dedicada a administrar las distintas vistas del sistema
class UtilViews:

    markS = "" #Almacena la marca seleccionada por el usuario
    lblMessage = None
    '''
        Se inicializan metodos generales para administrar las vistas
    '''

    def __init__(self, instIndex):
        self.instIndex = instIndex

    #Inicializa las propiedades generales
    def initRoot(self):
        self.root = Tk()
        self.root.attributes("-fullscreen", True)
#        self.root.config(background = "black", cursor="none", width=300, height=300)
        self.root.config(background = "black", width=300, height=300)

        
        self.frame = Frame(self.root)
        self.frame.pack()

    #Muestra la vista
    def showRoot(self):
        self.root.mainloop()
        self.root.quit()
 
    '''
        Procesos paralelos
    '''
    #Actualiza la hora en tiempo real
    def updateTimeText(self):
        tem = 1
        while(tem):
            time.sleep(1)
           
#            current = time.strftime("%I:%M:%S %p")
            try:
                if(self.instIndex.semaforo ==  False):
                    current = time.strftime("%I:%M:%S %p")
                    self.lblMessage.configure(text=current)  
 
            except NameError:
                    tem = 0

    #Muestra un cronometro hacia atras
    def chronometerText(self,timeTem):
        while(timeTem >= 1):
            time.sleep(1) 
            self.lblMessage.configure(text=str(timeTem)) 
            #ime.sleep(1) 
            timeTem -= 1

        self.instIndex.semaforo = True

    '''
        Acciones de los botones
    '''
    #Ingresa al sistema para realizar marcas o a la parte administrativa
    def ingresar(self, action):
        self.instIndex.flujo = action
        self.instIndex.semaforo = True
        self.root.destroy()

    #Obtiene el rol seleccionado en la lista de roles del usuario
    def obtieneTipoSeleccionado(self, listBox):
        listSeleccionado = listBox.curselection()
        tipo = ""
        for tem in listSeleccionado:
            tipo = listBox.get(tem)
            if tipo != "":
                self.instIndex.tipoUsuario = tipo
            else:
                self.instIndex.tipoUsuario = tipo
        self.root.iconify()

    #Realiza la marca seleccionada por el usuario
    def actionMark(self, markAction):
        self.markS = markAction
        self.root.iconify()

    #Realiza la accion del logueo
    def actionSession(self, user, password):
        print "Bienvenido usuario " + user + " password " + password
        self.root.destroy()

    #Realiza las acciones de la seccion administrativa
    def actionAdmin(self, actionAdmin):
        self.instIndex.actionAdmin = actionAdmin
        self.root.destroy()

    #Identifica el usuario seleccionado
    def getUserSelect(self, listBox):
        posSelected = listBox.curselection()
        self.instIndex.posUser = posSelected[0]
        #print "La posicion seleccionada es " + str(posSelected[0])
        self.root.destroy()

    '''
       Se construyen las vistas a utilizar
    '''

    #---------- Vista Fondo -----------
    def viewFondo(self):
        #Se inicializa la vistaupdateTimeText(self):   
        self.initRoot()
               
        canvas = Canvas(self.root, width= 250, height=20, bg="#000000")
        canvas.pack()
        canvas.place(x=480, y=500)

        
        ball = canvas.create_rectangle(-40, 0, 200, 20, fill='green')
        while True:

            for x in range(0, 20):
                canvas.move(ball, 5, 0)
                pos = canvas.coords(ball)
                self.root.update()
                time.sleep(0.02)

            for x in range(0, 20):
                canvas.move(ball, -5, 0)
                pos = canvas.coords(ball)
                self.root.update()
                time.sleep(0.02)
            
        self.showRoot()

    #---------- Vista principal -----------
    def viewPrincipal(self):
        #Se inicializa la vistaupdateTimeText(self):   
        self.initRoot()
 
        #Label
        self.lblMessage = Label(self.root, text="00:00:00", font=("Helvetica",25)) 
        self.lblMessage.config(background="black", fg="#bbbbbb")
        self.lblMessage.pack()

        #Muestra la imagen
        self.photo = UtilImg().getImageURL("siguca.gif",self.root)
        self.lblImg2 = Label(self.root,image=self.photo,bd=0).pack()

        #Ejecuta Hilo para actualizar la hora en tiempo real
        #subproceso = Thread(target=self.updateTimeText)
        #subproceso.start()
        
        #Boton para continuar
        btnIngresar = Button(self.root, text="Ingresar", command=lambda: self.ingresar("mark"), fg="white", activeforeground="white", activebackground="green", bg="#555555",width=20, height=2, bd=2, font="Helveltica 15 bold").place(x=500, y=500)
        
        #Boton para ingresar al modulo administrativo
        btnConf = Button(self.root, text="Administrar", command=lambda: self.ingresar("admin"), fg="#bbbbbb", activeforeground="white", activebackground="green", bg="#222222",width=20, height=2, bd=1, font="Helveltica 10 bold").place(x=730, y=540)


        #Muestra vista
        self.showRoot()

    #------- Vista MostrarMensaje ---------
    def viewMessage(self, message, color):   
        self.initRoot()
                
        Label(self.root, text=message, wraplength=650,  fg = color, bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()

        self.root.after(3000, lambda: self.root.destroy())   

        self.showRoot()

    #------- Vista Solicitar Fingerprint ---------
    def viewGetFingerprint(self):
        
        #Tiempo que se visualiza la vista
        timeView = 4
        
        self.initRoot()

        #Label
        self.lblMessage = Label(self.root, text="0", font=("Helvetica",33)) 
        self.lblMessage.config(background="black", fg="white")
        self.lblMessage.pack()

        #Ejecuta Hilo para actualizar la hora en tiempo real
        subproceso = Thread(target=self.chronometerText, args=(timeView,))
        subproceso.start()

                
        Label(self.root, text="Coloque su dedo en el dispositivo.", wraplength=650,  fg = "#228B22", bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()

        self.root.after((timeView*1000), lambda: self.root.destroy())

        #Muestra vista
        self.showRoot()

    #------- Vista Solicitar Tipo de usuario ---------
    def viewObtieneTipoUsuario(self, listTipo):
        self.initRoot()
        lblTitle = Label(self.root,text="Seleccione un tipo de usuario",bd="2",bg= "#000000", fg="#55aa55", font="Helveltica 30 bold").place(x=150,y=2)
        #Muestra los roles del usuario al cual le pertenece el llavin 
        listBox = Listbox(self.root,bd="1",fg="#888888", bg="#000000", font="Helveltica 30 bold",selectbackground="#999999",selectforeground="#ffffff",height=300,selectborderwidth=1, activestyle=NONE, justify="center")
        listBox.place(x=10,y=100)
        listBox.insert(0,*listTipo)
                
        buttonAceptar = Button(self.root,text="Aceptar",command= lambda: self.obtieneTipoSeleccionado(listBox),fg="white",activeforeground="white",activebackground="#008800",bg="#55aa55",width=15,height=2,bd=3,font="Helveltica 17 bold").place(x=500,y=200)

        self.root.after(5000, lambda: self.root.destroy())

        #Selecciona el primer usuario
        listBox.selection_set(0)

        self.showRoot() 

    #------- Optiene la marca del usuario ---------
    def viewMark(self): 
        #Se crea el entorno grafico  para realizar las marcas
        self.initRoot()
    
        #en cada boton se llama el metodo correspondiente con el parametro del codigo  obtenido por la lectura.
        button = Button(self.frame,text="       Entrada        ", command = lambda: self.actionMark(1),fg="white",activeforeground="white",activebackground="#446644",bg="green",width=22,height=3,bd=3,font="Helveltica 17 bold")
    
        button1 = Button(self.frame,text="        Salida        ", command =lambda:  self.actionMark(6),fg="white",activeforeground="white",activebackground="#446644",bg="green",width=22,height=3,bd=3,font="Helveltica 17 bold")
    
        button2 = Button(self.frame,text="   Salida a Receso   ", command =lambda:  self.actionMark(2),fg="white",activeforeground="white",activebackground="#cac251",bg="orange",width=22,height=3,bd=3,font="Helveltica 17 bold")
        
        button3 = Button(self.frame,text="   Entrada de Receso  ", command =lambda:  self.actionMark(3),fg="white",activeforeground="white",activebackground="#cac251",bg="orange",width=22,height=3,bd=3,font="Helveltica 17 bold")
        
        button4 = Button(self.frame,text="  Salida al Almuerzo  ", command =lambda:  self.actionMark(4),fg="white",activeforeground="white",activebackground="#4444ff",bg="blue",width=22,height=3,bd=3,font="Helveltica 17 bold")
        
        button5 = Button(self.frame,text="  Entrada del Almuerzo ", command =lambda: self.actionMark(5), fg="white",activeforeground="white",activebackground="#4444ff",bg="blue",width=22,height=3,bd=3,font="Helveltica 17 bold")

        button6 = Button(self.frame,text="Cancelar",command=lambda: self.root.destroy(),fg="white",activeforeground="white",activebackground="red",bg="#ff4444",width=47,height=3,bd=3,font="Helveltica 17 bold")
    
        button.grid(row=1,column=1)
        button1.grid(row=1,column=2)
        button2.grid(row=2,column=1)
        button3.grid(row=2,column=2)
        button4.grid(row=3,column=1)
        button5.grid(row=3,column=2)
        button6.grid(row=4,column=1, columnspan=15)
        
        try:
            self.root.after(4000, lambda: self.root.destroy())
        except NameError:
            pass

        self.root.mainloop()

        #Retorna la opcion seleccionada
        return self.markS

    #------- Vista para para Iniciar sesion ---------
    def viewSession(self):
        self.initRoot()
        lblTitle = Label(self.root,text="Ingrese los datos solicitados.", bd="2",bg= "#000000", fg="#55aa55", font="Helveltica 25 bold").place(x=200,y=2)
        #Etiqueta para el input User
        lblFromUser = Label(self.root,text="User",bd="2", bg= "#000000", fg="#55aa55", font="Helveltica 13 bold").place(x=10,y=70)

        #Campo de texto para ingresar el usuario
        txtUser = Entry(self.root,fg="#888888", bg="#333333", font="Helveltica 16 bold",selectbackground="#999999",selectforeground="#ffffff",selectborderwidth=1, justify="center")
        txtUser.place(x=10,y=100)

        #Etiqueta para el input password
        lblFromUser = Label(self.root,text="Passwoord",bd="2", bg= "#000000", fg="#55aa55", font="Helveltica 13 bold").place(x=10,y=150)

        #Campo de texto para ingresar el password
        txtPassword = Entry(self.root, show="*", fg="#888888", bg="#333333", font="Helveltica 16 bold",selectborderwidth=1, justify="center")
        txtPassword.place(x=10,y=180)

        #Continuar        
        buttonAccess = Button(self.root,text="Ingresar",command= lambda: self.actionSession(txtUser.get(),txtPassword.get()),fg="white",activeforeground="white",activebackground="#008800",bg="#336633",width=15,height=1,bd=1,font="Helveltica 15 bold").place(x=380,y=100)

        #Cancelar        
        buttonCancel = Button(self.root,text="Cancelar",command= lambda: self.root.destroy(),fg="white",activeforeground="white",activebackground="#880000",bg="#663333",width=15,height=1,bd=1,font="Helveltica 15 bold").place(x=380,y=150)

        #self.root.after(8000, lambda: self.root.destroy())
        self.showRoot()

    #------- Vista para administrar el fingerprint ---------
    def viewAdmin(self):
        self.initRoot()
        lblTitle = Label(self.root,text="Seleccionae una de las opciones.",bd="2",bg= "#000000", fg="#55aa55", font="Helveltica 20 bold").place(x=150,y=50)
        
        #Actualizar huella dactilar
        buttonUpdate = Button(self.root,text="Actualizar Huella",command= lambda: self.actionAdmin("update"),fg="white",activeforeground="white",activebackground="#333333",bg="#444444",width=15,height=1,bd=1,font="Helveltica 15 bold").place(x=80,y=100)

        #Eliminar huella dactilar        
        buttonDelete = Button(self.root,text="Eliminar Huella",command= lambda: self.actionAdmin("delete"),fg="white",activeforeground="white",activebackground="#333333",bg="#444444",width=15,height=1,bd=1,font="Helveltica 15 bold").place(x=280,y=100)
        
        #Cancelar        
        buttonCancel = Button(self.root,text="Cancelar",command= lambda: self.actionAdmin("cancel"),fg="white",activeforeground="white",activebackground="#880000",bg="#773333",width=15,height=1,bd=1,font="Helveltica 15 bold").place(x=480,y=100)

        #self.root.after(8000, lambda: self.root.destroy())
        self.showRoot()

    #------- Vista Solicitar el usuario a modificar ---------
    def viewGetUser(self, listUser):
        self.initRoot()
        
        lblTitle = Label(self.root,text="Seleccione un usuario",bd="2",bg= "#000000", fg="#55aa55", font="Helveltica 25 bold").place(x=150,y=30)
        
        #Muestra los roles del usuario al cual le pertenece el llavin
        scroll = Scrollbar(self.root,width=25, bg="orange")
        scroll.place(x=400,y=100)

        listBox = Listbox(self.root, yscrollcommand=scroll.set, bd="1",fg="#888888", bg="#000000", font="Helveltica 16 bold",selectbackground="#559955",selectforeground="#ffffff",height=15, width=30, selectborderwidth=1, activestyle=NONE)
    
        scroll.config(command=listBox.yview)
        listBox.place(x=10,y=100)
        listBox.insert(0,*listUser)
        
        #Boton que obtiene el usuario seleccionado
        buttonAceptar = Button(self.root,text="Next",command= lambda: self.getUserSelect(listBox),fg="white",activeforeground="white",activebackground="#008800",bg="#55aa55",width=15,height=2,bd=3,font="Helveltica 17 bold").place(x=500,y=100)

        #Boton para cancelar
        buttonCancel = Button(self.root,text="Cancel",command= lambda: self.actionAdmin("Cancelar"),fg="white",activeforeground="white",activebackground="#880000",bg="#773333",width=15,height=2,bd=3,font="Helveltica 17 bold").place(x=500,y=200)
       
        #Selecciona el primer usuario
        listBox.selection_set(0)

        self.showRoot() 

     
