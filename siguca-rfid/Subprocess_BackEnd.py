#coding=utf-8
#/**
#  GreenCore Solutions
#* Python-Extension to SIGUCA application
#*
#* Copyright 2016 by Bradley Hidalgo Guzman <bfhg.17@hotmail.com>
#*
#* This file is part of SIGUCA open source application.
#*
#* SIGUCA open source application is free software: you can redistribute
#* it and/or modify it under the terms of the GNU Affero General Public
#* License as published by the Free Software Foundation, either
#* version 3 of the License, or (at your option) any later version.
#*
#* SIGUCA open source application is distributed in the hope that it will
#* be useful, but WITHOUT ANY WARRANTY; without even the implied warranty
#* of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#* GNU Affero General Public License for more details.
#*
#* You should have received a copy of the GNU Affero General Public License
#* along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
#*
#*
#*/
import urllib
from bson.objectid import ObjectId
import time
import os, sys
import serial
import subprocess
import RPi.GPIO as GPIO
from Tkinter import *
from pymongo import MongoClient
from PIL import Image
import socket
from keyboard_alike import reader

#Import para imagenes
import UtilImg

#SETTINGS AND CONFIGURATIONS
#IP OF NODE JS SERVER WHERE SIGUCA IS RUNNING
server_IP='siguca.greencore.int'
#server_IP='192.168.1.8'
#PORT OF THE MONGODB
port='27017'
#PORT OF OF SIGUCA NODE JS PORT
app_Port='3000'
#WE NEED TO SET A BROWSER TO SEND  POST ACTION TO THE NODE SERVER , SET IT UP HERE AS UNIX COMMAND
browserSelection='curl'
#ROUTE ON RASPBERRY PI WHERE IMAGE'S PATH  OF THE SERVER WAS MOUNTED, THROUGHT  NFS.
#Ruta en la RaspberryPI donde esta montado el path de imagenes  del servidor a través de nfs.
#rutaImagenesPi= "http://10.42.30.19:3000/uploads/"
#----------------------------------------------------------------------------------------------------------------------------------
connection = MongoClient('mongodb://'+server_IP+':'+port)

#DATABASE CONNECTIONS.
db = connection.sigucadb
collection = db.usuarios
codigosExistentes=list(collection.find({"estado":"Activo"},{"codTarjeta": 1,"_id":0}))

#Obtiene ipv4
def getIpv4():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    s.connect(('<broadcast>', 0))
    return s.getsockname()[0]

#Methods to define the timestamps thought the web browser
def Entrada(dec,tipo):
    root3 = Tk()
    root3.attributes('-fullscreen', True)
    frame3 = Frame(root3)
    frame3.pack()
    root3.config(background="black",cursor="none")
    f = urllib.urlopen('http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=1&tipo='+tipo+"&ipv4="+getIpv4())
    data = f.read()
    try:
	if (data == "La marca de entrada fue registrada anteriormente."):
                w2 = Label(root3, text=data, wraplength=650,  fg = "red", bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()
        else:
                w2 = Label(root3, text=data+str(" A las: ")+str(time.strftime("%I:%M:%S %p")), wraplength=650,  fg = "light green", bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()
    except:
        pass
    root3.after(4000, lambda: root3.destroy())
    root3.mainloop()

def SalidaReceso(dec,tipo):
    root3 = Tk()
    root3.attributes('-fullscreen', True)
    frame3 = Frame(root3)
    frame3.pack()
    root3.config(background="black",cursor="none")
    f = urllib.urlopen('http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=2&tipo='+tipo+"&ipv4="+getIpv4())
    data = f.read()

    try:
	if (data == "La marca de salida a receso no fue registrada, ya que no ha marcado entrada, ya marcó la salida o se encuentra en almuerzo o en otro receso"):
	        w2 = Label(root3, text=data, wraplength=650,  fg = "red", bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()
	else:
		w2 = Label(root3, text=data+str(" A las: ")+str(time.strftime("%I:%M:%S %p")), wraplength=650,  fg = "light green", bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()
    except:
        pass
    root3.after(4000, lambda: root3.destroy())
    root3.mainloop()

def EntradaReceso(dec,tipo):
    #browser = subprocess.Popen([browserSelection, 'http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=3'])
    #time.sleep(1)
    #browser.terminate()
    #root.destroy()
    root3 = Tk()
    root3.attributes('-fullscreen', True)
    frame3 = Frame(root3)
    frame3.pack()
    root3.config(background="black",cursor="none")
    f = urllib.urlopen('http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=3&tipo='+tipo+"&ipv4="+getIpv4())
    data = f.read()
    try:
        #w2 = Label(root3, text=data, wraplength=650,  fg = "light green", bg = "black", font = "Helvetica 16 bold").pack()
	if (data == "La marca de entrada a receso no fue registrada, ya que no ha marcado entrada, ya marcó la salida, se encuentra en almuerzo o no ha marcado para salir a receso."):
                w2 = Label(root3, text=data, wraplength=650,  fg = "red", bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()
        else:
                w2 = Label(root3, text=data+str(" A las: ")+str(time.strftime("%I:%M:%S %p")), wraplength=650,  fg = "light green", bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()
    except:
        pass
    root3.after(4000, lambda: root3.destroy())
    root3.mainloop()

def SalidaAlmuerzo(dec,tipo):
    # browser = subprocess.Popen([browserSelection, 'http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=4'])
    # time.sleep(1)
    # browser.terminate()
    # root.destroy()
    root3 = Tk()
    root3.attributes('-fullscreen', True)
    frame3 = Frame(root3)
    frame3.pack()
    root3.config(background="black",cursor="none")
    f = urllib.urlopen('http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=4&tipo='+tipo+"&ipv4="+getIpv4())
    data = f.read()
    try:
       # w2 = Label(root3, text=data, wraplength=650,  fg = "light green", bg = "black", font = "Helvetica 16 bold").pack()
	if (data == "La marca de salida a almuerzo no fue registrada, ya que no ha marcado entrada, ya marcó la salida o ya se encuentra en almuerzo o receso."):
                w2 = Label(root3, text=data, wraplength=650,  fg = "red", bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()
        else:
                w2 = Label(root3, text=data+str(" A las: ")+str(time.strftime("%I:%M:%S %p")), wraplength=650,  fg = "light green", bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()
    except:
        pass
    root3.after(4000, lambda: root3.destroy())
    root3.mainloop()

def EntradaAlmuerzo(dec,tipo):
    #browser = subprocess.Popen([browserSelection, 'http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=5'])
    #time.sleep(1)
    #browser.terminate()
    #root.destroy()
    root3 = Tk()
    root3.attributes('-fullscreen', True)
    frame3 = Frame(root3)
    frame3.pack()
    root3.config(background="black",cursor="none")
    f = urllib.urlopen('http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=5&tipo='+tipo+"&ipv4="+getIpv4())
    data = f.read()
    try:
       # w2 = Label(root3, text=data, wraplength=650,  fg = "light green", bg = "black", font = "Helvetica 16 bold").pack()
	if (data == "La marca de entrada de almuerzo no fue registrada, ya que no ha marcado entrada, ya marcó la salida, se encuentra en receso o no ha marcado para salir a almuerzo."):
                w2 = Label(root3, text=data, wraplength=650,  fg = "red", bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()
        else:
                w2 = Label(root3, text=data+str(" A las: ")+str(time.strftime("%I:%M:%S %p")), wraplength=650,  fg = "light green", bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()
    except:
        pass
    root3.after(4000, lambda: root3.destroy())
    root3.mainloop()

def Salida(dec,tipo):
    #browser = subprocess.Popen([browserSelection, 'http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=6'])
    #time.sleep(1)
    #browser.terminate()
    #root.destroy()
    root3 = Tk()
    root3.attributes('-fullscreen', True)
    frame3 = Frame(root3)
    frame3.pack()
    root3.config(background="black",cursor="none")
    f = urllib.urlopen('http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=6&tipo='+tipo+"&ipv4="+getIpv4())
    data = f.read()
    try:
#        w2 = Label(root3, text=data, wraplength=650,  fg = "light green", bg = "black", font = "Helvetica 16 bold").pack()
	if (data == "La marca de salida no fue registrada, ya que fue registrada anteriormente,se encuentra en almuerzo o en receso."):
                w2 = Label(root3, text=data, wraplength=650,  fg = "red", bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()
        else:
                w2 = Label(root3, text=data+str(" A las: ")+str(time.strftime("%I:%M:%S %p")), wraplength=650,  fg = "light green", bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()
    except:
        pass
    root3.after(4000, lambda: root3.destroy())
    root3.mainloop()

#Método principal de lectura para rfid.
def read_rfid():
    #Excepcion para que no deje de escuchar si no encuentra  lectura .
    try:
        #Se inicializan las variables sin ningún contenido
	os.system('clear')
        print "Escuchando entradas..."
        data = None
        ser = None

        #Serial instance defines where its going constantly listen , you must set the baudrate in accordance to your own module to process the entry. 9600 to rdm 6300, also set the dev path. These ones are defaults:
        try:
            ser = reader.Reader(0xffff, 0x0035, 84, 16, should_reset=False)
            ser.initialize()
            data = ser.read().strip()
            ser.disconnect()

        except:
            print "****ERROR ****"

 #Lo que realiza este while es hacer que la instancia se ejecute siempre , entonces cada vez que
 #se ejecuta un método de los implementados al principio de este script , luego de cerrar el navegador y la instancia de la aplicación gráfica de python
 # volvería de nuevo a ejecutarse desde aquí permitiendo que se realize una y otra vez la verificacion de marcas RFID.
        while True:
                #Cada vez que se hace la lectura se realiza un flush para evitar que el buffer almacene algún dato erroneo
                #almacenamos en la variable data la lectura realizada de RFID
                print "Espere..."

                try:
                    dec = int(data)
                except:
                    print "*ERROR NO PARSE*"
                #Se hace la validacion en el vector definido  por  la consulta a la base de datos al inicio de este archivo, ademas se pasa actualizando la lista de usuarios desde la base de datos de mongo

		#codigosExistentes=list(collection.find({},{"codTarjeta": 1,"_id":0}))
                for post in codigosExistentes:
                    if dec == post['codTarjeta']:
			return dec
                ser.flushInput()
                data.flushInput()

    except:
       	 pass

#Obtiene la marca del usuario
def obtieneMarca(dec,tipo):
    print "Obteniendo marca para ID: " + dec + " Tipo Usuario: " + tipo
        
    #Se crea el entorno gráfico  para realizar las marcas
    root = Tk()
    root.attributes('-fullscreen', True)
    frame = Frame(root)
    frame.pack()
    root.config(background="black", height=600, width=600,cursor="none")

    #en cada botón se llama el método correspondiente con el parámetro del código  obtenido por la lectura.
    button = Button(root,text="       Entrada        ", command = lambda: Entrada(dec,tipo),fg="white",activeforeground="white",activebackground="green",bg="green",width=22,height=3,bd=0,font="Helveltica 17 bold")
    button1 = Button(root,text="        Salida        ", command =lambda: Salida(dec,tipo),fg="white",activeforeground="white",activebackground="green",bg="green",width=22,height=3,bd=0,font="Helveltica 17 bold")
    button2 = Button(root,text="   Salida a Receso   ", command =lambda: SalidaReceso(dec,tipo),fg="white",activeforeground="white",activebackground="orange",bg="orange",width=22,height=3,bd=0,font="Helveltica 17 bold")
    button3 = Button(root,text="   Entrada de Receso  ", command =lambda: EntradaReceso(dec,tipo),fg="white",activeforeground="white",activebackground="orange",bg="orange",width=22,height=3,bd=0,font="Helveltica 17 bold")
    button4 = Button(root,text="  Salida al Almuerzo  ", command =lambda: SalidaAlmuerzo(dec,tipo),fg="white",activeforeground="white",activebackground="blue",bg="blue",width=22,height=3,bd=0,font="Helveltica 17 bold")
    button5 = Button(root,text="  Entrada del Almuerzo ", command =lambda: EntradaAlmuerzo(dec,tipo),fg="white",activeforeground="white",activebackground="blue",bg="blue",width=22,height=3,bd=0,font="Helveltica 17 bold")
    button6 = Button(root,text="Cancelar",command=lambda: root.destroy(),fg="white",activeforeground="white",activebackground="red",bg="red",width=50,height=3,bd=0,font="Helveltica 17 bold")
    button.place(x=50,y=20)
    button1.place(x=400,y=20)
    button2.place(x=50,y=130)
    button3.place(x=400,y=130)
    button4.place(x=50,y=240)
    button5.place(x=400,y=240)
    button6.place(x=50,y=350)

    #Se validan los botones de SIGUCA
    codigosExistentes=list(collection.find({"estado":"Activo"},{"tipo":  1,"codTarjeta": 1,"_id":1}))

    idUser = ""
    for post in codigosExistentes:
        ct = str(post['codTarjeta'])
        index = ct.find('.')
        if index > 0:
            ct = ct[0:index]
	    if str(dec) == ct:
        	idUser = post["_id"]

    #Se obtienen las marcas
    dia = time.strftime("%d")
    mes = time.strftime("%m")
    ano = time.strftime("%Y")
    t = time.mktime(time.strptime(dia+"."+mes+"."+ano+" 00:00:00", "%d.%m.%Y %H:%M:%S"))
    listMarcas = list(db.marcas.find({"usuario":ObjectId(idUser),"tipoUsuario":tipo, "epoch":{"$gte":t}}))

    salidaReceso = 0
    entradaReceso = 0

    for temMarca in listMarcas:

	if temMarca["tipoMarca"] == "Salida":
		button.configure(state=DISABLED, bg="#9eff9b")
		button1.configure(state=DISABLED, bg="#9eff9b")
		button2.configure(state=DISABLED, bg="#ffc57c")
		button3.configure(state=DISABLED, bg="#ffc57c")
		button4.configure(state=DISABLED, bg="#afb2ff")
		button5.configure(state=DISABLED, bg="#afb2ff")

	if temMarca["tipoMarca"] == "Entrada":
		button.configure(state=DISABLED, bg="#9eff9b")

	if temMarca["tipoMarca"] == "Entrada de Receso":
                entradaReceso += 1

	if temMarca["tipoMarca"] == "Salida a Receso":
		salidaReceso += 1

	if temMarca["tipoMarca"] == "Salida al Almuerzo":
		button4.configure(state=DISABLED, bg="#afb2ff")

	if temMarca["tipoMarca"] == "Entrada de Almuerzo":
                button5.configure(state=DISABLED, bg="#afb2ff")

    if salidaReceso>entradaReceso:
		button2.configure(state=DISABLED, bg="#ffc57c")

    root.after(5000, lambda: root.destroy())
    root.mainloop()

#Se obtiene el tipo de usuario con el cual se debe hacer la marca
def obtieneTipoUsuario(dec,listTipo):
        #Se crea el entorno gráfico  para realizar las marcas
        rootTipo = Tk()
        rootTipo.attributes('-fullscreen', True)
        rootTipo.config(height=600, width=600,cursor="none",bg="#ffffff")

        lblTitle = Label(rootTipo,text="Seleccione un tipo de usuario",bd="2",bg= "#ffffff", fg="#55aa55", font="Helveltica 30 bold").place(x=100,y=2)
        #Muestra los roles del usuario al cual le pertenece el llavin
        listBox = Listbox(rootTipo,bd="0",fg="#888888",font="Helveltica 30 bold",selectbackground="#00bb00",selectforeground="#ffffff",height=500,selectborderwidth=2, activestyle=NONE,highlightthickness=0,justify="center")
        listBox.place(x=25,y=100)

	yAxis = 100
	xAxis = 120
	buttonList = list();
	count = 1
	index = 0

        adminProfile = "Administrador"
	supervisorProfile = "Supervisor"
	professorProfile = "Profesor"
	employeeProfile = "Empleado"
	noWebAccessProfile = "Usuario sin acceso web"

	for profile in listTipo:
	    button = None
	    if str(profile) == "Administrador":
	        button = Button(rootTipo, text=str(profile), command=lambda: obtieneMarca(dec, adminProfile), fg="white",
		    activeforeground="white", activebackground="green", bg="green", width=20, height=4, bd=0,
		    font="Helveltica 17 bold")

	    if str(profile) == "Supervisor":
		    button = Button(rootTipo, text=str(profile), command=lambda: obtieneMarca(dec, supervisorProfile), fg="white",
		    activeforeground="white", activebackground="green", bg="green", width=20, height=4, bd=0,
		    font="Helveltica 17 bold")

	    if str(profile) == "Empleado":
		    button = Button(rootTipo, text=str(profile), command=lambda: obtieneMarca(dec, employeeProfile), fg="white",
		    activeforeground="white", activebackground="green", bg="green", width=20, height=4, bd=0,
		    font="Helveltica 17 bold")

	    if str(profile) == "Usuario sin acceso web":
		    button = Button(rootTipo, text=str(profile), command=lambda: obtieneMarca(dec, noWebAccessProfile), fg="white",
		    activeforeground="white", activebackground="green", bg="green", width=20, height=4, bd=0,
		    font="Helveltica 17 bold")

	    if str(profile) == "Profesor":
		    button = Button(rootTipo, text=str(profile), command=lambda: obtieneMarca(dec, professorProfile), fg="white",
		    activeforeground="white", activebackground="green", bg="green", width=20, height=4, bd=0,
		    font="Helveltica 17 bold")

	    button.place(x=xAxis,y=yAxis)
	    buttonList.append(button)
	    yAxis = yAxis + 110
	    count = count + 1
	    index = index + 1
	    if count > 3:
		 yAxis = 100
	   	 xAxis = 480
         	 count = 1

        listBox.insert(0,*buttonList)

        buttonCancelar = Button(rootTipo,text="Cancelar",command=lambda: rootTipo.destroy(),fg="white",activeforeground="white",activebackground="red",bg="red",width=15,height=2,bd=6,font="Helveltica 17 bold").place(x=480,y=350)

       # buttonAceptar = Button(rootTipo,text="Aceptar",command= lambda: obtieneTipoSeleccionado(dec,listBox),fg="white",activeforeground="white",activebackground="#008800",bg="#00cc00",width=15,height=2,bd=6,font="Helveltica 17 bold").place(x=500,y=200)

        rootTipo.after(5000, lambda: rootTipo.destroy())
        rootTipo.mainloop()
        return "Correcto"

#En esta sección tenemos el orden de como se van a ir ejecutando los métodos dentro del sistema , esto es  lo que se ejecutará cuando se lance el script.
while True:
    os.system('clear')
    dec=read_rfid()
    dec=str(dec)
    print "RFID (String): " + dec
    tipoUsuario = "None"

    #se verifica que la variable no este vacía
    if dec != "None":
        root1 = Tk()
        root1.attributes('-fullscreen', True)
        frame1 = Frame(root1)
        frame1.pack()
        root1.config(background="black",cursor="none")

        try:
		instUtilImg = UtilImg.UtilImg()
                photo=instUtilImg.getImageURL(dec+".png")
                w1 = Label(root1,image=photo).pack(side="top")
        except:
            pass

        root1.after(2000, lambda: root1.destroy())
        root1.mainloop()

        #Si tiene mas de un rol se solicita un tipo sino de una ves la marca
        codigosExistentes=list(collection.find({"estado":"Activo"},{"tipo":  1,"codTarjeta": 1,"_id":0}))
        for post in codigosExistentes:
	    ct = str(post['codTarjeta'])
            index = ct.find('.')
	    if index > 0:
                ct = ct[0:index]
            if str(dec) == ct:
                listTipo =  post["tipo"]
		if (len(listTipo) == 1):
                    obtieneMarca(dec,str(listTipo[0]))
                else:
                    #Se obtiene el tipo de usuario
                    tipoUsuario = obtieneTipoUsuario(dec,listTipo)

    else:
        os.system('clear')
        pass
