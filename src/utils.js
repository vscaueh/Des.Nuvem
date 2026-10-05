export function calcularFrete(subtotal) {
    return subtotal > 0 && subtotal < 100 ? 6 : 0;
  }
  
  export function calcularTotal(subtotal) {
    return subtotal + calcularFrete(subtotal);
  }