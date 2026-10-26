import { obtenerProductos, ErrorCatalogo } from "./api.js";
import { Carrito } from "./cart.js";
import { cargarCarrito, guardarCarrito } from "./storage.js";
import { formatearCOP, crearElemento } from "./utils.js";
import "../components/product-card.js";
import "../components/product-list.js";
import "../components/shopping-cart.js";

const elementos = {
  avisoGeneral: document.getElementById("avisoGeneral"),
  formularioFiltros: document.getElementById("formularioFiltros"),
  grupoFiltros: document.getElementById("grupoFiltros"),
  campoBusqueda: document.getElementById("campoBusqueda"),
  selectorCategoria: document.getElementById("selectorCategoria"),
  selectorOrden: document.getElementById("selectorOrden"),
  soloDisponibles: document.getElementById("soloDisponibles"),
  botonLimpiarFiltros: document.getElementById("botonLimpiarFiltros"),
  estadoCatalogo: document.getElementById("estadoCatalogo"),
  botonReintentar: document.getElementById("botonReintentar"),
  listaProductos: document.getElementById("listaProductos"),
  carritoCompras: document.getElementById("carritoCompras"),
  contadorCarrito: document.getElementById("contadorCarrito"),
  botonConfirmar: document.getElementById("botonConfirmar"),
  confirmacionPedido: document.getElementById("confirmacionPedido")
};

let productos = [];
let carrito = new Carrito([]);
let catalogoCargado = false;

function mostrarAviso(mensaje, tipo) {
  const prefijos = { error: "Error: ", exito: "Listo: ", info: "Aviso: " };
  elementos.avisoGeneral.className = `aviso aviso-${tipo}`;
  elementos.avisoGeneral.textContent = prefijos[tipo] + mensaje;
  elementos.avisoGeneral.hidden = false;
}

function establecerEstadoCatalogo(mensaje, tipo) {
  elementos.estadoCatalogo.className = `estado-catalogo ${tipo}`;
  elementos.estadoCatalogo.textContent = mensaje;
}

function renderizarCarrito() {
  elementos.carritoCompras.carrito = {
    lineas: carrito.obtenerLineasDetalladas(),
    resumen: carrito.obtenerResumen()
  };
  elementos.contadorCarrito.textContent = carrito.obtenerTotalUnidades();
}

function obtenerProductosFiltrados() {
  const termino = elementos.campoBusqueda.value.trim().toLowerCase();
  const categoria = elementos.selectorCategoria.value;
  const soloDisponibles = elementos.soloDisponibles.checked;
  const orden = elementos.selectorOrden.value;

  const resultado = productos.filter((producto) => {
    const coincideTermino =
      termino === "" ||
      producto.name.toLowerCase().includes(termino) ||
      producto.description.toLowerCase().includes(termino);
    const coincideCategoria = categoria === "todas" || producto.category === categoria;
    const coincideDisponibilidad = !soloDisponibles || (producto.active && producto.stock > 0);
    return coincideTermino && coincideCategoria && coincideDisponibilidad;
  });

  if (orden === "asc") {
    resultado.sort((a, b) => a.price - b.price);
  } else if (orden === "desc") {
    resultado.sort((a, b) => b.price - a.price);
  }

  return resultado;
}

function renderizarCatalogo() {
  const filtrados = obtenerProductosFiltrados();
  elementos.listaProductos.productos = filtrados;

  if (productos.length === 0) {
    establecerEstadoCatalogo("El catálogo se cargó correctamente, pero no contiene productos.", "info");
  } else if (filtrados.length === 0) {
    establecerEstadoCatalogo("No se encontraron productos con los filtros seleccionados.", "info");
  } else {
    establecerEstadoCatalogo(`Mostrando ${filtrados.length} de ${productos.length} productos.`, "info");
  }
}

function llenarCategorias() {
  elementos.selectorCategoria.textContent = "";
  const opcionTodas = crearElemento("option", "", "Todas las categorías");
  opcionTodas.value = "todas";
  elementos.selectorCategoria.append(opcionTodas);

  const categorias = [...new Set(productos.map((producto) => producto.category))].sort();

  for (const categoria of categorias) {
    const opcion = crearElemento("option", "", categoria);
    opcion.value = categoria;
    elementos.selectorCategoria.append(opcion);
  }
}

function persistirCarrito() {
  return guardarCarrito(carrito.paraAlmacenamiento());
}

function finalizarOperacion(resultado, mensajeExito) {
  if (!resultado.ok) {
    mostrarAviso(resultado.mensaje, "error");
    return;
  }

  const guardado = persistirCarrito();
  renderizarCarrito();

  if (guardado) {
    mostrarAviso(mensajeExito, "exito");
  } else {
    mostrarAviso(
      `${mensajeExito} No se pudo guardar el carrito en este navegador, por lo que no se conservará al recargar.`,
      "info"
    );
  }
}

function generarIdPedido() {
  const parteTiempo = Date.now().toString(36).toUpperCase();
  const parteAleatoria = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TS-${parteTiempo}-${parteAleatoria}`;
}

function renderizarConfirmacionPedido(idPedido, lineas, resumen) {
  elementos.confirmacionPedido.textContent = "";
  const caja = crearElemento("div", "caja-pedido");
  caja.append(crearElemento("h3", "", "Pedido confirmado (simulación)"));
  caja.append(crearElemento("p", "", `Identificador del pedido: ${idPedido}`));

  const lista = crearElemento("ul");

  for (const linea of lineas) {
    lista.append(
      crearElemento("li", "", `${linea.producto.name} x ${linea.cantidad} = ${formatearCOP(linea.subtotal)}`)
    );
  }

  caja.append(lista);
  caja.append(crearElemento("p", "", `Subtotal: ${formatearCOP(resumen.subtotal)}`));
  caja.append(crearElemento("p", "", `Descuento: ${formatearCOP(resumen.descuento)}`));
  caja.append(crearElemento("p", "", `Total: ${formatearCOP(resumen.total)}`));
  caja.append(
    crearElemento(
      "p",
      "",
      "Esta confirmación es una simulación local. No se realizó ningún pago real ni se actualizó el inventario."
    )
  );
  elementos.confirmacionPedido.append(caja);
}

function confirmarPedido() {
  if (!catalogoCargado) {
    mostrarAviso("El catálogo no está disponible. No se puede confirmar el pedido.", "error");
    return;
  }

  const validacion = carrito.validarParaPedido();

  if (!validacion.ok) {
    mostrarAviso(validacion.mensaje, "error");
    return;
  }

  const lineas = carrito.obtenerLineasDetalladas();
  const resumen = carrito.obtenerResumen();
  const idPedido = generarIdPedido();

  renderizarConfirmacionPedido(idPedido, lineas, resumen);
  carrito.vaciar();
  persistirCarrito();
  renderizarCarrito();
  mostrarAviso(
    `Pedido ${idPedido} confirmado en simulación local. No se realizó ningún pago real ni se modificó el inventario.`,
    "exito"
  );
}

async function cargarCatalogo() {
  establecerEstadoCatalogo("Cargando catálogo...", "cargando");
  elementos.botonReintentar.hidden = true;
  elementos.listaProductos.productos = [];
  catalogoCargado = false;

  try {
    productos = await obtenerProductos();
  } catch (error) {
    productos = [];
    carrito = new Carrito([]);
    renderizarCarrito();
    elementos.grupoFiltros.disabled = true;
    const mensaje =
      error instanceof ErrorCatalogo
        ? error.message
        : "Ocurrió un error inesperado al cargar el catálogo.";
    establecerEstadoCatalogo(`Error: ${mensaje}`, "error");
    elementos.botonReintentar.hidden = false;
    return;
  }

  catalogoCargado = true;
  elementos.grupoFiltros.disabled = false;
  llenarCategorias();

  carrito = new Carrito(productos);
  const descartadas = carrito.restaurar(cargarCarrito());

  if (descartadas > 0) {
    persistirCarrito();
    mostrarAviso(
      `Se descartaron ${descartadas} línea(s) guardadas del carrito por no ser válidas o superar el inventario actual.`,
      "info"
    );
  }

  renderizarCarrito();
  renderizarCatalogo();
}

elementos.formularioFiltros.addEventListener("submit", (evento) => {
  evento.preventDefault();
});

elementos.campoBusqueda.addEventListener("input", renderizarCatalogo);
elementos.selectorCategoria.addEventListener("change", renderizarCatalogo);
elementos.selectorOrden.addEventListener("change", renderizarCatalogo);
elementos.soloDisponibles.addEventListener("change", renderizarCatalogo);

elementos.botonLimpiarFiltros.addEventListener("click", () => {
  elementos.campoBusqueda.value = "";
  elementos.selectorCategoria.value = "todas";
  elementos.selectorOrden.value = "ninguno";
  elementos.soloDisponibles.checked = false;
  renderizarCatalogo();
});

elementos.botonReintentar.addEventListener("click", cargarCatalogo);
elementos.botonConfirmar.addEventListener("click", confirmarPedido);

document.addEventListener("solicitud-agregar-carrito", (evento) => {
  if (!catalogoCargado) {
    return;
  }
  const resultado = carrito.agregar(evento.detail.idProducto);
  finalizarOperacion(resultado, "Producto agregado al carrito.");
});

document.addEventListener("solicitud-cantidad-carrito", (evento) => {
  if (!catalogoCargado) {
    return;
  }
  const resultado = carrito.establecerCantidad(evento.detail.idProducto, evento.detail.cantidad);
  finalizarOperacion(resultado, "Cantidad actualizada.");
});

document.addEventListener("solicitud-eliminar-carrito", (evento) => {
  if (!catalogoCargado) {
    return;
  }
  const resultado = carrito.eliminar(evento.detail.idProducto);
  finalizarOperacion(resultado, "Producto eliminado del carrito.");
});

document.addEventListener("solicitud-vaciar-carrito", () => {
  if (!catalogoCargado) {
    return;
  }

  if (carrito.lineas.length === 0) {
    mostrarAviso("El carrito ya está vacío.", "info");
    return;
  }

  carrito.vaciar();
  finalizarOperacion({ ok: true, mensaje: "" }, "Carrito vaciado.");
});

renderizarCarrito();
cargarCatalogo();