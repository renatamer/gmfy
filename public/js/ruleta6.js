var socket = io();

socket.on('connect', function(){

    localStorage.clear();
    document.getElementById("demo").innerHTML = "No"
    localStorage.setItem("equipos", "No");

    document.getElementById('btnSend').style.display = "none";
    socket.emit('requestDbNames');//Obtiene los nombres de la BD para mostrar al usuario las trivias disponibles

});

//Llena los options para seleccionar temas ruleta
socket.on('gameNamesData', function(data){

    console.log('Resultados encontrados: ', data.rows.length)

    for(var i = 0; i < data.rows.length; i++){ 
        var select = document.getElementById('listado');
        var option = document.createElement('option')

        option.innerHTML = `<option class="datoInput" value="${data.rows[i].ID_TEMATICA}">${data.rows[i].NOMBRE}</option>`

        select.appendChild(option);
    }

    for(var i = 0; i < data.rows.length; i++){ 
        var select = document.getElementById('listado1');
        var option = document.createElement('option')

        option.innerHTML = `<option class="datoInput" value="${data.rows[i].ID_TEMATICA}">${data.rows[i].NOMBRE}</option>`

        select.appendChild(option);     
    }

    for(var i = 0; i < data.rows.length; i++){ 
        var select = document.getElementById('listado2');
        var option = document.createElement('option')

        option.innerHTML = `<option class="datoInput" value="${data.rows[i].ID_TEMATICA}">${data.rows[i].NOMBRE}</option>`

        select.appendChild(option);     
    }

    for(var i = 0; i < data.rows.length; i++){ 
        var select = document.getElementById('listado3');
        var option = document.createElement('option')

        option.innerHTML = `<option class="datoInput" value="${data.rows[i].ID_TEMATICA}">${data.rows[i].NOMBRE}</option>`

        select.appendChild(option);     
    }

    for(var i = 0; i < data.rows.length; i++){ 
        var select = document.getElementById('listado4');
        var option = document.createElement('option')

        option.innerHTML = `<option class="datoInput" value="${data.rows[i].ID_TEMATICA}">${data.rows[i].NOMBRE}</option>`

        select.appendChild(option);     
    }

    for(var i = 0; i < data.rows.length; i++){ 
        var select = document.getElementById('listado5');
        var option = document.createElement('option')

        option.innerHTML = `<option class="datoInput" value="${data.rows[i].ID_TEMATICA}">${data.rows[i].NOMBRE}</option>`

        select.appendChild(option);     
    }
});

//Guardar trivias seleccionadas en un objeto
function Guardar() {

    Swal.fire({
        icon: 'success',
        title: 'Las trivias seleccionadas fueron guardadas exitosamente!',
        confirmButtonColor: '#3085d6',
        confirmButtonText:'Aceptar',
        allowOutsideClick:false,
    }).then((result)=>{
        if(result.value == true){            
            //window.close();
            // giros = 0;
            // document.querySelector('.elige').innerHTML = 'La trivia escogida es: ';
            //document.querySelector('.contador').innerHTML =  ' Turnos: '+giros;
        }
    })

    document.getElementById('btnSend').style.display = "block";

    function between(min, max) {  
        return Math.floor(
          Math.random() * (max - min) + min
        )
    }
    between(1, 6);

    if (between(1, 6) === 1) {
        var objectInput = {
            id: 1,
            nombre: listado[listado.selectedIndex].text
        }
    } else if (between(1, 6) === 2) {
        var objectInput = {
            id: 2,
            nombre: listado1[listado1.selectedIndex].text
        }
    } else if (between(1, 6) === 3){
        var objectInput = {
            id: 3,
            nombre: listado2[listado2.selectedIndex].text
        }
    } else if (between(1, 6) === 4){
        var objectInput = {
            id: 4,
            nombre: listado3[listado3.selectedIndex].text
        }
    } else if (between(1, 6) === 5){
        var objectInput = {
            id: 5,
            nombre: listado4[listado4.selectedIndex].text
        }
    } else {
        var objectInput = {
            id: 6,
            nombre: listado5[listado5.selectedIndex].text
        }
    }    
    
    var selecttext1 = listado[listado.selectedIndex].text
    var selecttext2 = listado1[listado1.selectedIndex].text
    var selecttext3 = listado2[listado2.selectedIndex].text
    var selecttext4 = listado3[listado3.selectedIndex].text
    var selecttext5 = listado4[listado4.selectedIndex].text
    var selecttext6 = listado5[listado5.selectedIndex].text
    
    localStorage.setItem("trivia1", selecttext1);
    localStorage.setItem("trivia2", selecttext2);
    localStorage.setItem("trivia3", selecttext3);
    localStorage.setItem("trivia4", selecttext4);
    localStorage.setItem("trivia5", selecttext5);
    localStorage.setItem("trivia6", selecttext6);

    var trivias = {
        nombret1: selecttext1,
        nombret2: selecttext2,
        nombret3: selecttext3,
        nombret4: selecttext4,
        nombret5: selecttext5,
        nombret6: selecttext6
    }

    socket.emit('triviaSeleccionada', objectInput);
    socket.emit('buscarID6', trivias);
}

//Iniciar lobby ruleta 6
socket.on('startRuleta', function(data){
    
    //console.log("START RULETA", data.rows[0].ID_TEMATICA)

    var btnSend = document.querySelector('#btnSend');
    localStorage.setItem("iddata", data.rows[0].ID_TEMATICA);;    

    btnSend.setAttribute("onClick", "startGameRuleta6('" + data.rows[0].ID_TEMATICA + "')")    

});

socket.on('enviarID6', function(data){

    for(var i = 0; i < data.rows.length; i++){ 
        if (localStorage.getItem("trivia1") === data.rows[i].NOMBRE) {
            localStorage.setItem("triviaid1", data.rows[i].ID_TEMATICA);
        }

        if (localStorage.getItem("trivia2") === data.rows[i].NOMBRE) {
            localStorage.setItem("triviaid2", data.rows[i].ID_TEMATICA);
        }

        if (localStorage.getItem("trivia3") === data.rows[i].NOMBRE) {
            localStorage.setItem("triviaid3", data.rows[i].ID_TEMATICA);
        }

        if (localStorage.getItem("trivia4") === data.rows[i].NOMBRE) {
            localStorage.setItem("triviaid4", data.rows[i].ID_TEMATICA);
        }

        if (localStorage.getItem("trivia5") === data.rows[i].NOMBRE) {
            localStorage.setItem("triviaid5", data.rows[i].ID_TEMATICA);
        }

        if (localStorage.getItem("trivia6") === data.rows[i].NOMBRE) {
            localStorage.setItem("triviaid6", data.rows[i].ID_TEMATICA);
        }
    }   
    
    // console.log('ID DATA1:', localStorage.getItem("triviaid1"))
    // console.log('ID DATA2:', localStorage.getItem("triviaid2"))
    // console.log('ID DATA3:', localStorage.getItem("triviaid3"))
    // console.log('ID DATA4:', localStorage.getItem("triviaid4"))
 
});

function startGameRuleta6(data){    
    window.location.href="../host/lobby_ruleta6.html" + "?id=" + data;
}

function cambiar() {

    var equipo = document.getElementById("cambiar").value;

    if (equipo === 'No') {
        var opcion = document.getElementById("cambiar").value = 'Si';
        document.getElementById("demo").innerHTML = opcion;
        localStorage.setItem("equipos", opcion);
        alert('Has seleccionado la opción por equipos!')
        console.log('Equipos: ', localStorage.getItem("equipos"))
    } else {
        var opcion = document.getElementById("cambiar").value = 'No';
        document.getElementById("demo").innerHTML = opcion;
        localStorage.setItem("equipos", opcion);
        alert('Has seleccionado la opción por individual!')
        console.log('Equipos: ', localStorage.getItem("equipos"))
    }
}
