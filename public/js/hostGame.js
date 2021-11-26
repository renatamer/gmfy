var socket = io();
var params = jQuery.deparam(window.location.search); //Obtiene el id de la URL
var timer;
var time = 0;

//Cuando el host se conecta al servidor
socket.on('connect', function() {
    
    //Informa al servidor que es una conexión de host desde la vista del juego
    socket.emit('host-join-game', params);
});

socket.on('noGameFound', function(){
   window.location.href = '../../';//Redirigir al usuario a la página de 'unirse al juego'
});

socket.on('gameQuestions', function(data){

    document.getElementById('answer1').style.display = "block";
    document.getElementById('answer2').style.display = "block";
    document.getElementById('answer3').style.display = "block";
    document.getElementById('answer4').style.display = "block";

    if (data.audio == null) {        
        document.querySelector("#reproductorc").innerHTML = `<audio controls autoplay class="audio" nodownload loop id="reproductor">
                                                            <source src="../../../audio/quizmusic.mp3" type="audio/mp3">
                                                            </audio>`;
        document.getElementById('reproductor').style.display = "none";
    } else {
        
        document.querySelector("#reproductorc").innerHTML = `<audio controls autoplay class="audio" nodownload id="reproductor">
                                                            <source src="../../../${data.audio}" type="audio/mp3">
                                                            </audio>`;
        document.getElementById('reproductor').style.display = "block";
    }

    document.getElementById('question').innerHTML = data.q1;
    document.getElementById('answer1').innerHTML = data.a1;
    document.getElementById('answer2').innerHTML = data.a2;
    document.getElementById('answer3').innerHTML = data.a3;
    document.getElementById('answer4').innerHTML = data.a4;
    var correctAnswer = data.correct;
    document.getElementById('playersAnswered').innerHTML = "Jugadores Listos 0 / " + data.playersInGame;
    updateTimer(data.tiempo);    
});

socket.on('updatePlayersAnswered', function(data){
   document.getElementById('playersAnswered').innerHTML = "Jugadores Listos " + data.playersAnswered + " / " + data.playersInGame; 
});

socket.on('questionOver', function(playerData, correct){

    clearInterval(timer);
    var answer1 = 0;
    var answer2 = 0;
    var answer3 = 0;
    var answer4 = 0;
    var total = 0;
    //Ocultar elementos en la página
    document.getElementById('playersAnswered').style.display = "none";
    document.getElementById('timer').style.display = "none";

    if (localStorage.getItem("equipos") === 'No'){
        document.getElementById('RankEquipo').style.display = "none"; 
    } else {
        document.getElementById('RankEquipo').style.display = "inline-block"; 
    }    
       
    document.getElementById('RankIndividual').style.display = "inline-block";

    document.querySelector("#reproductorc").innerHTML = `<audio controls autoplay class="audio" nodownload id="reproductor">
                                                            <source src="../../../audio/correct-answer.wav" type="audio/wav">
                                                            </audio>`;
    document.getElementById('reproductor').style.display = "none";
    
    //Muestra la respuesta correcta del usuario con efectos en los elementos.
    if(correct == 1){
        document.getElementById('answer2').style.filter = "grayscale(50%)";
        document.getElementById('answer3').style.filter = "grayscale(50%)";
        document.getElementById('answer4').style.filter = "grayscale(50%)";
        var current = document.getElementById('answer1').innerHTML;
        document.getElementById('answer1').innerHTML = "&#10004" + " " + current;

    }else if(correct == 2){
        document.getElementById('answer1').style.filter = "grayscale(50%)";
        document.getElementById('answer3').style.filter = "grayscale(50%)";
        document.getElementById('answer4').style.filter = "grayscale(50%)";
        var current = document.getElementById('answer2').innerHTML;
        document.getElementById('answer2').innerHTML = "&#10004" + " " + current;

    }else if(correct == 3){
        document.getElementById('answer1').style.filter = "grayscale(50%)";
        document.getElementById('answer2').style.filter = "grayscale(50%)";
        document.getElementById('answer4').style.filter = "grayscale(50%)";
        var current = document.getElementById('answer3').innerHTML;
        document.getElementById('answer3').innerHTML = "&#10004" + " " + current;

    }else if(correct == 4){
        document.getElementById('answer1').style.filter = "grayscale(50%)";
        document.getElementById('answer2').style.filter = "grayscale(50%)";
        document.getElementById('answer3').style.filter = "grayscale(50%)";
        var current = document.getElementById('answer4').innerHTML;
        document.getElementById('answer4').innerHTML = "&#10004" + " " + current;
    }
    
    for(var i = 0; i < playerData.length; i++){
        if(playerData[i].gameData.answer == 1){
            answer1 += 1;
        }else if(playerData[i].gameData.answer == 2){
            answer2 += 1;
        }else if(playerData[i].gameData.answer == 3){
            answer3 += 1;
        }else if(playerData[i].gameData.answer == 4){
            answer4 += 1;
        }
        total += 1;
    }
  
    document.getElementById('nextQButton').style.display = "block"; 
    

});

function RankEquipo() {

    document.querySelector("#REquipo").style.display = "block";
    document.querySelector("#RParcial").style.display = "none";
    socket.emit('getScoreTeam'); 
    
}

function RankIndividual() {

    document.querySelector("#RParcial").style.display = "block";
    document.querySelector("#REquipo").style.display = "none";  
    socket.emit('getScoreTeam');     
}

//RANKING PARCIAL
socket.on('RankInd', function(data){   
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

socket.on('RankTeam', function(data){   
    document.getElementById('RNom1').innerHTML = data.eq1;
    document.getElementById('RPtos1').innerHTML = data.pj1;
    document.getElementById('RNom2').innerHTML = data.eq2;
    document.getElementById('RPtos2').innerHTML = data.pj2;
});


function nextQuestion(){
    document.getElementById('nextQButton').style.display = "none";
    document.getElementById('RankEquipo').style.display = "none";
    document.getElementById('RankIndividual').style.display = "none";
    document.getElementById('RParcial').style.display = "none";
    document.getElementById('REquipo').style.display = "none";
    
    document.getElementById('answer1').style.filter = "none";
    document.getElementById('answer2').style.filter = "none";
    document.getElementById('answer3').style.filter = "none";
    document.getElementById('answer4').style.filter = "none";
    
    document.getElementById('playersAnswered').style.display = "block";
    document.getElementById('timer').style.display = "flex";
    document.getElementById('num').innerHTML = " ";
    document.querySelector("#reproductor").innerHTML = `<source src=" " type="audio/mp3">`;

    socket.emit('nextQuestion'); //Indica al servidor que comience una nueva pregunta
   
}

function updateTimer(tiempo){
    time = tiempo + 1;
    timer = setInterval(function(){
        time -= 1;
        document.getElementById('num').textContent = " " + time;
        if(time == 1){
            socket.emit('timeUp');
        }
    }, 1000);
}
socket.on('GameOver', function(data){

    if (data.audio == null) {        
        document.querySelector("#reproductorc").innerHTML = `<audio controls autoplay class="audio" nodownload id="reproductor">
                                                            <source src="../../../audio/game-over.wav" type="audio/wav">
                                                            </audio>`;
    }

    document.getElementById('reproductor').style.display = "none";
    document.getElementById('nextQButton').style.display = "none";
    document.getElementById('RankEquipo').style.display = "none";
    document.getElementById('RankIndividual').style.display = "none";
    document.getElementById('RParcial').style.display = "none";
    document.getElementById('REquipo').style.display = "none";
    
    document.getElementById('question').style.display = "none";
    document.getElementById('answer1').style.display = "none";
    document.getElementById('answer2').style.display = "none";
    document.getElementById('answer3').style.display = "none";
    document.getElementById('answer4').style.display = "none";
    document.getElementById('timer').style.display = "none";
    // document.getElementById('timerText').innerHTML = "PARTIDA TERMINADA";
    document.getElementById('question').innerHTML = " ";
    document.getElementById('playersAnswered').innerHTML = "";
    
    
    
    document.querySelector("#RFinal").style.display = "block";

    if (localStorage.getItem("equipos") === 'No'){
        document.querySelector("#REquipoF").style.display = "none";
    } else {
        document.querySelector("#REquipoF").style.display = "block";
    }    
    document.querySelector(".nuevo").style.display = "block";
    
    document.getElementById('rankingNom1F').innerHTML = data.numf1;
    document.getElementById('rankingPtos1F').innerHTML = data.scf1;
    document.getElementById('rankingNom2F').innerHTML = data.numf2;
    document.getElementById('rankingPtos2F').innerHTML = data.scf2;
    document.getElementById('rankingNom3F').innerHTML = data.numf3;
    document.getElementById('rankingPtos3F').innerHTML = data.scf3;
    document.getElementById('rankingNom4F').innerHTML = data.numf4;
    document.getElementById('rankingPtos4F').innerHTML = data.scf4;
    document.getElementById('rankingNom5F').innerHTML = data.numf5;
    document.getElementById('rankingPtos5F').innerHTML = data.scf5;

    document.getElementById('RNom1F').innerHTML = data.eqf1;
    document.getElementById('RPtos1F').innerHTML = data.pjf1;
    document.getElementById('RNom2F').innerHTML = data.eqf2;
    document.getElementById('RPtos2F').innerHTML = data.pjf2;
});

socket.on('getTime', function(player){
    socket.emit('time', {
        player: player,
        time: time
    });
});

function playAudio() {
    document.getElementById("audio").play();
}




















