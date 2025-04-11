import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// The ID of your Notion database
const databaseId = process.env.NOTION_DATABASE_ID;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }
  
  try {
    // Query the Notion database for the specific project using title property
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Ticket ', // La propiedad se llama "Ticket " (con espacio al final)
        title: {
          equals: projectId // Buscar el ID exacto (ej. T-1895)
        }
      },
    });
    
    // If project not found
    if (response.results.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const page = response.results[0];
    
    // Extract relevant properties
    const projectData = {
      id: projectId,
      // Obtener propiedades específicas
      responsable: extractPropertyValue(page.properties["Responsable"]),
      tipoTrabajo: extractPropertyValue(page.properties["Tipo de trabajo"]),
      fechaCompromiso: extractPropertyValue(page.properties["Fecha Compromiso Cotización"]),
      // Otras propiedades relevantes si existen
      status: extractPropertyValue(page.properties["Status"])
    };
    
    return NextResponse.json({ projectData });
  } catch (error) {
    console.error('Error querying Notion:', error);
    return NextResponse.json({ error: 'Failed to fetch project data from Notion' }, { status: 500 });
  }
}

// Helper function to extract property values based on property type
function extractPropertyValue(property) {
  if (!property) return '';
  
  switch (property.type) {
    case 'title':
      return property.title.map(text => text.plain_text).join('');
    case 'rich_text':
      return property.rich_text.map(text => text.plain_text).join('');
    case 'select':
      return property.select?.name || '';
    case 'date':
      return property.date?.start || '';
    case 'status':
      return property.status?.name || '';
    case 'multi_select':
      return property.multi_select.map(select => select.name).join(', ');
    case 'number':
      return property.number?.toString() || '';
    case 'checkbox':
      return property.checkbox ? 'Sí' : 'No';
    case 'formula':
      if (property.formula.type === 'string') return property.formula.string || '';
      if (property.formula.type === 'number') return property.formula.number?.toString() || '';
      if (property.formula.type === 'boolean') return property.formula.boolean ? 'Sí' : 'No';
      if (property.formula.type === 'date') return property.formula.date?.start || '';
      return '';
    default:
      return '';
  }
}