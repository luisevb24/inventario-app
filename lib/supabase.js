import { createClient } from '@supabase/supabase-js';

// Crear un cliente de Supabase con URL pública y anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validar que las credenciales existan
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Las variables de entorno de Supabase no están configuradas correctamente.');
}

// Exportar la instancia de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funciones de utilidad para interactuar con Supabase

// Catálogo de costos
export async function fetchCatalogItems(category) {
  let query = supabase.from('catalog_items').select('*');
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query.order('description');
  
  if (error) {
    console.error('Error al obtener catálogo:', error);
    return [];
  }
  
  return data;
}

export async function addCatalogItem(item) {
  const { data, error } = await supabase
    .from('catalog_items')
    .insert([item])
    .select();
    
  if (error) {
    console.error('Error al agregar al catálogo:', error);
    return null;
  }
  
  return data[0];
}

// Proyectos
export async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error al obtener proyectos:', error);
    return [];
  }
  
  return data;
}

export async function fetchProjectById(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error(`Error al obtener proyecto ${id}:`, error);
    return null;
  }
  
  return data;
}

export async function upsertProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .upsert([{
      ...project,
      updated_at: new Date().toISOString()
    }])
    .select();
    
  if (error) {
    console.error('Error al guardar proyecto:', error);
    return null;
  }
  
  return data[0];
}

// Items de inventario
export async function fetchInventoryItems(projectId, category) {
  let query = supabase
    .from('inventory_items')
    .select('*')
    .eq('project_id', projectId);
    
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query.order('created_at');
  
  if (error) {
    console.error(`Error al obtener items para proyecto ${projectId}:`, error);
    return [];
  }
  
  return data;
}

export async function addInventoryItem(item) {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert([{
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select();
    
  if (error) {
    console.error('Error al agregar item al inventario:', error);
    return null;
  }
  
  return data[0];
}

export async function updateInventoryItem(id, updates) {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();
    
  if (error) {
    console.error(`Error al actualizar item ${id}:`, error);
    return null;
  }
  
  return data[0];
}

export async function deleteInventoryItem(id) {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Error al eliminar item ${id}:`, error);
    return false;
  }
  
  return true;
}