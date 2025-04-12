'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InventarioTable from './components/InventarioTable';
import ManoObraTable from './components/ManoObraTable';
import TotalGeneral from './components/TotalGeneral';
import { 
  fetchProjects, 
  fetchInventoryItems, 
  addInventoryItem, 
  deleteInventoryItem,
  upsertProject
} from '../lib/supabase';

export default function Home() {
  // Estado para almacenar los items con categorías
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // Lista de categorías disponibles
  const categorias = ['Equipo', 'Materiales', 'Consumibles', 'Otros'];
  
  // Cargar proyectos desde Supabase
  useEffect(() => {
    async function loadProjects() {
      try {
        setError(null);
        const projectsData = await fetchProjects();
        setProjects(projectsData);
        
        // Asegurarnos de que el inventario general existe
        const generalExists = projectsData.find(p => p.id === 'general');
        
        if (!generalExists) {
          console.log('Creando proyecto general...');
          const generalProject = {
            id: 'general',
            title: 'Inventario General',
            status: 'Activo',
            created_at: new Date().toISOString()
          };
          
          await upsertProject(generalProject);
          
          // Actualizar la lista de proyectos
          setProjects(prev => [...prev, generalProject]);
        }
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
        setError('No se pudieron cargar los proyectos. Por favor, verifica la conexión a la base de datos.');
      }
    }
    
    loadProjects();
  }, []);
  
  // Cargar items desde Supabase cuando cambia el proyecto seleccionado
  useEffect(() => {
    async function loadItems() {
      setLoading(true);
      setError(null);
      try {
        if (selectedProjectId) {
          const inventoryItems = await fetchInventoryItems(selectedProjectId);
          setItems(inventoryItems);
        }
      } catch (error) {
        console.error('Error al cargar items:', error);
        setError('No se pudieron cargar los items del proyecto');
      } finally {
        setLoading(false);
      }
    }
    
    loadItems();
  }, [selectedProjectId]);
  
  // Función para agregar un nuevo item
  async function addItem(newItem) {
    try {
      setError(null);
      
      // Validar datos básicos
      if (!newItem.project_id || !newItem.description || !newItem.category) {
        console.error('Datos del item incompletos', newItem);
        alert('Los datos del item están incompletos');
        return;
      }
      
      // Asegurarse de que project_id existe
      if (newItem.project_id !== 'general' && !projects.find(p => p.id === newItem.project_id)) {
        console.error('El proyecto no existe', newItem.project_id);
        alert('El proyecto seleccionado no existe');
        return;
      }
      
      const addedItem = await addInventoryItem(newItem);
      if (addedItem) {
        setItems(prevItems => [...prevItems, addedItem]);
      } else {
        alert('No se pudo agregar el item. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al agregar item:', error);
      setError('Error al agregar item al inventario');
    }
  }
  
  // Función para eliminar un item
  async function removeItem(id) {
    if (!id) {
      console.error('ID de item no proporcionado');
      return;
    }
    
    try {
      setError(null);
      const success = await deleteInventoryItem(id);
      if (success) {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
      } else {
        alert('No se pudo eliminar el item. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al eliminar item:', error);
      setError('Error al eliminar item del inventario');
    }
  }
  
  // Filtrar items por categoría
  function getItemsByCategory(categoria) {
    return items.filter(item => item.category === categoria);
  }
  
  // Calcular el total general de todas las categorías
  const totalGeneral = items.reduce((sum, item) => {
    // Para los items de mano de obra, considerar el multiplicador
    if (item.category === 'Mano de obra') {
      const multiplicador = parseFloat(item.multiplier) || 1;
      return sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0) * multiplicador);
    }
    return sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0));
  }, 0);
  
  // Redirigir a la página del proyecto específico
  function handleProjectSelect(e) {
    const projectId = e.target.value;
    if (projectId === 'general') {
      setSelectedProjectId('general');
    } else {
      router.push(`/proyecto/${projectId}`);
    }
  }
  
  if (loading && !error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center my-6">
        <h1 className="text-2xl font-bold">Sistema de Inventario</h1>
        
        <div className="flex items-center space-x-4">
          <select
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={selectedProjectId}
            onChange={handleProjectSelect}
          >
            <option value="general">Inventario General</option>
            {projects
              .filter(p => p.id !== 'general')
              .map(project => (
                <option key={project.id} value={project.id}>
                  {project.title || project.id}
                </option>
              ))
            }
          </select>
          
          <Link href="/catalogo" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors">
            Gestionar Catálogo
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Sección de Mano de Obra */}
      <div className="my-8">
        <h2 className="text-xl font-semibold mb-4">Mano de Obra</h2>
        <ManoObraTable 
          items={getItemsByCategory('Mano de obra')} 
          onAddItem={addItem} 
          onRemoveItem={removeItem}
          projectId={selectedProjectId}
        />
      </div>
      
      {/* Renderizar una tabla para cada categoría */}
      {categorias.map(categoria => (
        <div key={categoria} className="my-8">
          <h2 className="text-xl font-semibold mb-4">{categoria}</h2>
          <InventarioTable 
            items={getItemsByCategory(categoria)} 
            onAddItem={addItem} 
            onRemoveItem={removeItem}
            categoria={categoria}
            projectId={selectedProjectId}
          />
        </div>
      ))}
      
      {/* Componente para mostrar el total general */}
      <TotalGeneral total={totalGeneral} />
    </main>
  );
}