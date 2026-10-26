import { formatearCOP, crearElemento } from "../js/utils.js";

export class TarjetaProducto extends HTMLElement {
  constructor() {
    super();
    this.datosProducto = null;
  }

  set producto(valor) {
    this.datosProducto = valor;
    this.renderizar();
  }

  get producto() {
    return this.datosProducto;
  }

  renderizar() {
    this.textContent = "";
    const producto = this.datosProducto;

    if (!producto) {
      return;
    }

    const estaDisponible = producto.active && producto.stock > 0;
    let textoEstado = `Disponible: ${producto.stock} unidades`;

    if (!producto.active) {
      textoEstado = "No disponible (producto inactivo)";
    } else if (producto.stock === 0) {
      textoEstado = "Agotado";
    }

    const articulo = crearElemento("article", "tarjeta");
    articulo.append(
      crearElemento("h3", "tarjeta-titulo", producto.name),
      crearElemento("p", "tarjeta-categoria", `Categoría: ${producto.category}`),
      crearElemento("p", "tarjeta-descripcion", producto.description),
      crearElemento("p", "tarjeta-precio", formatearCOP(producto.price)),
      crearElemento(
        "p",
        estaDisponible ? "etiqueta etiqueta-disponible" : "etiqueta etiqueta-agotado",
        textoEstado
      )
    );

    const boton = crearElemento("button", "boton boton-primario", "Agregar al carrito");
    boton.type = "button";
    boton.disabled = !estaDisponible;
    boton.setAttribute("aria-label", `Agregar ${producto.name} al carrito`);
    boton.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("solicitud-agregar-carrito", {
          detail: { idProducto: producto.id },
          bubbles: true,
          composed: true
        })
      );
    });

    articulo.append(boton);
    this.append(articulo);
  }
}

customElements.define("product-card", TarjetaProducto);