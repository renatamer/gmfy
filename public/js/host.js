var socket = io();
var params = jQuery.deparam(window.location.search);
const userList = document.getElementById('players');
const chatMessages = document.querySelector('.chat-messages');
var avatares;
var numero;



//Cuando el HOST se conecta al servidor
socket.on('connect', function() {

    document.getElementById('equipos').style.display = "none";
    
    //Comunica al servidor que es una conexion de HOST
    socket.emit('host-join', params);
    socket.emit('cargarAvatar'); //Obtiene los avatar de la BD para mostrar al usuario
});

socket.on('showGamePin', function(data){
   document.getElementById('gamePinText').innerHTML = data.pin;
});


//Trae array de avatar
socket.on('enviarListaAvatar', function(data){ 
    avatares = data.rows
    numero = data.rows.length
});

//Agrega el nombre del jugador a la pantalla y actualiza el recuento de jugadores
socket.on('updatePlayerLobby', function(data, equipo1, equipo2){

    console.log(data[0].gameData.equipo)
 
    // userList.innerHTML = '';
    document.querySelector('.jugadores').innerHTML = '';

    if (localStorage.getItem("equipos") === 'No') {
        for(var i = 0; i < data.length; i++){
            const div = document.createElement('div');    
    
            if (numero === 0){
                div.innerHTML = `<div class="card">
                <div class="data">
                    <img src="../avatar/noavatar.png" class="cardimg">
                </div>
                    <h1 class="cardname"><b>${data[i].name}</b></h1>
                </div> 
                </div><br>`;
    
                document.querySelector('.jugadores').appendChild(div);                 
                document.getElementById('playersLogged').innerHTML = "Jugadores conectados: " + data.length;
    
                document.querySelector("#reproductorc").innerHTML = `<audio controls autoplay class="audio" nodownload id="reproductor">
                                                                <source src="../../../audio/notification.wav" type="audio/wav">
                                                                </audio>`;
    
            }else{
                div.innerHTML = `<div class="card">
                <div class="data">
                    <img src="../${avatares[i].AVATAR}" class="cardimg">                
                </div>
                    <h1 class="cardname"><b>${data[i].name}</b></h1>            
                </div> 
                </div><br>`;
    
                document.querySelector('.jugadores').appendChild(div); 
                document.getElementById('playersLogged').innerHTML = "Jugadores conectados: " + data.length;
    
                document.querySelector("#reproductorc").innerHTML = `<audio controls autoplay class="audio" nodownload id="reproductor">
                                                                <source src="../../../audio/notification.wav" type="audio/wav">
                                                                </audio>`;
            }
        }
    } else {
        for(var i = 0; i < data.length; i++){
            const div = document.createElement('div');    
    
            if (numero === 0){
                div.innerHTML = `<div class="card">
                <div class="data">
                    <img src="../avatar/noavatar.png" class="cardimg">
                </div>
                    <h1 class="cardname"><b id="parname">${data[i].name}</b></h1>
                    <h6 id="equipoact" disabled>${data[i].gameData.equipo}</b>   
                </div> 
                </div><br>`;
    
                document.querySelector('.jugadores').appendChild(div);
                document.getElementById('equipos').style.display = "block";
                document.getElementById('equipo1').innerHTML = "Equipo 1: " + equipo1;
                document.getElementById('equipo2').innerHTML = "Equipo 2: " + equipo2;
                document.getElementById('playersLogged').innerHTML = "Jugadores conectados: " + data.length;
    
                document.querySelector("#reproductorc").innerHTML = `<audio controls autoplay class="audio" nodownload id="reproductor">
                                                                <source src="../../../audio/notification.wav" type="audio/wav">
                                                                </audio>`;
    
            } else {
                div.innerHTML = `<div class="card">
                <div class="data">
                    <img src="../${avatares[i].AVATAR}" class="cardimg">                
                </div>
                    <h1 class="cardname"><b id="parname">${data[i].name}</b></h1> 
                    <h6 id="equipoact" disabled>${data[i].gameData.equipo}</b>      
                </div> 
                </div><br>`;
    
                document.querySelector('.jugadores').appendChild(div); 
                document.getElementById('equipos').style.display = "block";
                document.getElementById('equipo1').innerHTML = "Equipo 1: " + equipo1;
                document.getElementById('equipo2').innerHTML = "Equipo 2: " + equipo2;
                document.getElementById('playersLogged').innerHTML = "Jugadores conectados: " + data.length;
    
                document.querySelector("#reproductorc").innerHTML = `<audio controls autoplay class="audio" nodownload id="reproductor">
                                                                <source src="../../../audio/notification.wav" type="audio/wav">
                                                                </audio>`;
            }
        }
    }
    

});


//Mensajes del servidor
socket.on('message', message => {
    console.log(message);
    outputMessage(message);
});

//Scroll down mensajes
chatMessages.scrollTop = chatMessages.scrollHeight;


//Mensajes de salida al DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}


//Comunica al servidor que inicie el juego si se hace click en el botón
function startGame(){
    socket.emit('startGame');
}

//Pregunta al anfitrion antes de terminar la partida
function endGame(){
    document.getElementById('cancel').addEventListener('click', () => {
        const leaveRoom = confirm('Estas seguro que quieres terminar la partida?');
        if (leaveRoom) {
        window.location.href = "/";
        }
    });
};


//Cuando el servidor comienza el juego
socket.on('gameStarted', function(id){
    
    document.querySelector("#reproductorc").innerHTML = `<audio controls autoplay class="audio" nodownload id="reproductor">
                                                            <source src="../../../audio/countdown.wav" type="audio/wav">
                                                            </audio>`;
    setTimeout(() => {
        console.log('Game Started!');
        window.location.href="/host/game/" + "?id=" + id;
    },4000);
    
});


socket.on('noGameFound', function(){
   window.location.href = '../../';//Redirige al usuario a la página de 'unirse al juego' si no encuentra una trivia
});


function abreRuleta4() {
    window.open('../ruleta/Ruleta4_start.html', 'rating', "width=1600, height=600, left=500, top=0");
    document.getElementById('startTrivia').style.display = "none";
    document.getElementById('start').style.display = "block";
}

function abreRuleta6() {
    window.open('../ruleta/Ruleta6_start.html', 'rating', "width=1600, height=600, left=500, top=0");
    document.getElementById('startTrivia').style.display = "none";
    document.getElementById('start').style.display = "block";
}


