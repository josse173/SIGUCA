#!/usr/bin/env python
# -*- coding: utf-8 -*-

#Importaciones
import hashlib
from pyfingerprint.pyfingerprint import PyFingerprint

#Clase encargada de controlar el fingerprint
class UtilFingerprint:

    #Realiza la coneccion con el fingerprint
    def __init__(self):
        try:
            self.f = PyFingerprint('/dev/ttyS0', 57600, 0xFFFFFFFF, 0x00000000)
            if ( self.f.verifyPassword() == False ):
                raise ValueError('La contrasena del sensor de huella dactilar presento un error.')
        except Exception as e:
            print('The fingerprint sensor could not be initialized!')
            print('Exception message: ' + str(e))
            exit(1)


    #Busca una huella en especifico
    def search(self,selfUtilView):

        try:
            selfUtilView.lblIndication.configure(text="Coloque el dedo en el dispositivo.")

            #Esperando a que sea leido el dedo
            while ( self.f.readImage() == False ):
                pass
            
            #Convierte la imagen en caracteristicas 
            self.f.convertImage(0x01)

            #Se busca la imagen leida en las guardadas previamente
            result = self.f.searchTemplate()
            positionNumber = result[0]
            accuracyScore = result[1]
            if ( positionNumber == -1 ):
                selfUtilView.lblIndication.configure(text="No se encontraron coincidencias.")
                exit(0)
                        
            #Carga la plantilla encontrada en charbuffer 1
            self.f.loadTemplate(positionNumber, 0x01)

            #Descarga las caracteristicas
            characterics = str(self.f.downloadCharacteristics(0x01)).encode('utf-8')
            
            #Sesion
            if(hashlib.sha256(characterics).hexdigest() == "0eff012f344875834a7fe838ab79ba60a9f30999eb586d39d34bde07aca55414"):
                selfUtilView.lblIndication.configure(text="Bienvenido Gustavo")
            else:
                selfUtilView.lblIndication.configure(text="El usuario NO existe")

        except Exception as e:
            print('Mensaje de Excepcion: ' + str(e))
            exit(1)

