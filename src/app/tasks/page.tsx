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
          <Link
             href="/"
             className="px-5 py-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            &larr; Back to Home
          </Link>
        </header>

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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex flex-col p-6 rounded-3xl border transition-all duration-300 ${
                  task.completed
                    ? "bg-zinc-100/50 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 opacity-80 shadow-sm"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-black/40 hover:-translate-y-1 hover:shadow-2xl"
                }`}
              >
                <div className="flex justify-between items-start mb-6 gap-3">
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
                
                <div className="mt-auto flex items-center text-sm font-medium text-zinc-500 dark:text-zinc-400 gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-500/70">
                    <path fillRule="evenodd" d="M5.75 2a.75.75 0 011.5 0v1.5h5.5V2a.75.75 0 011.5 0v1.5h5.625c.621 0 1.125.504 1.125 1.125v11.75c0 .621-.504 1.125-1.125 1.125H4.25A1.125 1.125 0 013 15.25V4.625C3 4.004 3.504 3.5 4.125 3.5H5.75V2zM4.5 7v8h15V7h-15z" clipRule="evenodd" />
                  </svg>
                   Due: {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
