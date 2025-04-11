'use client';
import { useState } from 'react';

export default function ManoObraTable({ items, onAddItem, onRemoveItem }) {
  // Multiplicadores para cada tipo de horario
  const multiplicadores = {
    'Normal': 1,
    'Nocturno': 1.35,
    'Dominical': 1.75,
    'T. Extra': 2
  };

  // Estado para el nuevo item
  const [newItem, setNewItem] = useState({
    descripcion: '',
    cantidad: 1,
    unidad: 'horas',
    costoUnitario: 0,
    tipoHorario: 'Normal',
    categoria: 'Mano de obra'
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
      id: Date.now(),
      multiplicador: multiplicadores[newItem.tipoHorario]
    });
    // Restablecer el formulario
    setNewItem({
      descripcion: '',
      cantidad: 1,
      unidad: 'horas',
      costoUnitario: 0,
      tipoHorario: 'Normal',
      categoria: 'Mano de obra'
    });
  }

  // Calcular el subtotal para un item (incluyendo el multiplicador)
  function calcularSubtotal(item) {
    const multiplicador = item.multiplicador || multiplicadores[item.tipoHorario] || 1;
    return item.cantidad * item.costoUnitario * multiplicador;
  }

  // Calcular el total para esta categoría
  const total = items.reduce((sum, item) => {
    return sum + calcularSubtotal(item);
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
      <h3 className="text-lg font-semibold p-4 bg-primary text-white border-b">
        Mano de Obra
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">Descripción</th>
              <th className="border p-3 text-left">Cantidad</th>
              <th className="border p-3 text-left">Unidad</th>
              <th className="border p-3 text-left">Costo Unitario</th>
              <th className="border p-3 text-left">Tipo Horario</th>
              <th className="border p-3 text-left">Multiplicador</th>
              <th className="border p-3 text-left">Subtotal</th>
              <th className="border p-3 text-left">Acciones</th>
            </tr>
          </thead>
          
          <tbody>
            {/* Filas con los items existentes */}
            {items.map(item => {
              const multiplicador = item.multiplicador || multiplicadores[item.tipoHorario] || 1;
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border p-3">{item.descripcion}</td>
                  <td className="border p-3">{item.cantidad}</td>
                  <td className="border p-3">{item.unidad}</td>
                  <td className="border p-3">${item.costoUnitario.toFixed(2)}</td>
                  <td className="border p-3">{item.tipoHorario}</td>
                  <td className="border p-3">x{multiplicador.toFixed(2)}</td>
                  <td className="border p-3">${calcularSubtotal(item).toFixed(2)}</td>
                  <td className="border p-3">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
            
            {/* Fila para añadir nuevo item */}
            <tr className="bg-light-blue">
              <td className="border p-2">
                <input
                  type="text"
                  name="descripcion"
                  value={newItem.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción del trabajo"
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
                  placeholder="ej. horas, días"
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
                <select
                  name="tipoHorario"
                  value={newItem.tipoHorario}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  {Object.keys(multiplicadores).map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </td>
              <td className="border p-2">
                x{multiplicadores[newItem.tipoHorario].toFixed(2)}
              </td>
              <td className="border p-2">
                ${(newItem.cantidad * newItem.costoUnitario * multiplicadores[newItem.tipoHorario]).toFixed(2)}
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
              <td colSpan="6" className="border p-3 text-right">Total Mano de Obra:</td>
              <td className="border p-3">${total.toFixed(2)}</td>
              <td className="border p-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {items.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No hay mano de obra registrada. Agrega una usando el formulario de arriba.
        </div>
      )}
    </div>
  );
}