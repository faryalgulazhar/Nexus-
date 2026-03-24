import { readFileSync, writeFileSync, existsSync } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

export const dynamic = 'force-dynamic';

const filePath = path.join(process.cwd(), 'data', 'tasks.json');

// Helper to ensure data file exists
function ensureDataFile() {
  if (!existsSync(filePath)) {
    const initialData = { tasks: [] };
    writeFileSync(filePath, JSON.stringify(initialData, null, 2));
  }
}

export async function GET() {
  try {
    ensureDataFile();
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    return NextResponse.json(data.tasks || []);
  } catch (error) {
    console.error('API GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    ensureDataFile();
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    const newTask = await request.json();
    
    // Robust ID generation
    const existingTasks = data.tasks || [];
    const maxId = existingTasks.reduce((max: number, task: any) => Math.max(max, Number(task.id) || 0), 0);
    newTask.id = maxId + 1;
    
    existingTasks.push(newTask);
    data.tasks = existingTasks;
    
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('API POST Error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    ensureDataFile();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    const taskId = parseInt(id);
    const existingTasks = data.tasks || [];
    
    if (!existingTasks.some((t: any) => t.id === taskId)) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    data.tasks = existingTasks.filter((t: any) => t.id !== taskId);
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('API DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
