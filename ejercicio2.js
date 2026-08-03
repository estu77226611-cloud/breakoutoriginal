var canvas = document.getElementById("myCanvas");      // Obtiene el elemento canvas del HTML.
var ctx = canvas.getContext("2d");                     // Obtiene el contexto 2D para dibujar.

ctx.beginPath();                                       // Inicia un nuevo trazado.
ctx.rect(20, 40, 50, 50);                             // Dibuja un rectángulo en la posición (20,40).
ctx.fillStyle = "#FF0000";                            // Define el color de relleno en rojo.
ctx.fill();                                            // Rellena el rectángulo con el color seleccionado.
ctx.closePath();                                       // Finaliza el trazado del rectángulo.

ctx.beginPath();                                       // Inicia un nuevo trazado.
ctx.arc(240, 160, 20, 0, Math.PI * 2, false);         // Dibuja un círculo con radio de 20 píxeles.
ctx.fillStyle = "green";                              // Define el color de relleno en verde.
ctx.fill();                                            // Rellena el círculo.
ctx.closePath();                                       // Finaliza el trazado del círculo.

ctx.beginPath();                                       // Inicia un nuevo trazado.
ctx.rect(160, 10, 100, 40);                           // Dibuja un rectángulo de 100x40 píxeles.
ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";             // Define el color del borde (azul transparente).
ctx.stroke();                                          // Dibuja únicamente el borde del rectángulo.
ctx.closePath();                                       // Finaliza el trazado.
var canvas = document.getElementById("myCanvas");   // Obtiene el elemento canvas del HTML.
var ctx = canvas.getContext("2d");                  // Obtiene el contexto 2D para dibujar.
var x = canvas.width / 2;                           // Posición inicial de la bola en el centro horizontal.
var y = canvas.height - 30;                         // Posición inicial de la bola cerca de la parte inferior.
var dx = 2;                                         // Velocidad de desplazamiento en el eje X.
var dy = -2;                                        // Velocidad de desplazamiento en el eje Y.

function drawBall() {                               // Función que dibuja la bola.
    ctx.beginPath();                                // Inicia un nuevo trazado.
    ctx.arc(x, y, 10, 0, Math.PI * 2);              // Dibuja un círculo en la posición (x,y) con radio 10.
    ctx.fillStyle = "#0095DD";                      // Define el color de relleno de la bola.
    ctx.fill();                                     // Rellena la bola con el color indicado.
    ctx.closePath();                                // Finaliza el trazado.
}

function draw() {                                   // Función principal de la animación.
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Borra el contenido del canvas para redibujar.
    drawBall();                                     // Dibuja la bola en su posición actual.
    x += dx;                                        // Actualiza la posición horizontal de la bola.
    y += dy;                                        // Actualiza la posición vertical de la bola.
}

setInterval(draw, 10);                              // Ejecuta la función draw cada 10 milisegundos para crear la animación.