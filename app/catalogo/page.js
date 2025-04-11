'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCatalogItems, addCatalogItem } from '../../lib/supabase';

export default function CatalogoPage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para el nuevo item del catálogo
  const [newItem, setNewItem] = useState({
    category: '',
    description: '',
    unit: '',
    unit_cost: 0,
    type: '',
    multiplier: null
  });
  
  // Cargar items del catálogo desde Supabase
  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const catalogItems = await fetchCatalogItems();
        setItems(catalogItems);
        setFilteredItems(catalogItems);
      } catch (error) {
        console.error('Error al cargar catálogo:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadCatalog();
  }, []);
  
  // Aplicar filtros cuando cambian los criterios
  useEffect(() => {
    let result = [...items];
    
    if (categoryFilter) {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.description.toLowerCase().includes(term) || 
        item.unit.toLowerCase().includes(term)
      );
    }
    
    setFilteredItems(result);
  }, [items, categoryFilter, searchTerm]);
  
  // Manejar cambios en el formulario
  function handleChange(e) {
    const { name, value } = e.target;
    
    if (name === 'unit_cost') {
      setNewItem({
        ...newItem,
        [name]: parseFloat(value) || 0
      });
    } else if (name === 'multiplier' && value) {
      setNewItem({
        ...newItem,
        [name]: parseFloat(value)
      });
    } else {
      setNewItem({
        ...newItem,
        [name]: value
      });
    }
  }
  
  // Resetear el formulario
  function resetForm() {
    setNewItem({
      category: '',
      description: '',
      unit: '',
      unit_cost: 0,
      type: '',
      multiplier: null
    });
  }
  
  // Manejar envío del formulario
  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validación básica
    if (!newItem.category || !newItem.description || !newItem.unit) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    
    try {
      const itemToAdd = { ...newItem };
      
      // Si no es mano de obra, quitar type y multiplier
      if (newItem.category !== 'Mano de obra') {
        delete itemToAdd.type;
        delete itemToAdd.multiplier;
      }
      
      const addedItem = await addCatalogItem(itemToAdd);
      
      if (addedItem) {
        setItems([...items, addedItem]);
        resetForm();
      }
    } catch (error) {
      console.error('Error al agregar item al catálogo:', error);
      alert('Error al agregar item al catálogo');
    }
  }
  
  // Lista de categorías
  const categorias = ['Equipo', 'Materiales', 'Consumibles', 'Otros', 'Mano de obra'];
  
  // Lista de tipos de horario para mano de obra
  const tiposHorario = ['Normal', 'Nocturno', 'Dominical', 'T. Extra'];
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center my-6">
        <Link href="/" className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition-colors">
          ← Volver al Inventario
        </Link>
        <h1 className="text-2xl font-bold">Catálogo de Productos y Servicios</h1>
        <div className="w-28"></div> {/* Spacer for alignment */}
      </div>
      
      {/* Formulario para agregar nuevo item */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <h2 className="text-xl font-semibold p-4 bg-blue-100 border-b">Agregar Nuevo Item al Catálogo</h2>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block mb-2 font-medium">Categoría*</label>
              <select
                name="category"
                value={newItem.category}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              >
                <option value="">Seleccionar Categoría</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Descripción*</label>
              <input
                type="text"
                name="description"
                value={newItem.description}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Unidad*</label>
              <input
                type="text"
                name="unit"
                value={newItem.unit}
                onChange={handleChange}
                placeholder="ej. unidades, kg, horas"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Costo Unitario*</label>
              <input
                type="number"
                name="unit_cost"
                value={newItem.unit_cost}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
            
            {newItem.category === 'Mano de obra' && (
              <>
                <div>
                  <label className="block mb-2 font-medium">Tipo de Horario</label>
                  <select
                    name="type"
                    value={newItem.type}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Sin tipo específico</option>
                    {tiposHorario.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Multiplicador</label>
                  <input
                    type="number"
                    name="multiplier"
                    value={newItem.multiplier || ''}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="ej. 1.35 para nocturno"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded mr-2 hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Agregar al Catálogo
            </button>
          </div>
        </form>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Buscar en el catálogo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Tabla de catálogo */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-blue-50 border-b">Catálogo</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">ID</th>
                <th className="border p-3 text-left">Categoría</th>
                <th className="border p-3 text-left">Descripción</th>
                <th className="border p-3 text-left">Unidad</th>
                <th className="border p-3 text-left">Costo Unitario</th>
                <th className="border p-3 text-left">Tipo</th>
                <th className="border p-3 text-left">Multiplicador</th>
              </tr>
            </thead>
            
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border p-3">{item.id}</td>
                    <td className="border p-3">{item.category}</td>
                    <td className="border p-3">{item.description}</td>
                    <td className="border p-3">{item.unit}</td>
                    <td className="border p-3">${item.unit_cost.toFixed(2)}</td>
                    <td className="border p-3">{item.type || '-'}</td>
                    <td className="border p-3">{item.multiplier ? `x${item.multiplier.toFixed(2)}` : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="border p-4 text-center text-gray-500">
                    No hay items en el catálogo que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {items.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No hay items en el catálogo. Agrega algunos usando el formulario de arriba.
          </div>
        )}
      </div>
    </main>
  );
}