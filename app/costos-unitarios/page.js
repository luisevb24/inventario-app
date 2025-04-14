'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchUnitCosts, addUnitCost, updateUnitCost, deleteUnitCost } from '../../lib/supabase';

export default function CostosUnitariosPage() {
  const [unitCosts, setUnitCosts] = useState([]);
  const [filteredCosts, setFilteredCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLaborOnly, setShowLaborOnly] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Estado para el nuevo costo unitario
  const [newUnitCost, setNewUnitCost] = useState({
    name: '',
    code: '',
    default_cost: 0,
    description: '',
    is_labor_unit: false
  });
  
  // Cargar costos unitarios desde Supabase
  useEffect(() => {
    async function loadUnitCosts() {
      setLoading(true);
      try {
        const costs = await fetchUnitCosts();
        setUnitCosts(costs);
        setFilteredCosts(costs);
      } catch (error) {
        console.error('Error al cargar costos unitarios:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUnitCosts();
  }, []);
  
  // Aplicar filtros cuando cambian los criterios
  useEffect(() => {
    let result = [...unitCosts];
    
    if (showLaborOnly) {
      result = result.filter(unit => unit.is_labor_unit);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(unit => 
        unit.name.toLowerCase().includes(term) || 
        unit.code.toLowerCase().includes(term) ||
        (unit.description && unit.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredCosts(result);
  }, [unitCosts, searchTerm, showLaborOnly]);
  
  // Manejar cambios en el formulario
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setNewUnitCost({
        ...newUnitCost,
        [name]: checked
      });
    } else if (name === 'default_cost') {
      setNewUnitCost({
        ...newUnitCost,
        [name]: parseFloat(value) || 0
      });
    } else {
      setNewUnitCost({
        ...newUnitCost,
        [name]: value
      });
    }
  }
  
  // Resetear el formulario
  function resetForm() {
    setNewUnitCost({
      name: '',
      code: '',
      default_cost: 0,
      description: '',
      is_labor_unit: false
    });
    setEditingId(null);
  }
  
  // Iniciar edición de un costo unitario existente
  function startEdit(unitCost) {
    setNewUnitCost({
      name: unitCost.name,
      code: unitCost.code,
      default_cost: unitCost.default_cost,
      description: unitCost.description || '',
      is_labor_unit: unitCost.is_labor_unit
    });
    setEditingId(unitCost.id);
  }
  
  // Manejar envío del formulario
  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validación básica
    if (!newUnitCost.name || !newUnitCost.code) {
      alert('Por favor complete los campos obligatorios (Nombre y Código)');
      return;
    }
    
    try {
      let resultCost;
      
      if (editingId) {
        // Actualizar costo existente
        resultCost = await updateUnitCost(editingId, newUnitCost);
        if (resultCost) {
          setUnitCosts(unitCosts.map(cost => 
            cost.id === editingId ? resultCost : cost
          ));
        }
      } else {
        // Agregar nuevo costo
        resultCost = await addUnitCost(newUnitCost);
        if (resultCost) {
          setUnitCosts([...unitCosts, resultCost]);
        }
      }
      
      if (resultCost) {
        resetForm();
      }
    } catch (error) {
      console.error('Error al guardar costo unitario:', error);
      alert('Error al guardar costo unitario');
    }
  }
  
  // Manejar eliminación de un costo unitario
  async function handleDelete(id) {
    if (!confirm('¿Está seguro de que desea eliminar este costo unitario?')) {
      return;
    }
    
    try {
      const success = await deleteUnitCost(id);
      
      if (success) {
        setUnitCosts(unitCosts.filter(cost => cost.id !== id));
        
        // Si estábamos editando este item, resetear el formulario
        if (editingId === id) {
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error al eliminar costo unitario:', error);
      alert('Error al eliminar costo unitario');
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <main className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="bg-tertiary hover:bg-tertiary/90 text-white py-2 px-4 rounded transition-colors">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold">Tabla de Costos Unitarios</h1>
        <Link href="/catalogo" className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded transition-colors">
          Catálogo
        </Link>
      </div>
      
      {/* Formulario para agregar/editar costo unitario */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="bg-secondary/10 p-4 border-b border-gray-300/20">
          <h2 className="text-lg font-semibold">
            {editingId ? 'Editar Costo Unitario' : 'Agregar Nuevo Costo Unitario'}
          </h2>
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-medium">Nombre*</label>
                <input
                  type="text"
                  name="name"
                  value={newUnitCost.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="ej. horas, kilogramos"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Código*</label>
                <input
                  type="text"
                  name="code"
                  value={newUnitCost.code}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="ej. hr, kg"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Costo por Defecto*</label>
                <input
                  type="number"
                  name="default_cost"
                  value={newUnitCost.default_cost}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block mb-2 font-medium">Descripción</label>
                <input
                  type="text"
                  name="description"
                  value={newUnitCost.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Descripción opcional"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_labor_unit"
                  name="is_labor_unit"
                  checked={newUnitCost.is_labor_unit}
                  onChange={handleChange}
                  className="h-5 w-5 text-primary"
                />
                <label htmlFor="is_labor_unit" className="ml-2 block font-medium">
                  Unidad de Mano de Obra
                </label>
              </div>
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
                className="bg-primary text-white py-2 px-4 rounded hover:bg-primary/80 transition-colors"
              >
                {editingId ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Buscar costos unitarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="show_labor_only"
              checked={showLaborOnly}
              onChange={(e) => setShowLaborOnly(e.target.checked)}
              className="h-5 w-5 text-primary"
            />
            <label htmlFor="show_labor_only" className="ml-2">
              Solo Mano de Obra
            </label>
          </div>
        </div>
      </div>
      
      {/* Tabla de costos unitarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Nombre</th>
                <th className="text-left">Código</th>
                <th className="text-left">Costo por Defecto</th>
                <th className="text-left">Descripción</th>
                <th className="text-left">Mano de Obra</th>
                <th className="text-left">Acciones</th>
              </tr>
            </thead>
            
            <tbody>
              {filteredCosts.length > 0 ? (
                filteredCosts.map(unit => (
                  <tr key={unit.id}>
                    <td>{unit.name}</td>
                    <td>{unit.code}</td>
                    <td>${unit.default_cost.toFixed(2)}</td>
                    <td>{unit.description || '-'}</td>
                    <td>{unit.is_labor_unit ? 'Sí' : 'No'}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(unit)}
                          className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(unit.id)}
                          className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 p-4">
                    No hay costos unitarios que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {unitCosts.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No hay costos unitarios definidos. Agregue algunos usando el formulario de arriba.
          </div>
        )}
      </div>
    </main>
  );
}