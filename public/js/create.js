var socket = io();
localStorage.clear();

socket.on('connect', function(){
    socket.emit('requestDbNames');//Obtiene los nombres de la BD para mostrar al usuario las trivias disponibles
    
    document.getElementById("demo").innerHTML = "No"
    localStorage.setItem("equipos", "No");
    //console.log('Equipos: ', localStorage.getItem("equipos"))
});

socket.on('gameNamesData', function(data){

    console.log('Resultados encontrados: ', data.rows.length)

    for(var i = 0; i < data.rows.length; i++){
        var div = document.getElementById('game-list');
        var button = document.createElement('button')

        //console.log('Icono: ', data.rows[i].ICONO)
        // button.innerHTML = data.rows[i].NOMBRE;
        button.innerHTML = `<div class="view_item">
        <div class="vi_left">
            <img src="../${data.rows[i].ICONO}">
        </div>
        <div class="vi_right">
            <p class="title">${data.rows[i].NOMBRE}</p><br>
        </div>
        </div> `
        button.setAttribute('onClick', "startGame('" + data.rows[i].ID_TEMATICA + "')");
        button.setAttribute('id', 'gameButton');
        
        div.appendChild(button);
    }
});

function startGame(data){
    window.location.href="/host/" + "?id=" + data;
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
