'use client';
import { useState, useEffect } from 'react';
import { fetchCatalogItems } from '../../lib/supabase';

export default function ManoObraTable({ items, onAddItem, onRemoveItem, projectId }) {
  // Multiplicadores para cada tipo de horario
  const multiplicadores = {
    'Normal': 1,
    'Nocturno': 1.35,
    'Dominical': 1.75,
    'T. Extra': 2
  };

  // Estado para el nuevo item
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unit: 'horas',
    unit_cost: 0,
    type: 'Normal',
    category: 'Mano de obra',
    multiplier: 1
  });

  // Estado para catálogo de mano de obra
  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState(null);

  // Cargar catálogo desde Supabase
  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const items = await fetchCatalogItems('Mano de obra');
        setCatalogItems(items);
      } catch (error) {
        console.error('Error al cargar catálogo de mano de obra:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, []);

  // Manejar cambios en los campos del formulario
  function handleChange(e) {
    const { name, value } = e.target;
    
    if (name === 'type') {
      setNewItem({
        ...newItem,
        type: value,
        multiplier: multiplicadores[value] || 1
      });
    } else {
      setNewItem({
        ...newItem,
        [name]: name === 'quantity' || name === 'unit_cost' 
          ? parseFloat(value) || 0 
          : value
      });
    }
  }

  // Manejar selección de item del catálogo
  function handleCatalogItemSelect(e) {
    const itemId = e.target.value;
    if (itemId === '') {
      setSelectedCatalogItem(null);
      return;
    }

    const selected = catalogItems.find(item => item.id.toString() === itemId);
    if (selected) {
      setSelectedCatalogItem(selected);
      setNewItem({
        description: selected.description,
        unit: selected.unit || 'horas',
        unit_cost: selected.unit_cost,
        quantity: 1,
        type: selected.type || 'Normal',
        multiplier: selected.multiplier || multiplicadores[selected.type] || 1,
        category: 'Mano de obra',
        catalog_item_id: selected.id
      });
    }
  }

  // Manejar envío del formulario
  function handleSubmit(e) {
    e.preventDefault();
    
    // Preparar el objeto para agregar al inventario
    const itemToAdd = {
      project_id: projectId,
      description: newItem.description,
      quantity: newItem.quantity,
      unit: newItem.unit,
      unit_cost: newItem.unit_cost,
      type: newItem.type,
      multiplier: newItem.multiplier,
      category: 'Mano de obra',
      catalog_item_id: newItem.catalog_item_id
    };
    
    onAddItem(itemToAdd);
    
    // Restablecer el formulario
    setNewItem({
      description: '',
      quantity: 1,
      unit: 'horas',
      unit_cost: 0,
      type: 'Normal',
      multiplier: 1,
      category: 'Mano de obra'
    });
    setSelectedCatalogItem(null);
  }

  // Calcular el subtotal para un item (incluyendo el multiplicador)
  function calcularSubtotal(item) {
    const multiplicador = item.multiplier || multiplicadores[item.type] || 1;
    return item.quantity * item.unit_cost * multiplicador;
  }

  // Calcular el total para esta categoría
  const total = items.reduce((sum, item) => {
    return sum + calcularSubtotal(item);
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
      <h3 className="text-lg font-semibold p-4 bg-blue-50 border-b">
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
              const multiplicador = item.multiplier || multiplicadores[item.type] || 1;
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border p-3">{item.description}</td>
                  <td className="border p-3">{item.quantity}</td>
                  <td className="border p-3">{item.unit}</td>
                  <td className="border p-3">${item.unit_cost.toFixed(2)}</td>
                  <td className="border p-3">{item.type}</td>
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
            <tr className="bg-blue-50">
              <td className="border p-2">
                <div className="mb-2">
                  <select 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onChange={handleCatalogItemSelect}
                    value={selectedCatalogItem?.id || ''}
                  >
                    <option value="">-- Seleccionar del catálogo --</option>
                    {catalogItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.description} (${item.unit_cost.toFixed(2)}/{item.unit || 'horas'})
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  name="description"
                  value={newItem.description}
                  onChange={handleChange}
                  placeholder="Descripción del trabajo"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  name="quantity"
                  value={newItem.quantity}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </td>
              <td className="border p-2">
                <input
                  type="text"
                  name="unit"
                  value={newItem.unit}
                  onChange={handleChange}
                  placeholder="ej. horas, días"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  name="unit_cost"
                  value={newItem.unit_cost}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </td>
              <td className="border p-2">
                <select
                  name="type"
                  value={newItem.type}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                >
                  {Object.keys(multiplicadores).map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </td>
              <td className="border p-2">
                x{newItem.multiplier.toFixed(2)}
              </td>
              <td className="border p-2">
                ${(newItem.quantity * newItem.unit_cost * newItem.multiplier).toFixed(2)}
              </td>
              <td className="border p-2">
                <button
                  onClick={handleSubmit}
                  className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition-colors"
                >
                  Agregar
                </button>
              </td>
            </tr>
          </tbody>
          
          {/* Pie de la tabla con el total de esta categoría */}
          <tfoot>
            <tr className="bg-gray-100 font-bold">
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