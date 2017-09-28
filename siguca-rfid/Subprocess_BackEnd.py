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
import time 
import os, sys
import serial 
import subprocess
import RPi.GPIO as GPIO
from Tkinter import *
from pymongo import MongoClient
from PIL import Image

#SETTINGS AND CONFIGURATIONS
#IP OF NODE JS SERVER WHERE SIGUCA IS RUNNING
server_IP='10.42.30.13'
#PORT OF THE MONGODB 
port='27017'
#PORT OF OF SIGUCA NODE JS PORT 
app_Port='3000'
#WE NEED TO SET A BROWSER TO SEND  POST ACTION TO THE NODE SERVER , SET IT UP HERE AS UNIX COMMAND
browserSelection='curl'
#ROUTE ON RASPBERRY PI WHERE IMAGE'S PATH  OF THE SERVER WAS MOUNTED, THROUGHT  NFS.
#Ruta en la RaspberryPI donde esta montado el path de imagenes  del servidor a través de nfs.
rutaImagenesPi= "http://siguca.greencore.int/uploads/"
#----------------------------------------------------------------------------------------------------------------------------------
connection = MongoClient('mongodb://'+server_IP+':'+port)

#DATABASE CONNECTIONS.
db = connection.sigucadb
collection = db.usuarios
codigosExistentes=list(collection.find({},{"codTarjeta": 1,"_id":0}))
#Methods to define the timestamps thought the web browser
def Entrada(dec,tipo):
    #These methods request a subprocess to execute a query to the ip and also the kind of timestamp
    #browser = subprocess.Popen([browserSelection, 'http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=1'])
    #These sleeps are important and necessary to call the browser and execute the post.
    #time.sleep(1)
    #The the browser quits by itself and kill the frame. 
    #browser.terminate() 
    #root.destroy()
    root3 = Tk()
    root3.attributes('-fullscreen', True)
    frame3 = Frame(root3)
    frame3.pack()
    root3.config(background="black",cursor="none")
    f = urllib.urlopen('http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=1&tipo='+tipo)
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
    f = urllib.urlopen('http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=2&tipo='+tipo)
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
    f = urllib.urlopen('http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=3&tipo='+tipo)
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
    f = urllib.urlopen('http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=4&tipo='+tipo)
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
    f = urllib.urlopen('http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=5&tipo='+tipo)
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
    f = urllib.urlopen('http://'+server_IP+':'+app_Port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of2Oobai&codTarjeta='+dec+'&tipoMarca=6&tipo='+tipo)
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

        ser = serial.Serial(
        port="/dev/ttyS0",\
        baudrate=9600)
        #ser =  sersial.Serial("/dev/ttyS0",timeout=60)
        #ser.baudrate= 9600
       
  #Lo que realiza este while es hacer que la instancia se ejecute siempre , entonces cada vez que 
  #se ejecuta un método de los implementados al principio de este script , luego de cerrar el navegador y la instancia de la aplicación gráfica de python 
  # volvería de nuevo a ejecutarse desde aquí permitiendo que se realize una y otra vez la verificacion de marcas RFID.     
        while True:   
                #Cada vez que se hace la lectura se realiza un flush para evitar que el buffer almacene algún dato erroneo 
                

                #almacenamos en la variable data la lectura realizada de RFID
                data=ser.read(15)
               
                #print "Leyendo código :) , mantenga el identificador cerca del receptor"
                print "Espere..."
                #flush a ser para no contener basura dentro de la variable 
                #ser.flush()
                #se cierra la conexión para dejar de escuchar

                #se quitan los datos  basura que se captan  dentro del string de caracteres del RFID
                data=data.replace("\x02","")
                data=data.replace("\x03","")
                id = data
                #Se quitan los caracteres innecesarios dentro de la cadena de caracteres, para luego convertirrlo a decimal , los cuales serían los primeros 4 números y los últimos dos.
                splitID = list(id)
                #aqúi basicamente lo que se hace es extraer los datos que realmente necesitamos para convertirlos a decimal
                ParseId = [splitID[4],splitID[5],splitID[6],splitID[7],splitID[8],splitID[9]]
                #los  unificamos  con el metodo join
                result = ''.join(ParseId)
                #lo convertimos a decimal 
                dec = int(result, 16)
                print dec
                
                #Se hace la validacion en el vector definido  por  la consulta a la base de datos al inicio de este archivo, ademas se pasa actualizando la lista de usuarios desde la base de datos de mongo

		#codigosExistentes=list(collection.find({},{"codTarjeta": 1,"_id":0}))
                for post in codigosExistentes:
                    if dec == post['codTarjeta']:
			return dec
                ser.flushInput()
                data.flushInput()
                
    except:
       	 pass
 
#Encargado de obtener el tipo de  usuario seleccionado y pasarlo a obtiene marca
def obtieneTipoSeleccionado(dec, listBox):
    listSeleccionado = listBox.curselection()
    tipo = ""
    for tem in listSeleccionado:
        tipo = listBox.get(tem)
    
    
    if tipo != "":
        obtieneMarca(dec,tipo)
    else:
        root3 = Tk()
        root3.attributes('-fullscreen', True)
        frame3 = Frame(root3)
        frame3.pack()
        root3.config(background="black",cursor="none")
        
        w2 = Label(root3, text="debbe seleccionar un tipo de usuario", wraplength=650,  fg = "red", bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()
        
        root3.after(4000, lambda: root3.destroy())
        root3.mainloop()


#Obtiene la marca del usuario
def obtieneMarca(dec,tipo): 
    
    #Se crea el entorno gráfico  para realizar las marcas
    root = Tk()
    root.attributes('-fullscreen', True)
    frame = Frame(root)
    frame.pack()
    frame.config(background="black")
    root.config(background="black", height=600, width=600,cursor="none")
	
    #en cada botón se llama el método correspondiente con el parámetro del código  obtenido por la lectura.

    button = Button(frame,text="       Entrada        ", command = lambda: Entrada(dec,tipo),fg="white",activeforeground="white",activebackground="green",bg="green",width=22,height=3,bd=9,font="Helveltica 17 bold")
    button1 = Button(frame,text="        Salida        ", command =lambda: Salida(dec,tipo),fg="white",activeforeground="white",activebackground="green",bg="green",width=22,height=3,bd=9,font="Helveltica 17 bold")
    button2 = Button(frame,text="   Salida a Receso   ", command =lambda: SalidaReceso(dec,tipo),fg="white",activeforeground="white",activebackground="orange",bg="orange",width=22,height=3,bd=9,font="Helveltica 17 bold")
    button3 = Button(frame,text="   Entrada de Receso  ", command =lambda: EntradaReceso(dec,tipo),fg="white",activeforeground="white",activebackground="orange",bg="orange",width=22,height=3,bd=9,font="Helveltica 17 bold")
    button4 = Button(frame,text="  Salida al Almuerzo  ", command =lambda: SalidaAlmuerzo(dec,tipo),fg="white",activeforeground="white",activebackground="blue",bg="blue",width=22,height=3,bd=9,font="Helveltica 17 bold")
    button5 = Button(frame,text="  Entrada del Almuerzo ", command =lambda: EntradaAlmuerzo(dec,tipo),fg="white",activeforeground="white",activebackground="blue",bg="blue",width=22,height=3,bd=9,font="Helveltica 17 bold")
    button6 = Button(frame,text="Cancelar",command=lambda: root.destroy(),fg="white",activeforeground="white",activebackground="red",bg="red",width=47,height=3,bd=9,font="Helveltica 17 bold")
    button.grid(row=1,column=1)
    button1.grid(row=1,column=2)
    button2.grid(row=2,column=1)
    button3.grid(row=2,column=2)
    button4.grid(row=3,column=1)
    button5.grid(row=3,column=2)
    button6.grid(row=4,column=1, columnspan=15)
    #nuevo
	#explanation = str("Hora: ")+time.strftime("%H:%M")
	#clock = Label(frame, fg="white",activeforeground="white",activebackground="blue",bg="black",width=51,height=2,bd=9,font="Helveltica 16",text=explanation, wraplength=350)
	#clock.grid(row=5,column=1, columnspan=15)
    #nuevo
    root.after(4000, lambda: root.destroy())
    root.mainloop()






#Se obtiene el tipo de usuario con el cual se debe hacer la marca
def obtieneTipoUsuario(dec,listTipo):
        #Se crea el entorno gráfico  para realizar las marcas
        rootTipo = Tk()
        rootTipo.attributes('-fullscreen', True)
        rootTipo.config(height=600, width=600,cursor="none",bg="#ffffff")


        lblTitle = Label(rootTipo,text="Seleccione un tipo de usuario",bd="2",bg= "#ffffff", fg="#55aa55", font="Helveltica 30 bold").place(x=150,y=2)

        #Muestra los roles del usuario al cual le pertenece el llavin 
        listBox = Listbox(rootTipo,bd="0",fg="#888888",font="Helveltica 30 bold",selectbackground="#00bb00",selectforeground="#ffffff",height=500,selectborderwidth=2, activestyle=NONE,highlightthickness=0,justify="center")
        listBox.place(x=10,y=100)

        listBox.insert(0,*listTipo)


        buttonCancelar = Button(rootTipo,text="Cancelar",command=lambda: rootTipo.destroy(),fg="white",activeforeground="white",activebackground="red",bg="red",width=15,height=2,bd=6,font="Helveltica 17 bold").place(x=500,y=100)

        buttonAceptar = Button(rootTipo,text="Aceptar",command= lambda: obtieneTipoSeleccionado(dec,listBox),fg="white",activeforeground="white",activebackground="#008800",bg="#00cc00",width=15,height=2,bd=6,font="Helveltica 17 bold").place(x=500,y=200)


        rootTipo.after(5000, lambda: rootTipo.destroy())
        rootTipo.mainloop()
        return "Correcto";


#En esta sección tenemos el orden de como se van a ir ejecutando los métodos dentro del sistema , esto es  lo que se ejecutará cuando se lance el script.

while True:
    os.system('clear')
    dec=read_rfid()
    dec=str(dec)
    tipoUsuario = "None"

    #se verifica que la variable no este vacía
    if dec != "None":
        root1 = Tk()
        root1.attributes('-fullscreen', True)
        frame1 = Frame(root1)
        frame1.pack()
        root1.config(background="black",cursor="none")
       
        try:    
                w = 520
                h = 320
                x = 80
                y = 100
                # use width x height + x_offset + y_offset (no spaces!)
                root2.geometry("%dx%d+%d+%d" % (w, h, x, y))
                # this GIF picture previously downloaded to tinypic.com
                image_url = rutaImagenesPi+dec+".png"
                image_byt = urlopen(image_url).read()
                image_b64 = base64.encodestring(image_byt)
                photo = PhotoImage(data=image_b64)
                w1 = Label(root1,image=photo).pack(side="top")
        except: 
            pass

        root1.after(2000, lambda: root1.destroy())
        root1.mainloop()

        #Si tiene mas de un rol se solicita un tipo sino de una ves la marca
        codigosExistentes=list(collection.find({},{"tipo":  1,"codTarjeta": 1,"_id":0}))
        for post in codigosExistentes:
            if str(dec) == str(post['codTarjeta']):
                listTipo =  post["tipo"] 
                if isinstance(listTipo,str) or isinstance(listTipo,unicode):
                    obtieneMarca(dec,str(listTipo))
                else:
                    #Se obtiene el tipo de usuario
                    tipoUsuario = obtieneTipoUsuario(dec,listTipo)

        
    else:  
        os.system('clear')
        pass 
