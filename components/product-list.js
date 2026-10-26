import { crearElemento } from "../js/utils.js";
import "./product-card.js";

export class ListaProductos extends HTMLElement {
  constructor() {
    super();
    this.elementos = [];
  }

  set productos(valor) {
    this.elementos = Array.isArray(valor) ? valor : [];
    this.renderizar();
  }

  get productos() {
    return this.elementos;
  }

  renderizar() {
    this.textContent = "";
    const cuadricula = crearElemento("div", "cuadricula-productos");

    for (const producto of this.elementos) {
      const tarjeta = document.createElement("product-card");
      tarjeta.producto = producto;
      cuadricula.append(tarjeta);
    }

    this.append(cuadricula);
  }
}

customElements.define("product-list", ListaProductos);