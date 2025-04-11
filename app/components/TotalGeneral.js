'use client';

export default function TotalGeneral({ total }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden my-8">
      <h2 className="text-xl font-semibold p-4 bg-primary text-white border-b">Resumen Total del Inventario</h2>
      
      <div className="p-6">
        <div className="flex justify-between items-center py-3 border-b">
          <span className="text-lg font-bold text-primary">Total General:</span>
          <span className="text-lg font-bold text-accent">${total.toFixed(2)}</span>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button className="bg-primary text-white py-2 px-4 rounded shadow hover:bg-opacity-80 transition-colors">
            Exportar Inventario
          </button>
        </div>
      </div>
    </div>
  );
}