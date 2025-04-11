import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// The ID of your Notion database
const databaseId = process.env.NOTION_DATABASE_ID;

export async function GET() {
  try {
    // Get database metadata
    const database = await notion.databases.retrieve({
      database_id: databaseId,
    });
    
    // Extract property information
    const propertyInfo = {};
    
    Object.entries(database.properties).forEach(([name, property]) => {
      propertyInfo[name] = {
        type: property.type,
        id: property.id
      };
      
      // Add specific details based on property type
      if (property.type === 'formula') {
        propertyInfo[name].formula_type = property.formula.type;
      }
    });
    
    // Query first few records for example data
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 1,
    });
    
    let sampleRecord = null;
    if (response.results.length > 0) {
      const page = response.results[0];
      sampleRecord = {
        id: page.id,
        properties: {}
      };
      
      // Extract property values for sample record
      Object.entries(page.properties).forEach(([name, property]) => {
        sampleRecord.properties[name] = {
          type: property.type,
          // Include a string representation of the value
          value: JSON.stringify(property)
        };
      });
    }
    
    return NextResponse.json({
      success: true,
      database: {
        id: database.id,
        title: database.title,
        properties: propertyInfo
      },
      sampleRecord
    });
  } catch (error) {
    console.error('Error debugging Notion database:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}