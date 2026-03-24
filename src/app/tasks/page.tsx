'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

interface Task {
  id: number;
  title: string;
  dueDate: string;
  subject?: string;
  priority?: string;
  completed: boolean;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSortedByDate, setIsSortedByDate] = useState(false);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        setTasks(data || []);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Update local state immediately
        setTasks(tasks.filter(task => task.id !== id));
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the task');
    }
  };

  const handleToggleComplete = async (taskId: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, completed: !currentStatus })
      });

      if (res.ok) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, completed: !currentStatus } : task
        ));
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('An error occurred while updating the task');
    }
  };

  let filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isSortedByDate) {
    filteredTasks = [...filteredTasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              My Tasks
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg">
              Stay on top of your coursework and deadlines.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/tasks/new"
              className="px-5 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20 shadow-lg"
            >
              + Add Task
            </Link>
          </div>
        </header>

        <div className="mb-8 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg 
              className="h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-zinc-50 dark:placeholder-zinc-500 text-lg"
          />
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsSortedByDate(!isSortedByDate)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border shadow-sm ${
              isSortedByDate 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50' 
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            {isSortedByDate ? 'Original Order' : 'Sort by Date'}
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200/50 dark:border-indigo-900/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 dark:border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-6 text-zinc-500 dark:text-zinc-400 font-medium animate-pulse">
              Loading your tasks...
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">No tasks found</h3>
            <p className="text-zinc-500 mt-2 max-w-sm text-center">Your schedule is clear! Add a new task to get started.</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">No matches found</h3>
            <p className="text-zinc-500 mt-2 max-w-sm text-center">No tasks matching "{searchTerm}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`group relative flex flex-col p-6 rounded-3xl border transition-all duration-300 ${
                  task.completed
                    ? "bg-zinc-100/50 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 opacity-80 shadow-sm"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-black/40 hover:-translate-y-1 hover:shadow-2xl"
                }`}
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(task.id)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Delete task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>

                <div className="flex justify-between items-start mb-6 gap-3 pr-8">
                  <h3 className={`font-semibold text-xl line-clamp-2 ${task.completed ? "text-zinc-500 line-through dark:text-zinc-500" : "text-zinc-900 dark:text-zinc-50"}`}>
                    {task.title}
                  </h3>
                  <span
                     className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border tracking-wide uppercase ${
                      task.completed
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
                        : "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50"
                     }`}
                  >
                    {task.completed ? "Done" : "Pending"}
                  </span>
                </div>
                
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center text-sm font-medium text-zinc-500 dark:text-zinc-400 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-500/70">
                      <path fillRule="evenodd" d="M5.75 2a.75.75 0 011.5 0v1.5h5.5V2a.75.75 0 011.5 0v1.5h5.625c.621 0 1.125.504 1.125 1.125v11.75c0 .621-.504 1.125-1.125 1.125H4.25A1.125 1.125 0 013 15.25V4.625C3 4.004 3.504 3.5 4.125 3.5H5.75V2zM4.5 7v8h15V7h-15z" clipRule="evenodd" />
                    </svg>
                    Due: {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <button
                    onClick={() => handleToggleComplete(task.id, task.completed)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      task.completed 
                        ? 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-700' 
                        : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50 dark:hover:bg-indigo-900/50'
                    }`}
                  >
                    {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
}
      </div>
    </div>
  );
}
