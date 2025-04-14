'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchProjects } from '../lib/supabase';

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar proyectos desde Supabase
  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const projectList = await fetchProjects();
        setProjects(projectList);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  // Filtrar proyectos según el término de búsqueda
  const filteredProjects = projects.filter(project => 
    project.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.title && project.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (project.status && project.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (project.responsible && project.responsible.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-tertiary mb-6">Presupuesto de Tickets</h1>
        
        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por ID, título, estado o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        
        {/* Projects list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-tertiary">Tickets activos</h2>
            </div>
            
            {filteredProjects.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredProjects.map(project => (
                  <li key={project.id} className="hover:bg-gray-50">
                    <Link 
                      href={`/proyecto/${project.id}`}
                      className="block p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-tertiary">{project.id}</h3>
                          <p className="text-gray-600">{project.title}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-800">
                            {project.status || 'Sin estado'}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            {project.responsible || 'Sin responsable'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">
                {searchTerm ? 'No se encontraron proyectos con ese criterio de búsqueda.' : 'No hay proyectos registrados.'}
              </div>
            )}
          </div>
        )}
        
        {/* Instructions if no projects */}
        {!loading && projects.length === 0 && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold text-tertiary mb-4">¿Cómo empezar?</h2>
            <p className="mb-4">
              Para comenzar a utilizar la aplicación, necesitas crear un presupuesto para un ticket existente. 
              Simplemente ingresa el ID del ticket en la URL: <code>/proyecto/T-XXXX</code> 
              (donde XXXX es el número de ticket).
            </p>
            <p>
              La aplicación importará automáticamente los datos del ticket desde Notion y te permitirá 
              crear un presupuesto detallado.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}