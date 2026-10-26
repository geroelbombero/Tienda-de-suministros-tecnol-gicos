export const umbralDescuento = 300000;
export const tasaDescuento = 0.1;

function fallar(mensaje) {
  return { ok: false, mensaje };
}

function exito() {
  return { ok: true, mensaje: "" };
}

export class Carrito {
  constructor(productos) {
    this.productos = productos;
    this.lineas = [];
  }

  buscarProducto(idProducto) {
    return this.productos.find((producto) => producto.id === idProducto) || null;
  }

  buscarLinea(idProducto) {
    return this.lineas.find((linea) => linea.idProducto === idProducto) || null;
  }

  agregar(idProducto) {
    const producto = this.buscarProducto(idProducto);

    if (!producto) {
      return fallar("El producto no existe en el catálogo.");
    }

    if (!producto.active) {
      return fallar(`"${producto.name}" no está activo y no se puede agregar.`);
    }

    if (producto.stock < 1) {
      return fallar(`"${producto.name}" está agotado.`);
    }

    const linea = this.buscarLinea(idProducto);
    const nuevaCantidad = linea ? linea.cantidad + 1 : 1;

    if (nuevaCantidad > producto.stock) {
      return fallar(`No hay más unidades de "${producto.name}". Inventario disponible: ${producto.stock}.`);
    }

    if (linea) {
      linea.cantidad = nuevaCantidad;
    } else {
      this.lineas.push({ idProducto, cantidad: 1 });
    }

    return exito();
  }

  establecerCantidad(idProducto, cantidad) {
    const linea = this.buscarLinea(idProducto);

    if (!linea) {
      return fallar("El producto no está en el carrito.");
    }

    const producto = this.buscarProducto(idProducto);

    if (!producto) {
      return fallar("El producto no existe en el catálogo.");
    }

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      return fallar("La cantidad debe ser un entero mayor o igual a 1. Para quitar el producto usa el botón Eliminar.");
    }

    if (cantidad > producto.stock) {
      return fallar(`La cantidad supera el inventario de "${producto.name}". Inventario disponible: ${producto.stock}.`);
    }

    linea.cantidad = cantidad;
    return exito();
  }

  eliminar(idProducto) {
    if (!this.buscarLinea(idProducto)) {
      return fallar("El producto no está en el carrito.");
    }

    this.lineas = this.lineas.filter((linea) => linea.idProducto !== idProducto);
    return exito();
  }

  vaciar() {
    this.lineas = [];
  }

  obtenerTotalUnidades() {
    return this.lineas.reduce((total, linea) => total + linea.cantidad, 0);
  }

  obtenerLineasDetalladas() {
    return this.lineas.map((linea) => {
      const producto = this.buscarProducto(linea.idProducto);
      return {
        producto,
        cantidad: linea.cantidad,
        subtotal: producto.price * linea.cantidad
      };
    });
  }

  obtenerResumen() {
    const subtotal = this.obtenerLineasDetalladas().reduce((total, linea) => total + linea.subtotal, 0);
    const descuento = subtotal >= umbralDescuento ? Math.round(subtotal * tasaDescuento) : 0;
    return { subtotal, descuento, total: subtotal - descuento };
  }

  validarParaPedido() {
    if (this.lineas.length === 0) {
      return fallar("El carrito está vacío. Agrega productos antes de confirmar el pedido.");
    }

    for (const linea of this.lineas) {
      const producto = this.buscarProducto(linea.idProducto);

      if (!producto) {
        return fallar("Un producto del carrito ya no existe en el catálogo.");
      }

      if (!producto.active) {
        return fallar(`"${producto.name}" ya no está activo. Elimínalo para continuar.`);
      }

      if (!Number.isInteger(linea.cantidad) || linea.cantidad < 1) {
        return fallar(`La cantidad de "${producto.name}" no es válida.`);
      }

      if (linea.cantidad > producto.stock) {
        return fallar(`La cantidad de "${producto.name}" supera el inventario disponible (${producto.stock}).`);
      }
    }

    return exito();
  }

  restaurar(lineasCrudas) {
    this.lineas = [];
    let descartadas = 0;

    for (const cruda of lineasCrudas) {
      const tieneFormatoValido =
        cruda !== null &&
        typeof cruda === "object" &&
        Number.isInteger(cruda.idProducto) &&
        Number.isInteger(cruda.cantidad) &&
        cruda.cantidad >= 1;

      const producto = tieneFormatoValido ? this.buscarProducto(cruda.idProducto) : null;
      const esUtilizable =
        producto !== null &&
        producto.active &&
        cruda.cantidad <= producto.stock &&
        this.buscarLinea(cruda.idProducto) === null;

      if (esUtilizable) {
        this.lineas.push({ idProducto: cruda.idProducto, cantidad: cruda.cantidad });
      } else {
        descartadas++;
      }
    }

    return descartadas;
  }

  paraAlmacenamiento() {
    return this.lineas.map((linea) => ({ idProducto: linea.idProducto, cantidad: linea.cantidad }));
  }
}
