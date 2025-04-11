'use client';
import { useState, useEffect } from 'react';
import InventarioTable from './components/InventarioTable';
import ManoObraTable from './components/ManoObraTable';
import TotalGeneral from './components/TotalGeneral';

export default function Home() {
  // Estado para almacenar los items con categorías
  const [items, setItems] = useState([]);
  
  // Lista de categorías disponibles
  const categorias = ['Equipo', 'Materiales', 'Consumibles', 'Otros'];
  
  // Cargar items desde localStorage al iniciar
  useEffect(() => {
    const savedItems = localStorage.getItem('inventario-items');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);
  
  // Guardar items en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('inventario-items', JSON.stringify(items));
  }, [items]);
  
  // Función para agregar un nuevo item
  function addItem(newItem) {
    setItems([...items, newItem]);
  }
  
  // Función para eliminar un item
  function removeItem(id) {
    setItems(items.filter(item => item.id !== id));
  }
  
  // Filtrar items por categoría
  function getItemsByCategory(categoria) {
    return items.filter(item => item.categoria === categoria);
  }
  
  // Calcular el total general de todas las categorías
  const totalGeneral = items.reduce((sum, item) => {
    // Para los items de mano de obra, considerar el multiplicador
    if (item.categoria === 'Mano de obra') {
      const multiplicador = item.multiplicador || 1;
      return sum + (item.cantidad * item.costoUnitario * multiplicador);
    }
    return sum + (item.cantidad * item.costoUnitario);
  }, 0);
  
  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6 bg-tertiary bg-opacity-10">
          <h1 className="text-3xl font-bold text-tertiary text-center">Sistema de Inventario</h1>
          <p className="text-center mt-2 text-gray-600">Gestiona tu inventario de manera eficiente</p>
          
          <div className="flex justify-center gap-4 mt-4">
            <button className="bg-primary text-white py-2 px-4 rounded shadow hover:bg-opacity-90 transition-colors">
              Nuevo Proyecto
            </button>
            <button className="bg-secondary text-white py-2 px-4 rounded shadow hover:bg-opacity-90 transition-colors">
              Importar Datos
            </button>
          </div>
        </div>
      </div>
      
      {/* Sección de Mano de Obra */}
      <div className="my-8">
        <h2 className="text-xl font-semibold mb-4 text-tertiary">Mano de Obra</h2>
        <ManoObraTable 
          items={getItemsByCategory('Mano de obra')} 
          onAddItem={addItem} 
          onRemoveItem={removeItem}
        />
      </div>
      
      {/* Renderizar una tabla para cada categoría */}
      {categorias.map(categoria => (
        <div key={categoria} className="my-8">
          <h2 className="text-xl font-semibold mb-4 text-tertiary">{categoria}</h2>
          <InventarioTable 
            items={getItemsByCategory(categoria)} 
            onAddItem={addItem} 
            onRemoveItem={removeItem}
            categoria={categoria}
          />
        </div>
      ))}
      
      {/* Componente para mostrar el total general */}
      <TotalGeneral total={totalGeneral} />
    </main>
  );
}