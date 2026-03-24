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
