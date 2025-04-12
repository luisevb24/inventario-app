'use client';
import { useState, useEffect } from 'react';
import { fetchCatalogItems } from '../../lib/supabase';

export default function InventarioTable({ items, onAddItem, onRemoveItem, categoria, projectId }) {
  // Estado para el nuevo item
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unit: 'unidades',
    unit_cost: 0,
    category: categoria // Asignar la categoría por defecto según la tabla
  });

  // Estado para el catálogo de items
  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState(null);

  // Cargar catálogo desde Supabase
  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      setError(null);
      try {
        const items = await fetchCatalogItems(categoria);
        setCatalogItems(items);
      } catch (error) {
        console.error('Error al cargar catálogo:', error);
        setError('No se pudo cargar el catálogo');
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, [categoria]);

  // Manejar cambios en los campos del formulario
  function handleChange(e) {
    const { name, value } = e.target;
    
    if (name === 'quantity' || name === 'unit_cost') {
      // Asegurar que los valores numéricos sean parseados correctamente
      const numericValue = value === '' ? '' : parseFloat(value) || 0;
      setNewItem({
        ...newItem,
        [name]: numericValue
      });
    } else {
      setNewItem({
        ...newItem,
        [name]: value
      });
    }
  }

  // Manejar selección de item del catálogo
  function handleCatalogItemSelect(e) {
    const itemId = e.target.value;
    if (itemId === '') {
      setSelectedCatalogItem(null);
      setNewItem({
        description: '',
        quantity: 1,
        unit: 'unidades',
        unit_cost: 0,
        category: categoria
      });
      return;
    }

    const selected = catalogItems.find(item => item.id.toString() === itemId);
    if (selected) {
      setSelectedCatalogItem(selected);
      setNewItem({
        description: selected.description,
        unit: selected.unit || 'unidades',
        unit_cost: parseFloat(selected.unit_cost) || 0,
        quantity: 1,
        category: categoria,
        catalog_item_id: selected.id
      });
    }
  }

  // Manejar envío del formulario
  function handleSubmit(e) {
    e.preventDefault();
    
    // Validar datos antes de enviar
    if (!newItem.description.trim()) {
      alert('La descripción es obligatoria');
      return;
    }
    
    if (!projectId) {
      alert('No se ha seleccionado un proyecto');
      return;
    }
    
    // Preparar el objeto para agregar al inventario
    const itemToAdd = {
      project_id: projectId,
      description: newItem.description.trim(),
      quantity: parseFloat(newItem.quantity) || 0,
      unit: newItem.unit.trim(),
      unit_cost: parseFloat(newItem.unit_cost) || 0,
      category: categoria
    };
    
    // Solo agregar catalog_item_id si existe
    if (newItem.catalog_item_id) {
      itemToAdd.catalog_item_id = newItem.catalog_item_id;
    }
    
    onAddItem(itemToAdd);
    
    // Restablecer el formulario
    setNewItem({
      description: '',
      quantity: 1,
      unit: 'unidades',
      unit_cost: 0,
      category: categoria
    });
    setSelectedCatalogItem(null);
  }

  // Calcular el total para esta categoría
  const total = items.reduce((sum, item) => {
    return sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0));
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      {error && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Descripción</th>
              <th className="text-left">Cantidad</th>
              <th className="text-left">Unidad</th>
              <th className="text-left">Costo Unitario</th>
              <th className="text-left">Subtotal</th>
              <th className="text-left">Acciones</th>
            </tr>
          </thead>
          
          <tbody>
            {/* Filas con los items existentes */}
            {items.map(item => {
              const quantity = parseFloat(item.quantity) || 0;
              const unitCost = parseFloat(item.unit_cost) || 0;
              
              return (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td>{quantity}</td>
                  <td>{item.unit}</td>
                  <td>${unitCost.toFixed(2)}</td>
                  <td>${(quantity * unitCost).toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
            
            {/* Fila para añadir nuevo item */}
            <tr className="bg-bg-beige/50">
              <td>
                <div className="mb-2">
                  <select 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    onChange={handleCatalogItemSelect}
                    value={selectedCatalogItem?.id || ''}
                    disabled={loading}
                  >
                    <option value="">-- Seleccionar del catálogo --</option>
                    {catalogItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.description} (${parseFloat(item.unit_cost).toFixed(2)}/{item.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  name="description"
                  value={newItem.description}
                  onChange={handleChange}
                  placeholder="Descripción del item"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </td>
              <td>
                <input
                  type="number"
                  name="quantity"
                  value={newItem.quantity}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </td>
              <td>
                <input
                  type="text"
                  name="unit"
                  value={newItem.unit}
                  onChange={handleChange}
                  placeholder="ej. unidades, kg, litros"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </td>
              <td>
                <input
                  type="number"
                  name="unit_cost"
                  value={newItem.unit_cost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </td>
              <td>
                ${((parseFloat(newItem.quantity) || 0) * (parseFloat(newItem.unit_cost) || 0)).toFixed(2)}
              </td>
              <td>
                <button
                  onClick={handleSubmit}
                  className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
                  disabled={loading}
                >
                  Agregar
                </button>
              </td>
            </tr>
          </tbody>
          
          {/* Pie de la tabla con el total de esta categoría */}
          <tfoot>
            <tr className="bg-table-gray-light font-bold">
              <td colSpan="4" className="text-right">Total {categoria}:</td>
              <td>${total.toFixed(2)}</td>
              <td></td>
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