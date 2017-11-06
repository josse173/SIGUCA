#Importaciones
import io
import base64

try:
    # Python2
    import Tkinter as tk
    from urllib2 import urlopen
except ImportError:
    # Python3
    import tkinter as tk
    from urllib.request import urlopen

#Declaracion de la clase que maneja las imagenes por URL
class UtilImg:
        
        def __init__(self):
                 pass

        #Variables globales
        url = "http://10.42.30.19:3000/uploads/"

        #Funcion que recibe la imagen deseada y la obtiene de la url planteada inicialmente
        def getImageURL(self, img):

            image_url = self.url+img
            
            image_byt = urlopen(image_url).read()
            image_b64 = base64.encodestring(image_byt)
            photo = tk.PhotoImage(data=image_b64)
            return photo
