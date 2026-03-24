import { readFileSync, writeFileSync } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

export const dynamic = 'force-dynamic';

const filePath = path.join(process.cwd(), 'data', 'tasks.json');

export async function GET() {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  return NextResponse.json(data.tasks);
}

export async function POST(request: Request) {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  const newTask = await request.json();
  newTask.id = data.tasks.length + 1;
  data.tasks.push(newTask);
  writeFileSync(filePath, JSON.stringify(data, null, 2));
  return NextResponse.json(newTask, { status: 201 });
}
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  const taskExists = data.tasks.some((t: any) => t.id === parseInt(id));
  
  if (!taskExists) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  data.tasks = data.tasks.filter((t: any) => t.id !== parseInt(id));
  writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  return NextResponse.json({ message: 'Task deleted successfully' });
}
