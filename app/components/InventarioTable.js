'use client';
import { useState } from 'react';

export default function InventarioTable({ items, onAddItem, onRemoveItem, categoria }) {
  // Estado para el nuevo item
  const [newItem, setNewItem] = useState({
    descripcion: '',
    cantidad: 1,
    unidad: 'unidades',
    costoUnitario: 0,
    categoria: categoria // Asignar la categoría por defecto según la tabla
  });

  // Manejar cambios en los campos del formulario
  function handleChange(e) {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === 'cantidad' || name === 'costoUnitario' 
        ? parseFloat(value) || 0 
        : value
    });
  }

  // Manejar envío del formulario
  function handleSubmit(e) {
    e.preventDefault();
    onAddItem({
      ...newItem,
      id: Date.now()
    });
    // Restablecer el formulario
    setNewItem({
      descripcion: '',
      cantidad: 1,
      unidad: 'unidades',
      costoUnitario: 0,
      categoria: categoria
    });
  }

  // Calcular el total para esta categoría
  const total = items.reduce((sum, item) => {
    return sum + (item.cantidad * item.costoUnitario);
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
      <h3 className="text-lg font-semibold p-4 bg-primary text-white border-b">
        Inventario de {categoria}
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">Descripción</th>
              <th className="border p-3 text-left">Cantidad</th>
              <th className="border p-3 text-left">Unidad</th>
              <th className="border p-3 text-left">Costo Unitario</th>
              <th className="border p-3 text-left">Subtotal</th>
              <th className="border p-3 text-left">Acciones</th>
            </tr>
          </thead>
          
          <tbody>
            {/* Filas con los items existentes */}
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border p-3">{item.descripcion}</td>
                <td className="border p-3">{item.cantidad}</td>
                <td className="border p-3">{item.unidad}</td>
                <td className="border p-3">${item.costoUnitario.toFixed(2)}</td>
                <td className="border p-3">${(item.cantidad * item.costoUnitario).toFixed(2)}</td>
                <td className="border p-3">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition-colors"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            
            {/* Fila para añadir nuevo item */}
            <tr className="bg-light-blue">
              <td className="border p-2">
                <input
                  type="text"
                  name="descripcion"
                  value={newItem.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción del item"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  name="cantidad"
                  value={newItem.cantidad}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </td>
              <td className="border p-2">
                <input
                  type="text"
                  name="unidad"
                  value={newItem.unidad}
                  onChange={handleChange}
                  placeholder="ej. unidades, kg, litros"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  name="costoUnitario"
                  value={newItem.costoUnitario}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </td>
              <td className="border p-2">
                ${(newItem.cantidad * newItem.costoUnitario).toFixed(2)}
              </td>
              <td className="border p-2">
                <button
                  onClick={handleSubmit}
                  className="bg-primary text-white py-1 px-3 rounded hover:bg-opacity-80 transition-colors"
                >
                  Agregar
                </button>
              </td>
            </tr>
          </tbody>
          
          {/* Pie de la tabla con el total de esta categoría */}
          <tfoot>
            <tr className="bg-light-blue font-bold">
              <td colSpan="4" className="border p-3 text-right">Total {categoria}:</td>
              <td className="border p-3">${total.toFixed(2)}</td>
              <td className="border p-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {items.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No hay items en {categoria}. Agrega uno usando el formulario de arriba.
        </div>
      )}
    </div>
  );
}