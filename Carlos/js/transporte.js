// Ajusta el lienzo al ancho de la ventana si existe el elemento 'stage'
function ajustar() {
  var stage = document.getElementById('stage');
  if (stage) {
    stage.style.zoom = Math.min(1, (window.innerWidth - 32) / 1447);
  }
}

window.addEventListener('resize', ajustar);

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', ajustar);