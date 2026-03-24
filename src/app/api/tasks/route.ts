import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

const dataDir = path.join(process.cwd(), 'data');
const filePath = path.join(dataDir, 'tasks.json');
const TASKS_KEY = 'tasks_data'; // Key for Vercel KV

// Check if we should use Vercel KV (production/Vercel) or FS (local)
const useKV = !!process.env.KV_REST_API_URL;

// Helper to ensure data file and directory exist (for local FS)
function ensureDataFile() {
  if (!useKV) {
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    if (!existsSync(filePath)) {
      const initialData = { tasks: [] };
      writeFileSync(filePath, JSON.stringify(initialData, null, 2));
    }
  }
}

export async function GET() {
  try {
    if (useKV) {
      const tasks = await kv.get<any[]>(TASKS_KEY);
      return NextResponse.json(tasks || []);
    }
    
    // Fallback to local FS
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
    const newTask = await request.json();
    
    if (useKV) {
      const existingTasks = (await kv.get<any[]>(TASKS_KEY)) || [];
      const maxId = existingTasks.reduce((max: number, task: any) => Math.max(max, Number(task.id) || 0), 0);
      newTask.id = maxId + 1;
      existingTasks.push(newTask);
      await kv.set(TASKS_KEY, existingTasks);
      return NextResponse.json(newTask, { status: 201 });
    }

    // Fallback to local FS
    ensureDataFile();
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const taskId = parseInt(id);

    if (useKV) {
      const existingTasks = (await kv.get<any[]>(TASKS_KEY)) || [];
      if (!existingTasks.some((t: any) => t.id === taskId)) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      const updatedTasks = existingTasks.filter((t: any) => t.id !== taskId);
      await kv.set(TASKS_KEY, updatedTasks);
      return NextResponse.json({ message: 'Task deleted successfully' });
    }

    // Fallback to local FS
    ensureDataFile();
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
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

export async function PATCH(request: Request) {
  try {
    const { id, completed } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const taskId = parseInt(id.toString());

    if (useKV) {
      const existingTasks = (await kv.get<any[]>(TASKS_KEY)) || [];
      const taskIndex = existingTasks.findIndex((t: any) => t.id === taskId);
      
      if (taskIndex === -1) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      
      existingTasks[taskIndex].completed = completed;
      await kv.set(TASKS_KEY, existingTasks);
      return NextResponse.json({ message: 'Task updated successfully' });
    }

    // Fallback to local FS
    ensureDataFile();
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    const existingTasks = data.tasks || [];
    const taskIndex = existingTasks.findIndex((t: any) => t.id === taskId);
    
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    existingTasks[taskIndex].completed = completed;
    data.tasks = existingTasks;
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    return NextResponse.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('API PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
