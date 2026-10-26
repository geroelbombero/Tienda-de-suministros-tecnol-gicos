export class ErrorCatalogo extends Error {
  constructor(tipo, mensaje) {
    super(mensaje);
    this.tipo = tipo;
  }
}

function esProductoValido(producto) {
  return (
    producto !== null &&
    typeof producto === "object" &&
    Number.isInteger(producto.id) &&
    producto.id > 0 &&
    typeof producto.name === "string" &&
    producto.name.trim() !== "" &&
    typeof producto.category === "string" &&
    producto.category.trim() !== "" &&
    typeof producto.price === "number" &&
    Number.isFinite(producto.price) &&
    producto.price > 0 &&
    Number.isInteger(producto.stock) &&
    producto.stock >= 0 &&
    typeof producto.description === "string" &&
    typeof producto.active === "boolean"
  );
}

export async function obtenerProductos() {
  let respuesta;

  try {
    respuesta = await fetch("data/products.json");
  } catch (error) {
    throw new ErrorCatalogo("red", "No se pudo conectar con el servidor para consultar el catálogo.");
  }
  let datos;
  try {
    datos = await respuesta.json();
  } catch (error) {
    throw new ErrorCatalogo("invalido", "La respuesta del catálogo no tiene un formato JSON válido.");
  }
  const idsUsados = new Set();
  
  for (const producto of datos) {
    if (!esProductoValido(producto) || idsUsados.has(producto.id)) {
      throw new ErrorCatalogo("invalido", "El catálogo contiene productos con datos inválidos o repetidos.");
    }
    idsUsados.add(producto.id);
  }

  return datos;
}