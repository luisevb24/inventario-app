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
    // Validate required fields
    if (!item.project_id || !item.description || !item.category) {
      console.error('Faltan campos obligatorios para el item de inventario');
      return null;
    }

    // Ensure numeric fields are converted correctly
    const itemToAdd = {
      ...item,
      quantity: parseFloat(item.quantity) || 0,
      unit_cost: parseFloat(item.unit_cost) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Debug: log the object to be inserted
    console.log('Insertando item al inventario:', itemToAdd);

    // Insert with explicit selection of all columns
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([itemToAdd])
      .select('*');

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
// Add these functions to your lib/supabase.js file

// Fetch all unit costs
export async function fetchUnitCosts(isLaborUnit = null) {
  try {
    let query = supabase.from('unit_costs').select('*');
    
    // Filter by labor unit if specified
    if (isLaborUnit !== null) {
      query = query.eq('is_labor_unit', isLaborUnit);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      console.error('Error fetching unit costs:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching unit costs:', err);
    return [];
  }
}

// Add a new unit cost
export async function addUnitCost(unitCost) {
  try {
    // Ensure required fields are present
    if (!unitCost.name || !unitCost.code) {
      console.error('Required fields missing');
      return null;
    }

    const { data, error } = await supabase
      .from('unit_costs')
      .insert([{
        ...unitCost,
        updated_at: new Date().toISOString()
      }])
      .select();
      
    if (error) {
      console.error('Error adding unit cost:', error);
      return null;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Unexpected error adding unit cost:', err);
    return null;
  }
}

// Update an existing unit cost
export async function updateUnitCost(id, updates) {
  try {
    if (!id) {
      console.error('ID is required to update unit cost');
      return null;
    }

    const { data, error } = await supabase
      .from('unit_costs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('Error updating unit cost:', error);
      return null;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Unexpected error updating unit cost:', err);
    return null;
  }
}

// Delete a unit cost
export async function deleteUnitCost(id) {
  try {
    if (!id) {
      console.error('ID is required to delete unit cost');
      return false;
    }
    
    const { error } = await supabase
      .from('unit_costs')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting unit cost:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error deleting unit cost:', err);
    return false;
  }
}

// Add this function to your lib/supabase.js file

/**
 * Updates catalog items to reference the appropriate unit costs
 * Useful when implementing the unit costs feature to existing catalog items
 */
export async function syncCatalogWithUnitCosts() {
  try {
    // First, get all unit costs
    const { data: unitCosts, error: unitCostsError } = await supabase
      .from('unit_costs')
      .select('id, name');
    
    if (unitCostsError) {
      console.error('Error fetching unit costs:', unitCostsError);
      return { success: false, message: 'Error fetching unit costs' };
    }
    
    // Create a map of unit names to their IDs
    const unitCostMap = {};
    unitCosts.forEach(unit => {
      unitCostMap[unit.name.toLowerCase()] = unit.id;
    });
    
    // Get all catalog items
    const { data: catalogItems, error: catalogError } = await supabase
      .from('catalog_items')
      .select('id, unit');
    
    if (catalogError) {
      console.error('Error fetching catalog items:', catalogError);
      return { success: false, message: 'Error fetching catalog items' };
    }
    
    // Update catalog items with matching unit costs
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const item of catalogItems) {
      if (item.unit && unitCostMap[item.unit.toLowerCase()]) {
        const { error } = await supabase
          .from('catalog_items')
          .update({ unit_cost_id: unitCostMap[item.unit.toLowerCase()] })
          .eq('id', item.id);
        
        if (error) {
          console.error(`Error updating catalog item ${item.id}:`, error);
          errorCount++;
        } else {
          updatedCount++;
        }
      }
    }
    
    return { 
      success: true, 
      message: `Updated ${updatedCount} catalog items, ${errorCount} errors` 
    };
  } catch (error) {
    console.error('Error syncing catalog with unit costs:', error);
    return { success: false, message: 'Unexpected error during sync' };
  }
}