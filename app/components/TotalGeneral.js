'use client';

export default function TotalGeneral({ total }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden my-8">
      <div className="p-6">
        <div className="flex justify-between items-center py-3 border-b border-gray-300/20">
          <span className="text-lg font-bold text-tertiary">Total General:</span>
          <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button className="bg-primary text-white py-2 px-4 rounded shadow hover:bg-primary/80 transition-colors">
            Exportar Inventario
          </button>
        </div>
      </div>
    </div>
  );
}