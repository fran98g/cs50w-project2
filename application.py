import os
from urllib.request import Request

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from stickers import STICKERS

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
# Connection
socketio = SocketIO(app, cors_allowed_origins='*')

# Variables globales
MAXIMO_DE_MENSAJES = 100
usuarios = []
rooms = ["general"]
msgs = {
    "general":[],
}

@app.route('/')
def index():
    return render_template('index.html', rooms= rooms)

@app.route('/login', methods = ["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template('login.html')
    else:

        username  = request.form.get('username')
        
        if len(username) == 0:
            return "Debes escribir un nombre",400

        if " " in username:
            return "Escribe un nombre sin espacios",400

        if username not in usuarios:
            usuarios.append(username)
            return "Usuario registrado",200
        else:
            return "Usuario ya registrado",400

@app.route("/msg_list/<room>")
def listar_mensajes(room):
    if not room in rooms:
        items = []
        return  jsonify(items)
    else:
        items = msgs.get(room)
        if not items:
            return jsonify([])
        return  jsonify(items)

# Stickers
@app.route("/stickers")
def sticker_all():

    return render_template("stickers.html", stickers = STICKERS)


@socketio.on("sendmsg")
def sendmsg(msg):
    print(msg)

    room = msg["room"]

    # Verificar si la sala existe
    if not room in rooms:
        return

    # Verificar si hay mensajes en la sala, si no hay se crea el vacio
    if not msgs.get(room):
        msgs[room] = []

    # Maximo de mensajes
    if len(msgs[room]) > MAXIMO_DE_MENSAJES - 1:
        msgs[room].pop(0)

    # Agregar el nuevo mensaje al final
    msgs[room].append(msg)

    emit('msgnuevo', msg, room=room)


@socketio.on("unirse")
def unirse(info):
    username = info["username"]
    room = info["room"]

    if room not in rooms:
        rooms.append(room)

    msg = {
        "msg": f"""{username} ha entrado a {room}\n"""
    }

    join_room(room)
    emit("ingresado", msg, to=room)


@socketio.on("salirse")
def salirse(info):
    username = info["username"]
    room = info["room"]
    print(room)
    msg = {
        "msg": f"""{username} ha salido al room"""
    }

    leave_room(room)
    emit("abandonar", msg, to=room)

@socketio.on("create")
def create(room):
    print("Entrando a crear ")
   
    sala = room["sala"]
    # Verificar si la sala existe
    if not sala in rooms:
        rooms.append(sala)
    else:
        # No permitir crear otra sala que exista
        return "la sala ya existe :c"

    print(sala)
    emit('salita', room, broadcast=True)

# Opcional
if __name__ == '__main__':
    socketio.run(app)