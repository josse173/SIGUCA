#coding=utf-8
#GreenCore Solutions
#AGPL V.3
#This script is a prototype to catch the ID through a RFID module connected  to a Raspberry Pi 2 B v1
#Currently it works through a serial connection with a Raspberry ,using a extra module RMD 6300,allowing to catch id from 
#rfid-cards, going deeper on code , it parse the id received by the signal,discarding the first 
#four numbers of the rfid  and the  2 at the final of the line to get exactly the number to apply the conversion to Decimal 
#and get the coincidence with the code in the card , that will be used to link the attribute of id of the employees with code 
#the idea is   send the code catched  to the node js application through a child process or sockets(still on process, not exist a link yet between node and the script) and make a
# search on the database ,seeking for any coincidence with the code ,to allow make automatic login with the code of the employee.More 
#More  Details about, below on code.  

import time 
import os, sys
import serial 

#read_rfid its a method defined by the serial import
def read_rfid():
	#Variable of the main serial entry on Raspberry
	ser =  serial.Serial("/dev/ttyAMA0",timeout=60)
	#Should be defined as 9600 as default,according to online  documentations 	
	ser.baudrate= 9600
	print "-------------------------"
       	print "SEARCHING RFID CODE..."
        #data its a variable,that is listening on GPIO15 on raspberry
	time.sleep(1)
	data=ser.readline(15)
	time.sleep(1)
	ser.close()
        #Time to refresh 
	time.sleep(1)
	print "The code have been found "
	#it makes readable data
        data=data.replace("\x02","")
	data=data.replace("\x03","")
	return data
	print "-------------------------"


def pause():
    programPause = raw_input("Press the <ENTER> key to continue...")
    os.system('clear')
	
def mainMethod():
# this try its because , was throwing a serial exception , when pass  a few time without readiness 
	try:
		while 1:
			#invoked method
			id = read_rfid()
			print "-------------------------"
			print "The code is:"+id
			time.sleep(2);
			#here is the division of the characters ,that we need to parse  
			splitID = list(id)
			ParseId = [splitID[4],splitID[5],splitID[6],splitID[7],splitID[8],splitID[9]]
			result = ''.join(ParseId) 
			#uncomment this line below , if you want to know the hex num generated.(not neccesary for funcionality)
			#print "The Hexadecimal parsed code is:"+result
			
			#dec  has the funtion for convert hex to dec
			dec = int(result, 16)
			#then its neccesary to transform the int on string to show up 
			dec_Str = str(dec)
			print "-------------------------"
			print "The dec code is:"+dec_Str
			pause()
	except:	
		pass	


while 1:
	#invoke 
	mainMethod()
	pause()	

#end

	



