'use client';

import { useState } from 'react';
import FacturasSearch from '@/components/FacturasSearch';
import FacturasTable from '@/components/FacturasTable';
import { Factura } from '@/types/factura';

export default function Home() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [montoTotal, setMontoTotal] = useState<number>(0);

  const handleSearch = async (id: number) => {
    setIsLoading(true);
    setError(null);
    setFacturas([]);
    setClienteId(id);

    try {
      const response = await fetch(`http://localhost:5000/api/facturas/cliente/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No se encontraron facturas para el cliente ${id}`);
        }
        throw new Error('Error al cargar las facturas. Por favor, intente nuevamente.');
      }

      const data = await response.json();
      setFacturas(data.facturas || []);
      setMontoTotal(data.montoTotal || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Consulta de Facturas
          </h1>
          <p className="text-lg text-gray-600">
            Consulte las facturas de sus clientes de manera rápida y eficiente
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <FacturasSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {!isLoading && !error && facturas.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">
                Facturas del Cliente #{clienteId}
              </h2>
              <div className="text-right">
                <p className="text-sm text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold text-indigo-600">
                  ${montoTotal.toFixed(2)}
                </p>
              </div>
            </div>
            <FacturasTable facturas={facturas} />
          </div>
        )}

        {!isLoading && !error && facturas.length === 0 && clienteId && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  No se encontraron facturas para este cliente.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
