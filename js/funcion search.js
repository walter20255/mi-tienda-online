// 1. Seleccionamos los elementos
const input = document.getElementById('searchInput');
const boton = document.getElementById('searchButton');

// 2. Definimos la función que hace el trabajo sucio
function realizarBusqueda() {
  const texto = input.value.trim(); // .trim() quita espacios al inicio y final
  
  if (texto === "") {
    alert("Por favor escribe algo para buscar");
    return;
  }

  // AQUÍ VA TU LÓGICA DE BÚSQUEDA REAL
  // Ejemplo: window.location.href = `/buscar?q=${texto}`;
  // O filtrar una lista de productos en pantalla:
  console.log("Buscando productos con: ", texto);
  alert(`Buscando: ${texto}`); 
}

// 3. Evento para el CLIC en el botón
boton.addEventListener('click', realizarBusqueda);

// 4. Evento para la tecla ENTER en el input
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    realizarBusqueda();
  }
});