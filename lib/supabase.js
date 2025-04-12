import { createClient } from '@supabase/supabase-js';

// Crear un cliente de Supabase con URL pública y anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validar que las credenciales existan
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Las variables de entorno de Supabase no están configuradas correctamente.');
}

// Exportar la instancia de Supabase con opciones mejoradas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Funciones de utilidad para interactuar con Supabase

// Catálogo de costos
export async function fetchCatalogItems(category) {
  try {
    let query = supabase.from('catalog_items').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query.order('description');
    
    if (error) {
      console.error('Error al obtener catálogo:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Error inesperado al obtener catálogo:', err);
    return [];
  }
}

export async function addCatalogItem(item) {
  try {
    // Asegurarse de que todos los campos requeridos estén presentes
    if (!item.category || !item.description || !item.unit) {
      console.error('Campos obligatorios faltantes');
      return null;
    }

    const { data, error } = await supabase
      .from('catalog_items')
      .insert([item])
      .select();
      
    if (error) {
      console.error('Error al agregar al catálogo:', error);
      return null;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Error inesperado al agregar catálogo:', err);
    return null;
  }
}

// Proyectos
export async function fetchProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error al obtener proyectos:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Error inesperado al obtener proyectos:', err);
    return [];
  }
}

export async function fetchProjectById(id) {
  try {
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
  } catch (err) {
    console.error(`Error inesperado al obtener proyecto ${id}:`, err);
    return null;
  }
}

export async function upsertProject(project) {
  try {
    // Verificar que el proyecto tenga un ID
    if (!project.id) {
      console.error('El proyecto debe tener un ID');
      return null;
    }

    // Añadir la fecha de actualización
    const projectWithTimestamp = {
      ...project,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('projects')
      .upsert([projectWithTimestamp])
      .select();
      
    if (error) {
      console.error('Error al guardar proyecto:', error);
      return null;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Error inesperado al guardar proyecto:', err);
    return null;
  }
}

// Items de inventario
export async function fetchInventoryItems(projectId, category) {
  try {
    if (!projectId) {
      console.error('Se requiere projectId para obtener items');
      return [];
    }

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
    
    return data || [];
  } catch (err) {
    console.error(`Error inesperado al obtener items para proyecto ${projectId}:`, err);
    return [];
  }
}

export async function addInventoryItem(item) {
  try {
    // Validar campos obligatorios
    if (!item.project_id || !item.description || !item.category) {
      console.error('Faltan campos obligatorios para el item de inventario');
      return null;
    }

    // Asegurarse de que quantity y unit_cost sean números
    const itemToAdd = {
      ...item,
      quantity: parseFloat(item.quantity) || 0,
      unit_cost: parseFloat(item.unit_cost) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([itemToAdd])
      .select();
      
    if (error) {
      console.error('Error al agregar item al inventario:', error);
      return null;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Error inesperado al agregar item al inventario:', err);
    return null;
  }
}

export async function updateInventoryItem(id, updates) {
  try {
    if (!id) {
      console.error('Se requiere ID para actualizar item');
      return null;
    }

    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updatesWithTimestamp)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error(`Error al actualizar item ${id}:`, error);
      return null;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error(`Error inesperado al actualizar item ${id}:`, err);
    return null;
  }
}

export async function deleteInventoryItem(id) {
  try {
    if (!id) {
      console.error('Se requiere ID para eliminar item');
      return false;
    }
    
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Error al eliminar item ${id}:`, error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`Error inesperado al eliminar item ${id}:`, err);
    return false;
  }
}