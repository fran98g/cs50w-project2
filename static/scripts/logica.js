// Connect to websocket
const socket = io()

// Conectado
socket.on('connect', () => {
    // Prueba si esta conectado)?
    console.log("Conectado :)")

    let info = {
        room: localStorage.getItem("room"),
        username: localStorage.getItem("username")
    }

    // Conectar por primera vez
    socket.emit("unirse", info);

    actualizar_chat();

})

function enviarmsg() {
    let t = new Date();
    let mensaje = document.querySelector('#msgin').value;
    document.querySelector('#msgin').value = "";
    let tiempo = t.getHours() + ":" + t.getMinutes() + "  " + t.getDate() + "/" + t.getMonth() + "/" + t.getFullYear() 

    let info = {
        username: localStorage.getItem('username'),
        text: mensaje,
        room: localStorage.getItem('room'),
        time: tiempo,
        tipo: "mensaje"
    };

    socket.emit('sendmsg', info);
    return false;
}

function create() {
    let room = document.querySelector('#room_name').value;
    document.querySelector('#room_name').value = "";
    if (room.rooms == localStorage.getItem('room')) {
        alert(room.error);
    } else {
        socket.emit('create', { sala: room });

    }

}



function unirse(room) {

    salir(localStorage.room);

    // Guardamos la nueva sala en la sesion
    localStorage.setItem('room', room)

    let info = {
        room: localStorage.getItem('room'),
        username: localStorage.getItem('username')
    }

    // Unimos a la sala
    socket.emit('unirse', info);
}

function salir() {
    let info = {
        room: localStorage.getItem('room'),
        username: localStorage.getItem('username')
    }

    socket.emit('salirse', info);

}

function fusion(room) {
    console.log("funcionaaaa")
    salir(localStorage.getItem("room"));
    localStorage.setItem("room", room);
    unirse(room)
    document.querySelector("#msgbox").innerHTML = "";
    actualizar_chat()
}

function actualizar_chat() {
    console.log("entra");
    let room = localStorage.getItem('room');

    let request = new XMLHttpRequest();
    request.open('GET', '/msg_list/' + room);
    request.send();

    request.onreadystatechange = function () {

        if (request.readyState == 4) {
            if (request.status == 200) {


                let mensajes = JSON.parse(request.response);

                for (let i = 0; i < mensajes.length; i++) {
                    let info = mensajes[i];

                    let container = document.querySelector("#msgbox");

                    let msg = document.createElement('div');
                    
                    let username = document.createElement('span');
                    let text = document.createElement('p');

                    username.textContent = info.username + "    " + info.time+":";

                    // Verificando sticker
                    if (info.tipo == "sticker") {
                        let conte = document.createElement('div');
                        conte.classList.add('stickers-container', 'my-2');
                        let imagen = document.createElement('img')
                        imagen.src = info.text;
                        imagen.classList.add('stickermsg')
                        conte.appendChild(imagen)
                        text = conte;
                    } else {
                        text.textContent = info.text;
                    }

                    msg.appendChild(username);
                    msg.appendChild(text);

                    if (info.username == localStorage.getItem('username')) {
                        msg.classList.add('msg-enviado', 'text-end');
                    } else {
                        msg.classList.add('msg-recibido', 'text-start');
                    }

                    msg.classList.add('mx-2', 'px-2', 'pt-3');

                    container.appendChild(msg);

                }

            }

        }
    };

}


function traer_stickers() {
    let container = document.querySelector("#stickers");

    let ajax = new XMLHttpRequest();
    ajax.open('GET', '/stickers');
    ajax.send();

    ajax.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                container.innerHTML = this.responseText;
                container.addEventListener('click', elegir_sticker);


            }
            else {
                container.innerHTML = "No hay info que mostrar";
            }
        }
    }
}

function elegir_sticker(e) {
    let imagen = e.target.src;
    enviar_sticker(imagen);
    document.getElementById('cierremodal').click();
    container.removeEventListener('click', elegir_sticker)
}

function enviar_sticker(sticker) {
    let t = new Date();
    let tiempo = t.getHours() + ":" + t.getMinutes() + "  " + t.getDate() + "/" + t.getMonth() + "/" + t.getFullYear() 

    let info = {
        username: localStorage.getItem('username'),
        text: sticker,
        room: localStorage.getItem('room'),
        time: tiempo,
        tipo: "sticker"

    };

    socket.emit('sendmsg', info);
    return false;
}

// Recepcion de sockets

socket.on('msgnuevo', info => {

    let container = document.querySelector("#msgbox");

    let msg = document.createElement('div');

    let username = document.createElement('span');
    let text = document.createElement('p');

    username.textContent = info.username + "    " + info.time + ":";
    // Verificando sticker
    if (info.tipo == "sticker") {
        let conte = document.createElement('div');
        conte.classList.add('stickers-container', 'my-2');
        let imagen = document.createElement('img')
        imagen.src = info.text;
        imagen.classList.add('stickermsg')
        conte.appendChild(imagen)
        text = conte;
    } else {
        text.textContent = info.text;
    }

    msg.appendChild(username);
    msg.appendChild(text);

    if (info.username == localStorage.getItem('username')) {
        msg.classList.add('msg-enviado', 'text-end');
    } else {
        msg.classList.add('msg-recibido', 'text-start');
    }

    msg.classList.add('mx-2', 'px-2', 'pt-3');

    container.appendChild(msg);

});


socket.on("ingresado", info => {

    let container = document.querySelector("#msgbox");


    let msgsever = document.createElement("div");
    msgsever.classList.add("servermsg", "text-center", "mx-2", "my-3");
    msgsever.textContent = "<<" + info.msg + ">>";


    container.appendChild(msgsever)
    container.innerHTML += "<br>";
})

socket.on("abandonar", info => {

    let container = document.querySelector("#msgbox");

    container.innerHTML += info.msg;

})

socket.on("salita", room => {


    let sala = document.querySelector("#room_list");

    let item = document.createElement('li');

    let salita = document.createElement('button');

    salita.classList.add("canalbtn")
    salita.textContent = "#" + room["sala"]
    let funcion = "fusion('" + room.sala + "')";
    salita.setAttribute("onclick", funcion);
    item.appendChild(salita);
    sala.appendChild(item);

})