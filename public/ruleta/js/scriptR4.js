const ruleta = document.querySelector('#ruleta');
var rand;

function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
}

ruleta.addEventListener('click',girar);
giros = 0;
function girar(){
if(giros < 1){ // Aqui contro la cantidad de giros que quiero que pueda dar
    if (localStorage.getItem("iddata") === localStorage.getItem("triviaid4")){
        rand = between(4775, 4855);
    } else if (localStorage.getItem("iddata") === localStorage.getItem("triviaid3")) {
        rand = between(5045, 5125);
    } else if (localStorage.getItem("iddata") === localStorage.getItem("triviaid1")) {
        rand = between(4955, 5033);
    } else if (localStorage.getItem("iddata") === localStorage.getItem("triviaid2")) {
        rand = between(4865, 4945);
    }

    //let rand = 4775//Math.random()*7200;  
    calcular(rand);
    console.log('rand', rand)
    giros++;
    var sonido = document.querySelector('#audio');
    sonido.setAttribute('src','sonido/ruleta.mp3');
    //document.querySelector('.contador').innerHTML =  ' TURNOS: '+giros;

} 
    

    function premio(premios){
        document.querySelector('.elige').innerHTML = 'Haz click sobre la ruleta: '//+premios;
    }

    function calcular(rand){
        valor = rand/360;
        //console.log('valor', valor)  
        valor = (valor - parseInt(valor.toString().split(".")[0]))*360;
        //console.log('valor1', valor) 
        ruleta.style.transform = "rotate("+rand+"deg";
    }
    setTimeout(() => {

        if (localStorage.getItem("iddata") === localStorage.getItem("triviaid1")){
            valor = 320;
        } else if (localStorage.getItem("iddata") === localStorage.getItem("triviaid2")) {
            valor = 230;
        } else if (localStorage.getItem("iddata") === localStorage.getItem("triviaid3")) {
            valor = 45;
        } else {
            valor = 135;
        }

        switch(true){
            case valor > 0 && valor <= 90: 
                premio(localStorage.getItem("trivia3"))
                var resultado = localStorage.getItem("trivia3")
            break;            
            case valor > 90 && valor <= 180:
                premio(localStorage.getItem("trivia4"))
                var resultado = localStorage.getItem("trivia4")
            break;            
            case valor > 180 && valor <= 270:
                premio(localStorage.getItem("trivia2"))
                var resultado = localStorage.getItem("trivia2")
            break;            
            case valor > 270 && valor <= 360:
                premio(localStorage.getItem("trivia1"))
                var resultado = localStorage.getItem("trivia1")
            break;
            default:
            break;
        }
        document.querySelector("#reproductorc").innerHTML = `<audio controls autoplay class="audio" nodownload id="reproductor">
                                                            <source src="../../../audio/Correct-answer.mp3" type="audio/mp3">
                                                            </audio>`;
        Swal.fire({
            icon: 'success',
            title: 'La trivia seleccionada es '+resultado,
            confirmButtonColor: '#3085d6',
            confirmButtonText:'Aceptar',
            allowOutsideClick:false,
        }).then((result)=>{
            if(result.value == true){            
                window.close();
                // giros = 0;
                // document.querySelector('.elige').innerHTML = 'La trivia escogida es: ';
                //document.querySelector('.contador').innerHTML =  ' Turnos: '+giros;
            }
        })
    },5000);
    
}