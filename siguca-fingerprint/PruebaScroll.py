from Tkinter import *

root=Tk()

frame = Frame(root, bd=2, relief=SUNKEN)
frame.pack(fill=BOTH)

xscrollbar = Scrollbar(frame, orient=HORIZONTAL)
xscrollbar.grid(row=1, column=0, sticky=E+W)

yscrollbar = Scrollbar(frame)
yscrollbar.grid(row=0, column=1, sticky=N+S)

canvas = Canvas(frame, bd=0, scrollregion=(0, 0, 1000, 1000),
                        xscrollcommand=xscrollbar.set,
                                        yscrollcommand=yscrollbar.set)

xscrollbar.config(command=canvas.xview)
yscrollbar.config(command=canvas.yview)

canvas.grid(row=0, column=0, sticky=N+S+E+W)

f=Frame(canvas)
f.pack()

