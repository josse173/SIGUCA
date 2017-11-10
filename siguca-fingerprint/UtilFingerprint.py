#!/usr/bin/env python
# -*- coding: utf-8 -*-

#Importaciones
import hashlib
import time
from pyfingerprint.pyfingerprint import PyFingerprint
from UtilBD import UtilBD

#Clase encargada de controlar el fingerprint
class UtilFingerprint:

    #Realiza la coneccion con el fingerprint
    def __init__(self):
       self.initFP()

    #Realiza la coneccion con el fingerprint
    def initFP(self):
        try:
            self.f = PyFingerprint('/dev/ttyS0', 57600, 0xFFFFFFFF, 0x00000000)
            if ( self.f.verifyPassword() == False ):
                raise ValueError('La contrasena del sensor de huella dactilar presento un error.')
        except Exception as e:
            print('The fingerprint sensor could not be initialized!')
            print('Exception message: ' + str(e))
            exit(1)

    #Busca una huella en especifico
    def search(self):
        self.clearMemory()
        #self.initFP()

        try:
            #Esperando a que sea leido el dedo
            while (self.f.readImage() == False ):
                pass
           
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

    #-------- Guarda una huella en el dispositivo --------
    def save(self):
        self.initFP()
        try:            
            #Se valida que la huella se registrara correctamente
            while (self.f.readImage() == False):
                pass

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

    #Limpia el dispositivo de huellas que correspondan a usuarios eliminados
    def clearMemory(self):
        self.initFP()
        listUserBD = UtilBD().listUserFinger()
        
        if len(listUserBD) < self.f.getTemplateCount():

            #Recorre los elementos de la primera pagina del sensor
            tableFinger = self.f.getTemplateIndex(0)
            for temTable in range(0,len(tableFinger)):
                
                #En caso de que la posición esté en uso se busca en BD
                if tableFinger[temTable] == True:
                    success = False
                    for temUser in range(0,len(listUserBD)):
                        user = listUserBD[temUser]
                        if(user["codTarjeta"] == temTable):
                            success = True
                            break
                    #Si no se encontraron coincidencias en la BD,
                    #se elimina del sensor
                    if success == False:
                        self.f.deleteTemplate(temTable)
