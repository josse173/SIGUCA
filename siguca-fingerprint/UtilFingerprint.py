#!/usr/bin/env python
# -*- coding: utf-8 -*-

#Importaciones
import hashlib
import time
from pyfingerprint.pyfingerprint import PyFingerprint

#Clase encargada de controlar el fingerprint
class UtilFingerprint:
    
    semaforo = True

    #Realiza la coneccion con el fingerprint
    def __init__(self):
       self.initFP()

    #Realiza la coneccion con el fingerprint
    def initFP(self):
        try:
            self.semaforo = True #Reinicial el semaforo

            self.f = PyFingerprint('/dev/ttyS0', 57600, 0xFFFFFFFF, 0x00000000)
            if ( self.f.verifyPassword() == False ):
                raise ValueError('La contrasena del sensor de huella dactilar presento un error.')
        except Exception as e:
            print('The fingerprint sensor could not be initialized!')
            print('Exception message: ' + str(e))
            exit(1)

    #Actualiza el valor de semaforo
    def updateSem(self):
        if self.semaforo == True:
            self.semaforo = False
        else:
            self.seaforo = True


    #Busca una huella en especifico
    def search(self):
        self.initFP()

        try:
            #Esperando a que sea leido el dedo
            while (self.semaforo == True and self.f.readImage() == False ):
                pass

            if self.semaforo == False:
                return 0
            
            #Convierte la imagen en caracteristicas 
            self.f.convertImage(0x01)

            #Se busca la imagen leida en las guardadas previamente
            result = self.f.searchTemplate()
            positionNumber = result[0]
            accuracyScore = result[1]
            
            return positionNumber                     

        except Exception as e:
            print('Mensaje de Excepcion: ' + str(e))
            exit(1)

    #-------- Elimina una huella en el dispositivo --------
    def delete(self, positionNumber):
        self.initFP()
    
        try:
            if ( self.f.deleteTemplate(positionNumber) == True ):
                print('Template deleted!')
        except Exception as e:
            print('Operation failed!')
            print('Exception message: ' + str(e))
            exit(1)

    
    #---------- Verifica existencia de huella -----------
    def exist(self):
        self.initFP()
    
        try:
            #Escucha el fingerprint
            while self.semaforo == True and self.f.readImage() == False:
                pass
 
            #Si se acaba el tiempo se elimina la ejecucion
            if self.semaforo == False:
                return "timeout"

            #En caso de que se ingresara una huella se analiza
            self.f.convertImage(0x01)

            result = self.f.searchTemplate()
            positionNumber = result[0]
            return str(positionNumber)# -1 quiere = No existe

        except Exception as e:
            print('Operation failed!')
            print('Exception message: ' + str(e))
            exit(1)


    #-------- Guarda una huella en el dispositivo --------
    def save(self):
        self.initFP()
    
        try:            
            #Se valida que la huella se registrara correctamente
            while (self.semaforo == True and self.f.readImage() == False):
                pass

            #No se ha colocado el dedo en el dispositivo
            if self.instIndex.semaforo == False:
                return  "timeout"

            else:
                self.f.convertImage(0x02)
                
                #Las huellas no coinciden
                if(self.f.compareCharacteristics() == 0):
                    return "not match"

                #Se guarda la nueva huella dactilar
                else:
                    self.f.createTemplate()
                    positionNumber = self.f.storeTemplate()
                    return positionNumber

        except Exception as e:
            print('Operation failed!')
            print('Exception message: ' + str(e))
            exit(1)

