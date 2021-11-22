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
    if (localStorage.getItem("iddata") === localStorage.getItem("triviaid1")){
        rand = between(3120, 3180);
    } else if (localStorage.getItem("iddata") === localStorage.getItem("triviaid5")) {
        rand = between(3185, 3235);
    } else if (localStorage.getItem("iddata") === localStorage.getItem("triviaid2")) {
        rand = between(3245, 3295);
    } else if (localStorage.getItem("iddata") === localStorage.getItem("triviaid6")) {
        rand = between(2940, 2995);
    } else if (localStorage.getItem("iddata") === localStorage.getItem("triviaid4")) {
        rand = between(3365, 3415);
    } else if (localStorage.getItem("iddata") === localStorage.getItem("triviaid3")) {
        rand = between(3420, 3475);
    }  
    

    // 3120 - 3180 CELESTE
    // 3185 - 3235 ROSADO
    // 3245 - 3295 NARANJO
    // 2940 - 2995 MORADO
    // 3365 - 3415  ROJO

    //let rand = Math.random()*7200;    
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
            valor = 270;
        } else if (localStorage.getItem("iddata") === localStorage.getItem("triviaid2")) {
            valor = 30;
        } else if (localStorage.getItem("iddata") === localStorage.getItem("triviaid3")){
            valor = 210;
        } else if (localStorage.getItem("iddata") === localStorage.getItem("triviaid4")){
            valor = 150;
        } else if (localStorage.getItem("iddata") === localStorage.getItem("triviaid5")){
            valor = 330;
        } else if (localStorage.getItem("iddata") === localStorage.getItem("triviaid6")){
            valor = 90;
        }


        switch(true){
            case valor > 0 && valor <= 60:
                premio(localStorage.getItem("trivia2"))
                var resultado = localStorage.getItem("trivia2")
            break;
            case valor > 60 && valor <= 120:
                premio(localStorage.getItem("trivia6"))
                var resultado = localStorage.getItem("trivia6")
            break;
            case valor > 120 && valor <= 180:
                premio(localStorage.getItem("trivia4"))
                var resultado = localStorage.getItem("trivia4")
            break;
            case valor > 180 && valor <= 240:
                premio(localStorage.getItem("trivia3"))
                var resultado = localStorage.getItem("trivia3")
            break;
            case valor > 240 && valor <= 300:
                premio(localStorage.getItem("trivia1"))
                var resultado = localStorage.getItem("trivia1")
            break;
            case valor > 300 && valor <= 360:
                premio(localStorage.getItem("trivia5"))
                var resultado = localStorage.getItem("trivia5")
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