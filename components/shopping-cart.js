import { formatearCOP, crearElemento } from "../js/utils.js";

export class CarritoCompras extends HTMLElement {
  constructor() {
    super();
    this.datosCarrito = {
      lineas: [],
      resumen: { subtotal: 0, descuento: 0, total: 0 }
    };
  }

  set carrito(valor) {
    this.datosCarrito = valor;
    this.renderizar();
  }

  get carrito() {
    return this.datosCarrito;
  }

  emitir(nombre, detalle) {
    this.dispatchEvent(new CustomEvent(nombre, { detail: detalle, bubbles: true, composed: true }));
  }

  crearBoton(etiqueta, etiquetaAria, alHacerClic) {
    const boton = crearElemento("button", "boton", etiqueta);
    boton.type = "button";
    boton.setAttribute("aria-label", etiquetaAria);
    boton.addEventListener("click", alHacerClic);
    return boton;
  }

  renderizar() {
    this.textContent = "";
    const { lineas, resumen } = this.datosCarrito;

    if (lineas.length === 0) {
      this.append(crearElemento("p", "carrito-vacio", "El carrito está vacío."));
    } else {
      const lista = crearElemento("ul", "lineas-carrito");

      for (const linea of lineas) {
        const item = crearElemento("li", "linea-carrito");
        const nombre = linea.producto.name;

        const controles = crearElemento("div", "controles-carrito");
        controles.append(
          this.crearBoton("-", `Disminuir cantidad de ${nombre}`, () => {
            this.emitir("solicitud-cantidad-carrito", {
              idProducto: linea.producto.id,
              cantidad: linea.cantidad - 1
            });
          }),
          crearElemento("span", "carrito-cantidad", `Cantidad: ${linea.cantidad}`),
          this.crearBoton("+", `Aumentar cantidad de ${nombre}`, () => {
            this.emitir("solicitud-cantidad-carrito", {
              idProducto: linea.producto.id,
              cantidad: linea.cantidad + 1
            });
          }),
          this.crearBoton("Eliminar", `Eliminar ${nombre} del carrito`, () => {
            this.emitir("solicitud-eliminar-carrito", { idProducto: linea.producto.id });
          })
        );

        item.append(
          crearElemento("p", "linea-carrito-nombre", nombre),
          crearElemento("p", "linea-carrito-precio", `Precio unitario: ${formatearCOP(linea.producto.price)}`),
          controles,
          crearElemento("p", "linea-carrito-subtotal", `Subtotal: ${formatearCOP(linea.subtotal)}`)
        );

        lista.append(item);
      }

      this.append(lista);
    }

    const totales = crearElemento("dl", "totales-carrito");
    const filas = [
      ["Subtotal", formatearCOP(resumen.subtotal), ""],
      ["Descuento (10 % desde $300.000)", `- ${formatearCOP(resumen.descuento)}`, ""],
      ["Total", formatearCOP(resumen.total), "total-final"]
    ];

    for (const [etiqueta, valor, nombreClase] of filas) {
      const fila = crearElemento("div", nombreClase);
      fila.append(crearElemento("dt", "", etiqueta), crearElemento("dd", "", valor));
      totales.append(fila);
    }

    this.append(totales);

    const botonVaciar = crearElemento("button", "boton", "Vaciar carrito");
    botonVaciar.type = "button";
    botonVaciar.disabled = lineas.length === 0;
    botonVaciar.addEventListener("click", () => {
      this.emitir("solicitud-vaciar-carrito", {});
    });

    this.append(botonVaciar);
  }
}

customElements.define("shopping-cart", CarritoCompras);