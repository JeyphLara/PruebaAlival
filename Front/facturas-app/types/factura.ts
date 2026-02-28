export interface Factura {
  facturaID: number;
  fecha: string;
  monto: number;
  estado: string;
  descripcion?: string;
}

export interface FacturasResponse {
  clienteID: number;
  facturas: Factura[];
  totalFacturas: number;
  montoTotal: number;
}
