// ==============================
// EJERCICIO 1
// ==============================

var canvas = document.getElementById("myCanvas");      // Obtiene el elemento canvas del HTML.
var ctx = canvas.getContext("2d");                     // Obtiene el contexto 2D para dibujar.

ctx.beginPath();                                       // Inicia un nuevo trazado.
ctx.rect(20, 40, 50, 50);                             // Dibuja un rectángulo en la posición indicada.
ctx.fillStyle = "#FF0000";                            // Define el color rojo.
ctx.fill();                                            // Rellena el rectángulo.
ctx.closePath();                                       // Finaliza el trazado.

ctx.beginPath();                                       // Inicia un nuevo trazado.
ctx.arc(240, 160, 20, 0, Math.PI * 2, false);         // Dibuja un círculo completo.
ctx.fillStyle = "green";                              // Define el color verde.
ctx.fill();                                            // Rellena el círculo.
ctx.closePath();                                       // Finaliza el trazado.

ctx.beginPath();                                       // Inicia un nuevo trazado.
ctx.rect(160, 10, 100, 40);                           // Dibuja un rectángulo de 100x40 píxeles.
ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";             // Define un borde azul transparente.
ctx.stroke();                                          // Dibuja solamente el borde.
ctx.closePath();                                       // Finaliza el trazado.


// ==============================
// EJERCICIO 2
// ==============================

var ballRadius = 10;                                   // Define el radio de la bola.
var x = canvas.width / 2;                              // Posición horizontal inicial de la bola.
var y = canvas.height - 30;                            // Posición vertical inicial de la bola.
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

// El rebote en los bordes se controla dentro de la función draw().


// ==============================
// EJERCICIO 4
// ==============================

var paddleHeight = 10;                                 // Define la altura de la paleta.
var paddleWidth = 75;                                  // Define el ancho de la paleta.
var paddleX = (canvas.width - paddleWidth) / 2;        // Coloca la paleta en el centro.
var rightPressed = false;                              // Indica si la flecha derecha está presionada.
var leftPressed = false;                               // Indica si la flecha izquierda está presionada.

document.addEventListener("keydown", keyDownHandler, false); // Detecta cuando se presiona una tecla.
document.addEventListener("keyup", keyUpHandler, false);     // Detecta cuando se suelta una tecla.

function keyDownHandler(e) {                           // Detecta la tecla presionada.
    if (e.keyCode == 39) {                             // Comprueba la flecha derecha.
        rightPressed = true;                           // Activa el movimiento hacia la derecha.
    }
    else if (e.keyCode == 37) {                        // Comprueba la flecha izquierda.
        leftPressed = true;                            // Activa el movimiento hacia la izquierda.
    }
}

function keyUpHandler(e) {                             // Detecta la tecla liberada.
    if (e.keyCode == 39) {                             // Comprueba la flecha derecha.
        rightPressed = false;                          // Detiene el movimiento hacia la derecha.
    }
    else if (e.keyCode == 37) {                        // Comprueba la flecha izquierda.
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


// ==============================
// EJERCICIO 5
// ==============================

// El rebote con la paleta y el mensaje GAME OVER se controlan dentro de draw().


// ==============================
// EJERCICIO 6
// ==============================

var brickRowCount = 5;                                 // Define la cantidad de ladrillos por fila.
var brickColumnCount = 3;                              // Define la cantidad de filas de ladrillos.
var brickWidth = 75;                                   // Define el ancho de cada ladrillo.
var brickHeight = 20;                                  // Define la altura de cada ladrillo.
var brickPadding = 10;                                 // Define el espacio entre ladrillos.
var brickOffsetTop = 30;                               // Define la separación superior.
var brickOffsetLeft = 30;                              // Define la separación izquierda.


// ==============================
// EJERCICIO 7
// ==============================

var bricks = [];                                       // Crea el arreglo que almacenará los ladrillos.

for (var c = 0; c < brickColumnCount; c++) {           // Recorre las filas de ladrillos.
    bricks[c] = [];                                    // Crea un arreglo para cada fila.

    for (var r = 0; r < brickRowCount; r++) {          // Recorre los ladrillos de cada fila.
        bricks[c][r] = { x: 0, y: 0, status: 1 };      // Guarda posición y estado activo del ladrillo.
    }
}

function collisionDetection() {                        // Detecta colisiones entre la bola y los ladrillos.
    for (var c = 0; c < brickColumnCount; c++) {       // Recorre las filas.
        for (var r = 0; r < brickRowCount; r++) {      // Recorre los ladrillos.
            var b = bricks[c][r];                      // Guarda el ladrillo actual.

            if (b.status == 1) {                       // Comprueba si el ladrillo sigue activo.
                if (
                    x > b.x &&                         // Comprueba el borde izquierdo.
                    x < b.x + brickWidth &&            // Comprueba el borde derecho.
                    y > b.y &&                         // Comprueba el borde superior.
                    y < b.y + brickHeight              // Comprueba el borde inferior.
                ) {
                    dy = -dy;                          // Invierte la dirección vertical de la bola.
                    b.status = 0;                      // Desactiva el ladrillo para que desaparezca.
                    score++;                           // Aumenta el puntaje en uno.

                    if (score == brickRowCount * brickColumnCount) { // Comprueba si se destruyeron todos.
                        alert("YOU WIN, CONGRATS!");   // Muestra el mensaje de victoria.
                        document.location.reload();    // Reinicia el juego.
                    }
                }
            }
        }
    }
}

function drawBricks() {                                // Dibuja todos los ladrillos activos.
    for (var c = 0; c < brickColumnCount; c++) {       // Recorre las filas.
        for (var r = 0; r < brickRowCount; r++) {      // Recorre los ladrillos.
            if (bricks[c][r].status == 1) {            // Comprueba si el ladrillo sigue activo.
                var brickX = r * (brickWidth + brickPadding) + brickOffsetLeft; // Calcula la posición horizontal.
                var brickY = c * (brickHeight + brickPadding) + brickOffsetTop; // Calcula la posición vertical.

                bricks[c][r].x = brickX;               // Guarda la posición horizontal.
                bricks[c][r].y = brickY;               // Guarda la posición vertical.

                ctx.beginPath();                       // Inicia un nuevo trazado.
                ctx.rect(brickX, brickY, brickWidth, brickHeight); // Dibuja el ladrillo.
                ctx.fillStyle = "#0095DD";             // Define el color azul.
                ctx.fill();                            // Rellena el ladrillo.
                ctx.closePath();                       // Finaliza el trazado.
            }
        }
    }
}


// ==============================
// EJERCICIO 8
// ==============================

var score = 0;                                         // Guarda la puntuación inicial del jugador.

function drawScore() {                                 // Función que muestra el puntaje.
    ctx.font = "16px Arial";                           // Define el tamaño y tipo de letra.
    ctx.fillStyle = "#0095DD";                         // Define el color del texto.
    ctx.fillText("Score: " + score, 8, 20);            // Muestra el puntaje en la parte superior.
}

function draw() {                                      // Función principal de la animación.
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Limpia todo el canvas.

    drawBricks();                                      // Dibuja los ladrillos activos.
    drawBall();                                        // Dibuja la bola.
    drawPaddle();                                      // Dibuja la paleta.
    drawScore();                                       // Dibuja el puntaje.
    collisionDetection();                              // Detecta las colisiones con los ladrillos.

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) { // Comprueba los bordes laterales.
        dx = -dx;                                      // Invierte la dirección horizontal.
    }

    if (y + dy < ballRadius) {                         // Comprueba el borde superior.
        dy = -dy;                                      // Invierte la dirección vertical.
    }
    else if (y + dy > canvas.height - ballRadius) {   // Comprueba si la bola llega abajo.
        if (x > paddleX && x < paddleX + paddleWidth) { // Comprueba si toca la paleta.
            dy = -dy;                                  // Hace rebotar la bola.
        }
        else {                                         // Se ejecuta si no toca la paleta.
            alert("GAME OVER");                        // Muestra el mensaje de fin del juego.
            document.location.reload();                // Reinicia la página.
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) { // Comprueba el movimiento derecho.
        paddleX += 7;                                  // Mueve la paleta hacia la derecha.
    }
    else if (leftPressed && paddleX > 0) {             // Comprueba el movimiento izquierdo.
        paddleX -= 7;                                  // Mueve la paleta hacia la izquierda.
    }

    x += dx;                                           // Actualiza la posición horizontal de la bola.
    y += dy;                                           // Actualiza la posición vertical de la bola.
}

setInterval(draw, 10);                                 // Ejecuta draw cada 10 milisegundos.