'use client';

export default function TotalGeneral({ total }) {
  return (
    <div className="bg-white table-header rounded-lg shadow overflow-hidden my-8">
      <div className="p-6">
        <div className="flex justify-between items-center py-3 border-b border-gray-300/20 table-header" >
          <span className="table-header text-lg font-bold bg-white">Total General:</span>
          <span className="table-header text-xl font-bold bg-white">${total.toFixed(2)}</span>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button className="bg-primary bg-white py-2 px-4 rounded shadow hover:bg-primary/80 transition-colors">
            Exportar Inventario
          </button>
        </div>
      </div>
    </div>
  );
}