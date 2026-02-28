'use client';

import { useState, useMemo } from 'react';
import { Factura } from '@/types/factura';

interface FacturasTableProps {
  facturas: Factura[];
}

export default function FacturasTable({ facturas }: FacturasTableProps) {
  const [montoMinimo, setMontoMinimo] = useState<string>('');

  const facturasFiltradas = useMemo(() => {
    if (!montoMinimo || isNaN(parseFloat(montoMinimo))) {
      return facturas;
    }
    return facturas.filter(f => f.monto >= parseFloat(montoMinimo));
  }, [facturas, montoMinimo]);

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pagada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencida':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="montoMinimo" className="text-sm font-medium text-gray-700">
          Filtrar por monto mínimo:
        </label>
        <input
          type="number"
          id="montoMinimo"
          value={montoMinimo}
          onChange={(e) => setMontoMinimo(e.target.value)}
          placeholder="Ej: 1000"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
          min="0"
          step="0.01"
        />
        {montoMinimo && (
          <button
            onClick={() => setMontoMinimo('')}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Limpiar filtro
          </button>
        )}
      </div>

      <div className="text-sm text-gray-600 mb-2">
        Mostrando {facturasFiltradas.length} de {facturas.length} facturas
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Factura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {facturasFiltradas.map((factura) => (
              <tr key={factura.facturaID} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{factura.facturaID}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatFecha(factura.fecha)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {factura.descripcion || 'Sin descripción'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  ${factura.monto.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(factura.estado)}`}>
                    {factura.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {facturasFiltradas.length === 0 && montoMinimo && (
        <div className="text-center py-8 text-gray-500">
          No hay facturas que cumplan con el filtro de monto mínimo de ${parseFloat(montoMinimo).toFixed(2)}
        </div>
      )}
    </div>
  );
}
