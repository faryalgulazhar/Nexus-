import { NextResponse } from 'next/server';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, 'tasks'));
    const tasks = querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      return {
        ...data,
        id: Number(docSnapshot.id) || data.id // Ensure frontend receives numerical ID
      };
    });
    
    // Sort tasks logically by ID to maintain historical local order behavior
    tasks.sort((a, b) => a.id - b.id);
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('API GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newTask = await request.json();
    
    const querySnapshot = await getDocs(collection(db, 'tasks'));
    const maxId = querySnapshot.docs.reduce((max: number, d) => Math.max(max, Number(d.id) || Number(d.data().id) || 0), 0);
    
    newTask.id = maxId + 1;
    
    // Use numeric strictness for the ID to avoid breaking /tasks/page.tsx
    await setDoc(doc(db, 'tasks', newTask.id.toString()), newTask);
    
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

    await deleteDoc(doc(db, 'tasks', id));
    
    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('API DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, completed } = await request.json();
    
    if (id === undefined || id === null) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const taskRef = doc(db, 'tasks', id.toString());
    await updateDoc(taskRef, { completed });
    
    return NextResponse.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('API PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
