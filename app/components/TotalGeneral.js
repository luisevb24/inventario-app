'use client';

export default function TotalGeneral({ total }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden my-8">
      <h2 className="text-xl font-semibold p-4 bg-blue-100 border-b">Resumen Total del Inventario</h2>
      
      <div className="p-6">
        <div className="flex justify-between items-center py-3 border-b">
          <span className="text-lg font-bold">Total General:</span>
          <span className="text-lg font-bold text-blue-600">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}