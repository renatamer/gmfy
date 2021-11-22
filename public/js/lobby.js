var socket = io();
var equipos = localStorage.getItem("equipos");

//Obtener nombre de la URL
const { name, pin } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

console.log(name, pin );


//Cuando el jugador se conecta al servidor
socket.on('connect', function() {

    //Unirse al servidor
    socket.emit('joinRoom', { name, pin });

    var params = jQuery.deparam(window.location.search); //Obtiene los datos de la url
    
    //Indica al servidor que hay un jugador conectado
    socket.emit('player-join', params, equipos);
});


//Envia al jugador devuelta si no hay un juego creado
socket.on('noGameFound', function(){
    window.location.href = '../';
});
//Si se cae el anfitrion, devuelve al jugador a la pantalla de inicio
socket.on('hostDisconnect', function(){
    window.location.href = '../';
});

//Cuando el anfitrion empieza el juego, transfiere al jugador a la pantalla de partida
socket.on('gameStartedPlayer', function(){
    window.location.href="/player/game/" + "?id=" + socket.id;
});


