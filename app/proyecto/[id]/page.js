'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import InventarioTable from '../../components/InventarioTable';
import ManoObraTable from '../../components/ManoObraTable';
import TotalGeneral from '../../components/TotalGeneral';
import Link from 'next/link';

export default function ProyectoPage() {
  const params = useParams();
  const projectId = params.id;
  
  // State for project data and items
  const [projectData, setProjectData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Available categories
  const categorias = ['Equipo', 'Materiales', 'Consumibles', 'Otros'];
  
  // Fetch project data from Notion when component mounts
  useEffect(() => {
    async function fetchProjectData() {
      try {
        setLoading(true);
        // Call your API route to get Notion data
        const response = await fetch(`/api/notion?projectId=${projectId}`);
        const data = await response.json();
        
        if (data.error) {
          console.error('Error fetching project data:', data.error);
          return;
        }
        
        setProjectData(data.projectData);
        
        // Load project-specific inventory from localStorage if exists
        const savedItems = localStorage.getItem(`inventario-items-${projectId}`);
        if (savedItems) {
          setItems(JSON.parse(savedItems));
        }
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
  
  // Save items to localStorage when they change
  useEffect(() => {
    if (projectId && items.length > 0) {
      localStorage.setItem(`inventario-items-${projectId}`, JSON.stringify(items));
    }
  }, [items, projectId]);
  
  // Function to add new item
  function addItem(newItem) {
    setItems([...items, newItem]);
  }
  
  // Function to remove item
  function removeItem(id) {
    setItems(items.filter(item => item.id !== id));
  }
  
  // Filter items by category
  function getItemsByCategory(categoria) {
    return items.filter(item => item.categoria === categoria);
  }
  
  // Calculate total considering multipliers for labor items
  const totalGeneral = items.reduce((sum, item) => {
    if (item.categoria === 'Mano de obra') {
      const multiplicador = item.multiplicador || 1;
      return sum + (item.cantidad * item.costoUnitario * multiplicador);
    }
    return sum + (item.cantidad * item.costoUnitario);
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
      <div className="flex justify-between items-center my-6">
        <Link href="/" className="bg-tertiary hover:bg-opacity-90 text-white py-2 px-4 rounded shadow transition-colors">
          ← Volver al Inventario General
        </Link>
        <h1 className="text-2xl font-bold text-center text-tertiary">Proyecto: {projectId}</h1>
        <div className="w-28"></div> {/* Spacer for alignment */}
      </div>
      
      {/* Project Info Card */}
      {projectData && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <h2 className="text-xl font-semibold p-4 bg-primary text-white border-b">Información del Proyecto</h2>
          <div className="p-4 bg-primary bg-opacity-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-tertiary">ID Proyecto:</p>
                <p>{projectData.id}</p>
              </div>
              <div>
                <p className="font-semibold text-tertiary">Estado:</p>
                <p>{projectData.status}</p>
              </div>
              <div>
                <p className="font-semibold text-tertiary">Responsable:</p>
                <p>{projectData.responsable}</p>
              </div>
              <div>
                <p className="font-semibold text-tertiary">Tipo de Trabajo:</p>
                <p>{projectData.tipoTrabajo}</p>
              </div>
              <div>
                <p className="font-semibold text-tertiary">Fecha Compromiso:</p>
                <p>{projectData.fechaCompromiso}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Labor Section */}
      <div className="my-8">
        <h2 className="text-xl font-semibold mb-4 text-tertiary">Mano de Obra</h2>
        <ManoObraTable 
          items={getItemsByCategory('Mano de obra')} 
          onAddItem={addItem} 
          onRemoveItem={removeItem} 
        />
      </div>
      
      {/* Render a table for each category */}
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
      
      {/* Total Summary Component */}
      <TotalGeneral total={totalGeneral} />
    </main>
  );
}