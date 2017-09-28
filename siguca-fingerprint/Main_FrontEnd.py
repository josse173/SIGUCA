#coding=utf-8
#/**
 #  GreenCore Solutions
 #* Python-Extension to SIGUCA application
 #*
 #* Copyright 2016 by Bradley Hidalgo Guzmán <bfhg.17@hotmail.com>
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

#See the diagram conection on the repo. 
import time 
import os, sys
import serial 
import subprocess
import RPi.GPIO as GPIO
from Tkinter import *
from PIL import Image

#Import para imagenes
import io
import base64
try:
    # Python2
    from urllib2 import urlopen
except ImportError:
    # Python3
    from urllib.request import urlopen

#reloj metodo
def update_timeText():
    # Get the current time, note you can change the format as you wish
    current = time.strftime("%I:%M:%S %p")
    # Update the timeText Label box with the current time
    timeText.configure(text=current)
    # Call the update_timeText() function after 1 second
    root2.after(1000, update_timeText)
#reloj

#Here you have to set the path of the BackEnd FIle
#rutaImagenesPi= "/home/pi/Desktop/imgs/"
path='/usr/local/bin/scripts-python-siguca/Subprocess_BackEnd.py'
subprocess.Popen(['python', path])
root2 = Tk()
frame2 = Frame(root2)
frame2.pack()
root2.attributes('-fullscreen', True)
root2.config(background="black",cursor="none",width=300,height=300)

#reloj
timeText = Label(root2, text="", font=("Helvetica", 33))
timeText.config(background="black", fg="white")
timeText.pack()
update_timeText()

w = 520
h = 320
x = 80
y = 100
# use width x height + x_offset + y_offset (no spaces!)
root2.geometry("%dx%d+%d+%d" % (w, h, x, y))
# this GIF picture previously downloaded to tinypic.com
image_url = "http://siguca.greencore.int/uploads/siguca.gif"
image_byt = urlopen(image_url).read()
image_b64 = base64.encodestring(image_byt)
photo = PhotoImage(data=image_b64)
w1 = Label(root2,image=photo).pack()

root2.mainloop()
