'use client';
import { useState, useEffect } from 'react';
import { fetchCatalogItems, fetchUnitCosts } from '../../lib/supabase';

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

  // Estados para catálogos
  const [catalogItems, setCatalogItems] = useState([]);
  const [unitCosts, setUnitCosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState(null);
  const [selectedUnitCost, setSelectedUnitCost] = useState(null);

  // Cargar catálogo y costos unitarios desde Supabase
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        // Obtener items de mano de obra del catálogo
        const items = await fetchCatalogItems('Mano de obra');
        setCatalogItems(items);

        // Obtener costos unitarios para mano de obra
        const costs = await fetchUnitCosts(true); // true = solo para mano de obra
        setUnitCosts(costs);

        // Establecer unidad por defecto si hay alguna disponible
        if (costs.length > 0) {
          const defaultUnit = costs.find(u => u.name === 'horas') || costs[0];
          setNewItem(prev => ({
            ...prev,
            unit: defaultUnit.name,
            unit_cost: defaultUnit.default_cost
          }));
          setSelectedUnitCost(defaultUnit);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('No se pudieron cargar los datos necesarios');
      } finally {
        setLoading(false);
      }
    }

    loadData();
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
    } else if (name === 'quantity' || name === 'unit_cost') {
      // Asegurar que los valores numéricos sean parseados correctamente
      const numericValue = value === '' ? '' : parseFloat(value) || 0;
      setNewItem({
        ...newItem,
        [name]: numericValue
      });
    } else if (name === 'unit') {
      // Buscar el costo unitario correspondiente
      const unitCost = unitCosts.find(uc => uc.name === value);
      if (unitCost) {
        setSelectedUnitCost(unitCost);
        setNewItem({
          ...newItem,
          unit: value,
          unit_cost: unitCost.default_cost
        });
      } else {
        setSelectedUnitCost(null);
        setNewItem({
          ...newItem,
          unit: value
        });
      }
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
      // Mantener la unidad y costo unitario actuales
      const currentUnit = newItem.unit;
      const currentUnitCost = newItem.unit_cost;

      setNewItem({
        description: '',
        quantity: 1,
        unit: currentUnit,
        unit_cost: currentUnitCost,
        type: 'Normal',
        multiplier: 1,
        category: 'Mano de obra'
      });
      return;
    }

    const selected = catalogItems.find(item => item.id.toString() === itemId);
    if (selected) {
      setSelectedCatalogItem(selected);

      // Mantener la unidad seleccionada si es posible
      let unitToUse = selected.unit || 'horas';
      let costToUse = parseFloat(selected.unit_cost) || 0;

      // Si la unidad del item seleccionado existe en nuestra tabla de costos unitarios,
      // usar su costo por defecto
      const unitCost = unitCosts.find(uc => uc.name === unitToUse);
      if (unitCost) {
        setSelectedUnitCost(unitCost);
        costToUse = unitCost.default_cost;
      }

      setNewItem({
        description: selected.description,
        unit: unitToUse,
        unit_cost: costToUse,
        quantity: 1,
        type: selected.type || 'Normal',
        multiplier: parseFloat(selected.multiplier) || multiplicadores[selected.type] || 1,
        category: 'Mano de obra',
        catalog_item_id: selected.id
      });
    }
  }

  // Manejar envío del formulario
  async function handleSubmit(e) {
    e.preventDefault();
  
    if (!newItem.description.trim()) {
      alert('La descripción es obligatoria');
      return;
    }
  
    if (!projectId) {
      alert('No se ha seleccionado un proyecto');
      return;
    }
  
    const itemToAdd = {
      project_id: projectId,
      description: newItem.description.trim(),
      quantity: parseFloat(newItem.quantity) || 0,
      unit: newItem.unit.trim(),
      unit_cost: parseFloat(newItem.unit_cost) || 0,
      type: newItem.type,
      multiplier: parseFloat(newItem.multiplier) || 1,
      category: 'Mano de obra'
    };
  
    if (newItem.catalog_item_id) {
      itemToAdd.catalog_item_id = newItem.catalog_item_id;
    }
  
    if (selectedUnitCost) {
      itemToAdd.unit_cost_id = selectedUnitCost.id;
    }
  
    // Await the asynchronous call
    const addedItem = await onAddItem(itemToAdd);
    if (!addedItem) {
      alert('Hubo un error al agregar el item');
      return;
    }
  
    // Reset specific fields (description and quantity)
    setNewItem(prev => ({
      ...prev,
      description: '',
      quantity: 1,
      type: 'Normal',
      multiplier: 1,
      catalog_item_id: undefined
    }));
    setSelectedCatalogItem(null);
  }
  
  

  // Calcular el subtotal para un item (incluyendo el multiplicador)
  function calcularSubtotal(item) {
    const multiplicador = parseFloat(item.multiplier) || multiplicadores[item.type] || 1;
    return (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0) * multiplicador;
  }

  // Calcular el total para esta categoría
  const total = items.reduce((sum, item) => {
    return sum + calcularSubtotal(item);
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6 text-tertiary">
      {error && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-[#faf6f3]">
          <thead className='bg-[#b4c0a2] text-xs text-center'>
            <tr>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Unidad</th>
              <th>Costo Unitario</th>
              <th>Tipo Horario</th>
              <th>Multiplicador</th>
              <th>Subtotal</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody className='table-content'>
            {/* Filas con los items existentes */}
            {items.map(item => {
              const multiplicador = parseFloat(item.multiplier) || multiplicadores[item.type] || 1;
              const quantity = parseFloat(item.quantity) || 0;
              const unitCost = parseFloat(item.unit_cost) || 0;

              return (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td>{quantity}</td>
                  <td>{item.unit}</td>
                  <td>${unitCost.toFixed(2)}</td>
                  <td>{item.type}</td>
                  <td>x{multiplicador.toFixed(2)}</td>
                  <td>${(quantity * unitCost * multiplicador).toFixed(2)}</td>
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
            <tr className="table-content">
              <td>
                <div className="mb-2 table-content">
                  <select
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary table-content"
                    onChange={handleCatalogItemSelect}
                    value={selectedCatalogItem?.id || ''}
                    disabled={loading}
                  >
                    <option value="">-- Seleccionar del catálogo --</option>
                    {catalogItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.description} (${parseFloat(item.unit_cost).toFixed(2)}/{item.unit || 'horas'})
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
                <select
                  name="unit"
                  value={newItem.unit}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  {unitCosts.length > 0 ? (
                    unitCosts.map(unitCost => (
                      <option key={unitCost.id} value={unitCost.name}>
                        {unitCost.name} (${unitCost.default_cost.toFixed(2)})
                      </option>
                    ))
                  ) : (
                    <option value="horas">horas</option>
                  )}
                </select>
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
                <select
                  name="type"
                  value={newItem.type}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  {Object.keys(multiplicadores).map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </td>
              <td>
                x{parseFloat(newItem.multiplier).toFixed(2)}
              </td>
              <td>
                ${((parseFloat(newItem.quantity) || 0) * (parseFloat(newItem.unit_cost) || 0) * (parseFloat(newItem.multiplier) || 1)).toFixed(2)}
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
              <td colSpan="6" className="text-right">Total Mano de Obra:</td>
              <td>${total.toFixed(2)}</td>
              <td></td>
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