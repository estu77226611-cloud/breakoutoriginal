// ==============================
// EJERCICIO 1
// ==============================

var canvas = document.getElementById("myCanvas");      // Obtiene el elemento canvas del HTML.
var ctx = canvas.getContext("2d");                     // Obtiene el contexto 2D para dibujar.

ctx.beginPath();                                       // Inicia un nuevo trazado.
ctx.rect(20, 40, 50, 50);                             // Dibuja un rectángulo en la posición (20,40).
ctx.fillStyle = "#FF0000";                            // Define el color de relleno en rojo.
ctx.fill();                                            // Rellena el rectángulo.
ctx.closePath();                                       // Finaliza el trazado.

ctx.beginPath();                                       // Inicia un nuevo trazado.
ctx.arc(240, 160, 20, 0, Math.PI * 2, false);         // Dibuja un círculo con radio de 20 píxeles.
ctx.fillStyle = "green";                              // Define el color de relleno en verde.
ctx.fill();                                            // Rellena el círculo.
ctx.closePath();                                       // Finaliza el trazado.

ctx.beginPath();                                       // Inicia un nuevo trazado.
ctx.rect(160, 10, 100, 40);                           // Dibuja un rectángulo de 100x40 píxeles.
ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";             // Define el color del borde azul transparente.
ctx.stroke();                                          // Dibuja únicamente el borde.
ctx.closePath();                                       // Finaliza el trazado.


// ==============================
// EJERCICIO 2
// ==============================

var ballRadius = 10;                                   // Define el radio de la bola.
var x = canvas.width / 2;                              // Posición inicial de la bola en el centro horizontal.
var y = canvas.height - 30;                            // Posición inicial de la bola cerca de la parte inferior.
var dx = 2;                                            // Velocidad horizontal de la bola.
var dy = -2;                                           // Velocidad vertical de la bola.

function drawBall() {                                  // Función que dibuja la bola.
    ctx.beginPath();                                   // Inicia un nuevo trazado.
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);         // Dibuja la bola.
    ctx.fillStyle = "#0095DD";                         // Define el color azul.
    ctx.fill();                                        // Rellena la bola.
    ctx.closePath();                                   // Finaliza el trazado.
}


// ==============================
// EJERCICIO 3
// ==============================

// En este ejercicio se agrega el rebote de la bola dentro de la función draw().


// ==============================
// EJERCICIO 4
// ==============================

var paddleHeight = 10;                                 // Define la altura de la paleta.
var paddleWidth = 75;                                  // Define el ancho de la paleta.
var paddleX = (canvas.width - paddleWidth) / 2;        // Ubica la paleta en el centro.
var rightPressed = false;                              // Indica si la flecha derecha está presionada.
var leftPressed = false;                               // Indica si la flecha izquierda está presionada.

document.addEventListener("keydown", keyDownHandler, false); // Detecta cuando se presiona una tecla.
document.addEventListener("keyup", keyUpHandler, false);     // Detecta cuando se suelta una tecla.

function keyDownHandler(e) {                           // Función que detecta la tecla presionada.
    if (e.keyCode == 39) {                             // Verifica si se presionó la flecha derecha.
        rightPressed = true;                           // Activa el movimiento hacia la derecha.
    }
    else if (e.keyCode == 37) {                        // Verifica si se presionó la flecha izquierda.
        leftPressed = true;                            // Activa el movimiento hacia la izquierda.
    }
}

function keyUpHandler(e) {                             // Función que detecta cuando se libera una tecla.
    if (e.keyCode == 39) {                             // Verifica si se soltó la flecha derecha.
        rightPressed = false;                          // Detiene el movimiento hacia la derecha.
    }
    else if (e.keyCode == 37) {                        // Verifica si se soltó la flecha izquierda.
        leftPressed = false;                           // Detiene el movimiento hacia la izquierda.
    }
}

function drawPaddle() {                                // Función que dibuja la paleta.
    ctx.beginPath();                                   // Inicia un nuevo trazado.
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight); // Dibuja la paleta.
    ctx.fillStyle = "#0095DD";                         // Define el color azul.
    ctx.fill();                                        // Rellena la paleta.
    ctx.closePath();                                   // Finaliza el trazado.
}

function draw() {                                      // Función principal de la animación.
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Limpia el canvas.
    drawBall();                                        // Dibuja la bola.
    drawPaddle();                                      // Dibuja la paleta.

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) { // Verifica los bordes laterales.
        dx = -dx;                                      // Invierte la dirección horizontal.
    }

    if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) { // Verifica los bordes superior e inferior.
        dy = -dy;                                      // Invierte la dirección vertical.
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) { // Comprueba si se mueve a la derecha.
        paddleX += 7;                                  // Desplaza la paleta hacia la derecha.
    }
    else if (leftPressed && paddleX > 0) {             // Comprueba si se mueve a la izquierda.
        paddleX -= 7;                                  // Desplaza la paleta hacia la izquierda.
    }

    x += dx;                                           // Actualiza la posición horizontal de la bola.
    y += dy;                                           // Actualiza la posición vertical de la bola.
}

setInterval(draw, 10);                                 // Ejecuta la función draw cada 10 milisegundos.