'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import InventarioTable from '../../components/InventarioTable';
import ManoObraTable from '../../components/ManoObraTable';
import TotalGeneral from '../../components/TotalGeneral';
import { 
  fetchProjectById,
  fetchInventoryItems,
  addInventoryItem,
  deleteInventoryItem,
  upsertProject
} from '../../../lib/supabase';

export default function ProyectoPage() {
  const params = useParams();
  const projectId = params.id;
  
  // State for project data and items
  const [projectData, setProjectData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Available categories
  const categorias = ['Equipo', 'Materiales', 'Consumibles', 'Otros'];
  
  // Cargar datos del proyecto desde Supabase
  useEffect(() => {
    async function fetchProjectData() {
      try {
        setLoading(true);
        
        // Obtener información del proyecto
        const project = await fetchProjectById(projectId);
        
        if (project) {
          setProjectData(project);
        } else {
          // Si el proyecto no existe en Supabase pero sí en Notion
          // Lo primero es obtener datos de Notion
          try {
            const response = await fetch(`/api/notion?projectId=${projectId}`);
            const data = await response.json();
            
            if (data.error) {
              console.error('Error fetching project data from Notion:', data.error);
              return;
            }
            
            // Crear el proyecto en Supabase
            const notionData = data.projectData;
            const newProject = {
              id: projectId,
              title: notionData.id,
              status: notionData.status,
              responsible: notionData.responsable,
              work_type: notionData.tipoTrabajo,
              commitment_date: notionData.fechaCompromiso
            };
            
            const createdProject = await upsertProject(newProject);
            if (createdProject) {
              setProjectData(createdProject);
            } else {
              setProjectData(newProject);
            }
          } catch (error) {
            console.error('Error creating project from Notion data:', error);
          }
        }
        
        // Obtener los items del inventario
        const inventoryItems = await fetchInventoryItems(projectId);
        setItems(inventoryItems);
        
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);
  
  // Función para agregar un nuevo item
  async function addItem(newItem) {
    try {
      const addedItem = await addInventoryItem(newItem);
      if (addedItem) {
        setItems([...items, addedItem]);
      }
    } catch (error) {
      console.error('Error al agregar item:', error);
    }
  }
  
  // Función para eliminar un item
  async function removeItem(id) {
    try {
      const success = await deleteInventoryItem(id);
      if (success) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error al eliminar item:', error);
    }
  }
  
  // Filtrar items por categoría
  function getItemsByCategory(categoria) {
    return items.filter(item => item.category === categoria);
  }
  
  // Calcular total considerando multiplicadores para items de mano de obra
  const totalGeneral = items.reduce((sum, item) => {
    if (item.category === 'Mano de obra') {
      const multiplicador = item.multiplier || 1;
      return sum + (item.quantity * item.unit_cost * multiplicador);
    }
    return sum + (item.quantity * item.unit_cost);
  }, 0);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="bg-tertiary hover:bg-tertiary/90 text-white py-2 px-4 rounded transition-colors">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold text-center">{projectId}</h1>
        <div className="w-28"></div> {/* Spacer for alignment */}
      </div>
      
      {/* Project Info Card */}
      {projectData && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-tertiary">Información del Ticket</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">ID:</p>
                <p>{projectData.id}</p>
              </div>
              <div>
                <p className="font-semibold">Estado:</p>
                <p>{projectData.status}</p>
              </div>
              <div>
                <p className="font-semibold">Responsable:</p>
                <p>{projectData.responsible}</p>
              </div>
              <div>
                <p className="font-semibold">Tipo de Trabajo:</p>
                <p>{projectData.work_type}</p>
              </div>
              <div>
                <p className="font-semibold">Fecha Compromiso:</p>
                <p>{projectData.commitment_date && new Date(projectData.commitment_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Labor Section */}
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-2">Mano de Obra</h2>
        <ManoObraTable 
          items={getItemsByCategory('Mano de obra')} 
          onAddItem={addItem} 
          onRemoveItem={removeItem}
          projectId={projectId}
        />
      </div>
      
      {/* Render a table for each category */}
      {categorias.map(categoria => (
        <div key={categoria} className="my-6">
          <h2 className="text-xl font-semibold mb-2">{categoria}</h2>
          <InventarioTable 
            items={getItemsByCategory(categoria)} 
            onAddItem={addItem} 
            onRemoveItem={removeItem}
            categoria={categoria}
            projectId={projectId}
          />
        </div>
      ))}
      
      {/* Total Summary Component */}
      <TotalGeneral total={totalGeneral} />
    </main>
  );
}