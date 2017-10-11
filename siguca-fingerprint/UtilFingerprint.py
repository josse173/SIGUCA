#!/usr/bin/env python
# -*- coding: utf-8 -*-

#Importaciones
import hashlib
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
            if ( positionNumber == -1 ):
                self.instIndex.idUser = 0
                self.instIndex.semaforo = True

                return 0
                #exit(0)
                        
            #Carga la plantilla encontrada en charbuffer 1
            self.f.loadTemplate(positionNumber, 0x01)

            #Descarga las caracteristicas
            characterics = str(self.f.downloadCharacteristics(0x01)).encode('utf-8')
            
            #Sesion
            idUser = hashlib.sha256(characterics).hexdigest()
            if(idUser == "0eff012f344875834a7fe838ab79ba60a9f30999eb586d39d34bde07aca55414"):
                self.instIndex.idUser = idUser
                self.instIndex.semaforo = True
                return idUser
            else:
                self.instIndex.idUser = 0
                self.instIndex.semaforo = True
                return 0

        except Exception as e:
            print('Mensaje de Excepcion: ' + str(e))
            exit(1)

