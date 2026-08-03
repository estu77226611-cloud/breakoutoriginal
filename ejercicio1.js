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