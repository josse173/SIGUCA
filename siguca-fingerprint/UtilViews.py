
#Importaciones
from Tkinter import *
from UtilImg import UtilImg
from UtilFingerprint import UtilFingerprint
from UtilBD import UtilBD
import time
import urllib
import socket

#Clase dedicada a administrar las distintas vistas del sistema
class UtilViews:

    '''
        Se inicializan metodos generales para administrar las vistas
    '''

    def __init__(self):
        self.instUtilFingerprint = UtilFingerprint()
        self.instUtilBD = UtilBD()
        self.initRoot()

    #Inicializa las propiedades generales
    def initRoot(self):
        self.root = Tk()
        self.root.attributes("-fullscreen", True)
#        self.root.config(background = "black", cursor="none", width=300, height=300)
        self.root.config(background = "black", width=300, height=300)

    #Inicializa un nuevo frae
    def initFrame(self):
        self.frame = Frame(self.root, background = "green", width=900, height=500)
        self.frame.place(x=0,y=0)
 
    '''
        Procesos paralelos
    '''
    #Actualiza la hora en tiempo real
    def updateTimeText(self):
        while(self.instIndex.semaforo ==  False):
            time.sleep(1)
            try:
                current = time.strftime("%I:%M:%S %p")
                #self.lblMessage.configure(text=current)  
            except NameError:
                return 0

    #Muestra un cronometro hacia atras
    def chronometerText(self,timeTem):
        while(timeTem >= 1):
            time.sleep(1) 
            #self.lblMessage.configure(text=str(timeTem))  
            timeTem -= 1
        self.instIndex.semaforo=True

    '''
        Acciones de los botones
    '''
    #Ingresa al sistema para realizar marcas o a la parte administrativa
    def ingresar(self, action):
        if action == "admin":
            print "Admin"
        else:
            #Obtiene una huella
            self.frame.destroy()
            self.viewGetFingerprint()
            self.root.after(5000, lambda: self.instUtilFingerprint.updateSem())
            result = self.instUtilFingerprint.search()
            self.frame.destroy()

            if result == -1:
                self.message("No se han encontrado coincidencias.", "red")
                self.viewPrincipal()
            else:
                #Valida con BD
                self.user = self.instUtilBD.findCodUser(result)
                if self.user != None:
                    self.message("Bienvenido " + self.user["nombre"] + " " + self.user["apellido1"], "light green")
                    
                    #Valida si tiene mas de un rol
                    if (len(self.user["tipo"]) == 1):
                        self.tipoUsuario = (self.user["tipo"])[0]
                        self.viewMark()
                    else:
                        self.instUtilViews.viewObtieneTipoUsuario(self.user["tipo"])

    #Obtiene el rol seleccionado en la lista de roles del usuario
    def obtieneTipoSeleccionado(self, listBox):
        listSeleccionado = listBox.curselection()
        tipo = ""
        for tem in listSeleccionado:
            tipo = listBox.get(tem)
            if tipo != "":
                self.tipoUsuario = tipo
            else:
                self.tipoUsuario = tipo 
        self.frame.destroy()
        self.viewMark()

    #Realiza la marca seleccionada por el usuario
    def actionMark(self, markAction):
        self.frame.destroy()
        if markAction != "cancel":
            #markAction, self.tipoUsuario, self.user["codTarjeta"]
            self.markAction(markAction, self.tipoUsuario, self.user["codTarjeta"])
        self.viewPrincipal()

        print "Termino y volvio a principal"

    #Realiza la accion del logueo
    def actionSession(self, user, password):
        self.instIndex.sessionUser = user
        self.instIndex.sessionPassword = password

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

    def cancelSession(self):
        self.instIndex.result = "cancel"
        self.root.destroy()

    '''
        Funciones logicas
    '''
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
        self.message(data, "light green") 

    '''
       Se construyen las vistas a utilizar
    '''
 
    #---------- Vista principal -----------
    def viewPrincipal(self):
        print "Vista principal"
        #Se inicializa la vistaupdateTimeText(self):   
        self.initFrame()
 
        #Muestra la imagen
        #self.photo = UtilImg().getImageURL("siguca.gif",self.frame)
        #self.lblImg2 = Label(self.frame,image=self.photo,bd=0).place(x=-150, y=50)

        #Boton para continuar
        btnIngresar = Button(self.frame, text="Ingresar", command=lambda: self.ingresar("mark"), fg="white", activeforeground="white", activebackground="green", bg="#555555",width=17, height=2, bd=2, font="Helveltica 15 bold").place(x=470, y=200)
        
        #Boton para ingresar al modulo administrativo
        btnConf = Button(self.frame, text="Administrar", command=lambda: self.ingresar("admin"), fg="#bbbbbb", activeforeground="white", activebackground="green", bg="#222222",width=14, height=2, bd=1, font="Helveltica 12 bold").place(x=620, y=245)

        self.root.mainloop()#Muestra la ventana

    #------- Vista MostrarMensaje ---------
    def viewMessage(self, message, color):   
        self.initFrame()
        Label(self.frame, text=message, wraplength=650,  fg = color, bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()
        
        time.sleep(5000)
        self.frame.destroy()


    #------- Vista Solicitar Fingerprint ---------
    def viewGetFingerprint(self):
        print "Vista obtiene finger print"
        self.initFrame()
        Label(self.frame, text="Coloque su dedo en el dispositivo.", wraplength=650,  fg = "#228B22", bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()

    #------- Vista Solicitar Tipo de usuario ---------
    def viewObtieneTipoUsuario(self, listTipo):
        self.initFrame()
        lblTitle = Label(self.frame,text="Seleccione un tipo de usuario",bd="2",bg= "#000000", fg="#55aa55", font="Helveltica 30 bold").place(x=150,y=2)
        #Muestra los roles del usuario al cual le pertenece el llavin 
        listBox = Listbox(self.frame,bd="1",fg="#888888", bg="#000000", font="Helveltica 30 bold",selectbackground="#999999",selectforeground="#ffffff",height=13,selectborderwidth=1, activestyle=NONE, justify="center")
        listBox.place(x=10,y=100)
        listBox.insert(0,*listTipo)
        listBox.bind("<<ListboxSelect>>", lambda event: self.obtieneTipoSeleccionado(listBox))

    #------- Optiene la marca del usuario ---------
    def viewMark(self): 
        #Se crea el entorno grafico  para realizar las marcas
        self.initFrame()
    
        button = Button(self.frame,text="       Entrada        ", command = lambda: self.actionMark(1),fg="white",activeforeground="white",activebackground="#446644",bg="green",width=22,height=3,bd=3,font="Helveltica 17 bold")
    
        button1 = Button(self.frame,text="        Salida        ", command =lambda:  self.actionMark(6),fg="white",activeforeground="white",activebackground="#446644",bg="green",width=22,height=3,bd=3,font="Helveltica 17 bold")
    
        button2 = Button(self.frame,text="   Salida a Receso   ", command =lambda:  self.actionMark(2),fg="white",activeforeground="white",activebackground="#cac251",bg="orange",width=22,height=3,bd=3,font="Helveltica 17 bold")
        
        button3 = Button(self.frame,text="   Entrada de Receso  ", command =lambda:  self.actionMark(3),fg="white",activeforeground="white",activebackground="#cac251",bg="orange",width=22,height=3,bd=3,font="Helveltica 17 bold")
        
        button4 = Button(self.frame,text="  Salida al Almuerzo  ", command =lambda:  self.actionMark(4),fg="white",activeforeground="white",activebackground="#4444ff",bg="blue",width=22,height=3,bd=3,font="Helveltica 17 bold")
        
        button5 = Button(self.frame,text="  Entrada del Almuerzo ", command =lambda: self.actionMark(5), fg="white",activeforeground="white",activebackground="#4444ff",bg="blue",width=22,height=3,bd=3,font="Helveltica 17 bold")

        button6 = Button(self.frame,text="Cancelar",command=lambda: self.actionMark("cancel"),fg="white",activeforeground="white",activebackground="red",bg="#ff4444",width=47,height=3,bd=3,font="Helveltica 17 bold")
    
        button.grid(row=1,column=1)
        button1.grid(row=1,column=2)
        button2.grid(row=2,column=1)
        button3.grid(row=2,column=2)
        button4.grid(row=3,column=1)
        button5.grid(row=3,column=2)
        button6.grid(row=4,column=1, columnspan=15)

    #------- Vista para para Iniciar sesion ---------
    def viewSession(self):
        self.initFrame()
        lblTitle = Label(self.frame,text="Ingrese los datos solicitados.", bd="2",bg= "#000000", fg="#55aa55", font="Helveltica 25 bold").place(x=200,y=2)
        #Etiqueta para el input User
        lblFromUser = Label(self.frame,text="User",bd="2", bg= "#000000", fg="#55aa55", font="Helveltica 15 bold").place(x=10,y=70)

        #Campo de texto para ingresar el usuario
        txtUser = Entry(self.frame,fg="#888888", bg="#333333", font="Helveltica 20 bold",selectbackground="#999999",selectforeground="#ffffff",selectborderwidth=1, justify="center")
        txtUser.place(x=10,y=100)

        #Etiqueta para el input password
        lblFromUser = Label(self.frame,text="Passwoord",bd="2", bg= "#000000", fg="#55aa55", font="Helveltica 15 bold").place(x=10,y=150)

        #Campo de texto para ingresar el password
        txtPassword = Entry(self.frame, show="*", fg="#888888", bg="#333333", font="Helveltica 20 bold",selectborderwidth=1, justify="center")
        txtPassword.place(x=10,y=180)

        #Continuar        
        buttonAccess = Button(self.frame,text="Ingresar",command= lambda: self.actionSession(txtUser.get(),txtPassword.get()),fg="white",activeforeground="white",activebackground="#008800",bg="#336633",width=15,height=2,bd=1,font="Helveltica 16 bold").place(x=380,y=100)

        #Cancelar        
        buttonCancel = Button(self.frame,text="Cancelar",command= lambda: self.cancelSession(),fg="white",activeforeground="white",activebackground="#880000",bg="#663333",width=15,height=2,bd=1,font="Helveltica 16 bold").place(x=380,y=170)

    #------- Vista para administrar el fingerprint ---------
    def viewAdmin(self):
        self.initFrame()
        lblTitle = Label(self.frame,text="Seleccionae una de las opciones.",bd="2",bg= "#000000", fg="#55aa55", font="Helveltica 20 bold").place(x=150,y=50)
        
        #Actualizar huella dactilar
        buttonUpdate = Button(self.frame,text="Actualizar Huella",command= lambda: self.actionAdmin("update"),fg="white",activeforeground="white",activebackground="#333333",bg="#444444",width=15,height=1,bd=1,font="Helveltica 15 bold").place(x=80,y=100)

        #Eliminar huella dactilar        
        buttonDelete = Button(self.frame,text="Eliminar Huella",command= lambda: self.actionAdmin("delete"),fg="white",activeforeground="white",activebackground="#333333",bg="#444444",width=15,height=1,bd=1,font="Helveltica 15 bold").place(x=280,y=100)
        
        #Cancelar        
        buttonCancel = Button(self.frame,text="Salir",command= lambda: self.actionAdmin("cancel"),fg="white",activeforeground="white",activebackground="#880000",bg="#773333",width=15,height=1,bd=1,font="Helveltica 15 bold").place(x=480,y=100)

    #------- Vista Solicitar el usuario a modificar ---------
    def viewGetUser(self, listUser):
        self.initFrame()
        
        lblTitle = Label(self.frame,text="Seleccione un usuario",bd="2",bg= "#000000", fg="#55aa55", font="Helveltica 25 bold").place(x=150,y=30)
        
        #Muestra los roles del usuario al cual le pertenece el llavin
        scroll = Scrollbar(self.frame,width=50, bg="orange")
        scroll.place(x=400,y=100)

        listBox = Listbox(self.frame, yscrollcommand=scroll.set, bd="1",fg="#888888", bg="#000000", font="Helveltica 25 bold",selectbackground="#559955",selectforeground="#ffffff",height=8, width=20, selectborderwidth=1, activestyle=NONE)
    
        scroll.config(command=listBox.yview)
        listBox.place(x=10,y=100)
        listBox.insert(0,*listUser)
        listBox.bind("<<ListboxSelect>>", lambda event: self.getUserSelect(listBox))

        #Boton para cancelar
        buttonCancel = Button(self.frame,text="Cancel",command= lambda: self.actionAdmin("Cancelar"),fg="white",activeforeground="white",activebackground="#880000",bg="#773333",width=15,height=2,bd=3,font="Helveltica 17 bold").place(x=500,y=200)
