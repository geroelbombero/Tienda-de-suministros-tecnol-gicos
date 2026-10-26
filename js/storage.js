const claveAlmacenamiento = "tecnostock-carrito";

export function guardarCarrito(lineas) {
  try {
    localStorage.setItem(claveAlmacenamiento, JSON.stringify(lineas));
    return true;
  } catch (error) {
    return false;
  }
}

export function cargarCarrito() {
  try {
    const crudo = localStorage.getItem(claveAlmacenamiento);

    if (crudo === null) {
      return [];
    }

    const convertido = JSON.parse(crudo);

    if (!Array.isArray(convertido)) {
      return [];
    }

    return convertido;
  } catch (error) {
    return [];
  }
}