import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// The path to data/tasks.json in the project root
const dataFilePath = path.join(process.cwd(), 'data', 'tasks.json');

export async function GET() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      // Ensure the directory exists
      const dir = path.dirname(dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return NextResponse.json({ tasks: [] }, { status: 200 });
    }

    const fileBuffer = fs.readFileSync(dataFilePath, 'utf-8');
    const data = JSON.parse(fileBuffer);
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error reading tasks:', error);
    return NextResponse.json(
      { error: 'Failed to read tasks data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const newTask = await request.json();
    
    let data: { tasks: any[] } = { tasks: [] };
    
    // Check if directory exists, if not create it
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Read existing file if it exists
    if (fs.existsSync(dataFilePath)) {
      const fileBuffer = fs.readFileSync(dataFilePath, 'utf-8');
      data = JSON.parse(fileBuffer);
    }
    
    // Assign a new ID
    const newId = data.tasks && data.tasks.length > 0 
      ? Math.max(...data.tasks.map((t: any) => t.id || 0)) + 1 
      : 1;
      
    const taskToAdd = {
      ...newTask,
      id: newId
    };
    
    if (!data.tasks) {
      data.tasks = [];
    }
    data.tasks.push(taskToAdd);
    
    // Write the updated tasks array back into the JSON file
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    
    return NextResponse.json(
      { message: 'Task added successfully', task: taskToAdd },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving new task:', error);
    return NextResponse.json(
      { error: 'Failed to save new task' },
      { status: 500 }
    );
  }
}
