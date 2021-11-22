var socket = io();
var playerAnswered = false;
var correct = false;
var name;
var score = 0;

var params = jQuery.deparam(window.location.search); //Gets the id from url

socket.on('connect', function() {
    //Tell server that it is host connection from game view
    socket.emit('player-join-game', params);
    
    document.getElementById('answer1').style.visibility = "visible";
    document.getElementById('answer2').style.visibility = "visible";
    document.getElementById('answer3').style.visibility = "visible";
    document.getElementById('answer4').style.visibility = "visible";
});

socket.on('noGameFound', function(){
    window.location.href = '../../';//Redirect user to 'join game' page 
});

function answerSubmitted(num){
    if(playerAnswered == false){
        playerAnswered = true;
        
        socket.emit('playerAnswer', num);//Sends player answer to server
        
        //Hiding buttons from user
        document.getElementById('answer1').style.visibility = "hidden";
        document.getElementById('answer2').style.visibility = "hidden";
        document.getElementById('answer3').style.visibility = "hidden";
        document.getElementById('answer4').style.visibility = "hidden";
        document.getElementById('message').style.display = "block";
        document.getElementById('message').innerHTML = "Respuesta enviada! Esperando a los demas jugadores...";
        
    }
}

//Obtiene resultados de la ultima pregunta
socket.on('answerResult', function(data){
    if(data == true){
        correct = true;
    }
});


socket.on('questionOver', function(data){
    if(correct == true){
        document.body.style.backgroundColor = "#4CAF50";
        document.getElementById('message').style.display = "block";
        document.getElementById('message').innerHTML = "Correcto!";
    }else{
        document.body.style.backgroundColor = "#f94a1e";
        document.getElementById('message').style.display = "block";
        document.getElementById('message').innerHTML = "Incorrecto!";
    }
    document.getElementById('answer1').style.visibility = "hidden";
    document.getElementById('answer2').style.visibility = "hidden";
    document.getElementById('answer3').style.visibility = "hidden";
    document.getElementById('answer4').style.visibility = "hidden";

    socket.emit('getScore'); 
});

//RANKING PARCIAL
socket.on('Rank', function(data){   
    document.getElementById('rankingNom1').innerHTML = data.num1;
    document.getElementById('rankingPtos1').innerHTML = data.sc1;
    document.getElementById('rankingNom2').innerHTML = data.num2;
    document.getElementById('rankingPtos2').innerHTML = data.sc2;
    document.getElementById('rankingNom3').innerHTML = data.num3;
    document.getElementById('rankingPtos3').innerHTML = data.sc3;
    document.getElementById('rankingNom4').innerHTML = data.num4;
    document.getElementById('rankingPtos4').innerHTML = data.sc4;
    document.getElementById('rankingNom5').innerHTML = data.num5;
    document.getElementById('rankingPtos5').innerHTML = data.sc5;
});

socket.on('newScore', function(data){
    document.getElementById('scoreText').innerHTML = "Puntaje: " + data;
    document.querySelector(".content-table").style.display = "block";
});

socket.on('nextQuestionPlayer', function(){
    correct = false;
    playerAnswered = false;
    
    document.querySelector(".content-table").style.display = "none";
    document.getElementById('answer1').style.visibility = "visible";
    document.getElementById('answer2').style.visibility = "visible";
    document.getElementById('answer3').style.visibility = "visible";
    document.getElementById('answer4').style.visibility = "visible";
    document.getElementById('message').style.display = "none";
    document.body.style.backgroundColor = "#11111d";
    
});

socket.on('hostDisconnect', function(){
    window.location.href = "../../";
});

socket.on('playerGameData', function(data){
   for(var i = 0; i < data.length; i++){
       if(data[i].playerId == socket.id){
           document.getElementById('nameText').innerHTML = "Nombre: " + data[i].name;
           document.getElementById('scoreText').innerHTML = "Puntaje: " + data[i].gameData.score;
           document.getElementById('teamText').innerHTML = "Equipo: " + data[i].gameData.equipo;
       }
   }
});

socket.on('GameOver', function(){
    document.body.style.backgroundColor = "#11111d";
    document.getElementById('answer1').style.visibility = "hidden";
    document.getElementById('answer2').style.visibility = "hidden";
    document.getElementById('answer3').style.visibility = "hidden";
    document.getElementById('answer4').style.visibility = "hidden";
    document.getElementById('message').style.display = "block";   
    document.getElementById('message').innerHTML = "PARTIDA TERMINADA";
    document.querySelector(".nuevo").style.display = "block";
});

