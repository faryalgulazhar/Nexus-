import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950 p-6">
      <main className="flex w-full max-w-3xl flex-col items-center justify-center text-center gap-8 py-16 px-8 bg-white dark:bg-zinc-900 shadow-2xl rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 pb-2">
            Welcome to StudyPlanner
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
            Your all-in-one companion for academic success. Organize your assignments, track your progress, and stay on top of your coursework with ease.
          </p>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-4 w-full justify-center">
        </div>
      </main>
    </div>
  );
}
