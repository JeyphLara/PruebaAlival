'use client';

import { useState } from 'react';

interface FacturasSearchProps {
  onSearch: (clienteId: number) => void;
  isLoading: boolean;
}

export default function FacturasSearch({ onSearch, isLoading }: FacturasSearchProps) {
  const [clienteId, setClienteId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(clienteId, 10);
    if (!isNaN(id) && id > 0) {
      onSearch(id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label htmlFor="clienteId" className="block text-sm font-medium text-gray-700 mb-2">
          ID del Cliente
        </label>
        <input
          type="number"
          id="clienteId"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          placeholder="Ingrese el ID del cliente (ej: 1, 2, 3)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
          min="1"
          required
          disabled={isLoading}
        />
      </div>
      <div className="sm:self-end">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isLoading ? 'Buscando...' : 'Buscar Facturas'}
        </button>
      </div>
    </form>
  );
}
