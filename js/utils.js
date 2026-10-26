export function formatearCOP(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(valor);
}

export function crearElemento(etiqueta, nombreClase, texto) {
  const elemento = document.createElement(etiqueta);
  if (nombreClase) {
    elemento.className = nombreClase;
  }
  if (texto !== undefined) {
    elemento.textContent = texto;
  }
  return elemento;
}