// ==============================
// EJERCICIO 1
// ==============================

var canvas = document.getElementById("myCanvas");      // Obtiene el elemento canvas del HTML.
var ctx = canvas.getContext("2d");                     // Obtiene el contexto 2D para dibujar.

ctx.beginPath();                                       // Inicia un nuevo trazado.
ctx.rect(20, 40, 50, 50);                             // Dibuja un rectángulo.
ctx.fillStyle = "#FF0000";                            // Define el color rojo.
ctx.fill();                                            // Rellena el rectángulo.
ctx.closePath();                                       // Finaliza el trazado.

ctx.beginPath();                                       // Inicia un nuevo trazado.
ctx.arc(240, 160, 20, 0, Math.PI * 2, false);         // Dibuja un círculo.
ctx.fillStyle = "green";                              // Define el color verde.
ctx.fill();                                            // Rellena el círculo.
ctx.closePath();                                       // Finaliza el trazado.

ctx.beginPath();                                       // Inicia un nuevo trazado.
ctx.rect(160, 10, 100, 40);                           // Dibuja un rectángulo.
ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";             // Define el color del borde.
ctx.stroke();                                          // Dibuja el borde del rectángulo.
ctx.closePath();                                       // Finaliza el trazado.


// ==============================
// EJERCICIO 2
// ==============================

var ballRadius = 10;                                   // Radio de la bola.
var x = canvas.width / 2;                              // Posición inicial en el centro horizontal.
var y = canvas.height - 30;                            // Posición inicial cerca de la parte inferior.
var dx = 2;                                            // Velocidad horizontal.
var dy = -2;                                           // Velocidad vertical.

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

function draw() {                                      // Función principal de la animación.
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Limpia el canvas.
    drawBall();                                        // Dibuja la bola.

    // Verifica si la bola toca el borde izquierdo o derecho.
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;                                      // Invierte la dirección horizontal.
    }

    // Verifica si la bola toca el borde superior o inferior.
    if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
        dy = -dy;                                      // Invierte la dirección vertical.
    }

    x += dx;                                           // Actualiza la posición horizontal.
    y += dy;                                           // Actualiza la posición vertical.
}

setInterval(draw, 10);                                 // Ejecuta la animación cada 10 milisegundos.