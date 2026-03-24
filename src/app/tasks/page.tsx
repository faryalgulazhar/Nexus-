import Link from "next/link";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Finish Math Assignment",
    dueDate: "2026-03-25",
    completed: false,
  },
  {
    id: "2",
    title: "Read History Chapter 4",
    dueDate: "2026-03-26",
    completed: true,
  },
  {
    id: "3",
    title: "Prepare Physics Lab Report",
    dueDate: "2026-03-28",
    completed: false,
  },
  {
    id: "4",
    title: "Study for Biology Quiz",
    dueDate: "2026-03-24",
    completed: false,
  },
  {
    id: "5",
    title: "Draft English Essay",
    dueDate: "2026-03-30",
    completed: false,
  },
];

export default function TasksPage() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleTasks.map((task) => (
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
      </div>
    </div>
  );
}
