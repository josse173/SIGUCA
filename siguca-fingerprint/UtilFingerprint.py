#!/usr/bin/env python
# -*- coding: utf-8 -*-

#Importaciones
import hashlib
import time
from pyfingerprint.pyfingerprint import PyFingerprint

#Clase encargada de controlar el fingerprint
class UtilFingerprint:

    #Realiza la coneccion con el fingerprint
    def __init__(self,instIndex):
       self.initFP(instIndex)

    #Realiza la coneccion con el fingerprint
    def initFP(self,instIndex):
        self.instIndex = instIndex
        try:
            self.f = PyFingerprint('/dev/ttyS0', 57600, 0xFFFFFFFF, 0x00000000)
            if ( self.f.verifyPassword() == False ):
                raise ValueError('La contrasena del sensor de huella dactilar presento un error.')
        except Exception as e:
            print('The fingerprint sensor could not be initialized!')
            print('Exception message: ' + str(e))
            exit(1)


    #Busca una huella en especifico
    def search(self,instIndex):
        self.initFP(instIndex)

        try:
            #Esperando a que sea leido el dedo
            while (self.instIndex.semaforo == False and self.f.readImage() == False ):
                pass

            if self.instIndex.semaforo == True:
                return 0
            
            #Convierte la imagen en caracteristicas 
            self.f.convertImage(0x01)

            #Se busca la imagen leida en las guardadas previamente
            result = self.f.searchTemplate()
            positionNumber = result[0]
            accuracyScore = result[1]
            
            self.instIndex.idUser = positionNumber
            self.instIndex.semaforo = True
            return positionNumber                     

        except Exception as e:
            print('Mensaje de Excepcion: ' + str(e))
            exit(1)

    #-------- Elimina una huella en el dispositivo --------
    def delete(self, positionNumber, instIndex):
        self.initFP(instIndex)
    
        try:
            if ( self.f.deleteTemplate(positionNumber) == True ):
                print('Template deleted!')
        except Exception as e:
            print('Operation failed!')
            print('Exception message: ' + str(e))
            exit(1)

    
    #---------- Verifica existencia de huella -----------
    def exist(self, instIndex):
        self.initFP(instIndex)
    
        try:
            print("Waiting for finger")

            #Escucha el fingerprint
            while self.instIndex.semaforo == False and self.f.readImage() == False:
                pass

            #Si se acaba el tiempo se elimina la ejecucion
            if self.instIndex.semaforo == True:
                self.instIndex.result = "timeout"
                return "timeout"

            #En caso de que se ingresara una huella se analiza
            self.f.convertImage(0x01)

            result = self.f.searchTemplate()
            positionNumber = result[0]
            self.instIndex.result = str(positionNumber)

            return str(positionNumber)+""# -1 quiere = No existe

        except Exception as e:
            print('Operation failed!')
            print('Exception message: ' + str(e))
            exit(1)


    #-------- Guarda una huella en el dispositivo --------
    def save(self, instIndex):
        self.initFP(instIndex)
    
        try:            
            #Se valida que la huella se registrara correctamente
            while (self.instIndex.semaforo == False and self.f.readImage() == False):
                pass
            
            #En caso de ser eliminado desde otra clase se termina el flujo
            if self.instIndex.semaforo == True:
                self.instIndex.result = "ERROR!, debe colocar el dedo en el dispositivo"
                return 0


            self.f.convertImage(0x02)

            if(self.f.compareCharacteristics() == 0):
                self.instIndex.result = "Las huellas no coinciden"
                return 0

            self.f.createTemplate()

            positionNumber = self.f.storeTemplate()
            #print ("La posicion de la huella es " + str(positionNumber))

            self.instIndex.idUser = positionNumber
            self.instIndex.result = "Realizado con exito."
            self.instIndex.semaforo = True

        except Exception as e:
            print('Operation failed!')
            print('Exception message: ' + str(e))
            exit(1)

