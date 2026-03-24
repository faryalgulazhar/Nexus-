'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8:00 to 18:00
const HOUR_HEIGHT = 80;

const EVENT_COLORS = {
  class: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800/80',
  study: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-800/80',
  'group-project': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800/80',
  free: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800/80',
};

interface EventData {
  id: string;
  userId: string;
  userName: string;
  title: string;
  day: string;
  startHour: number;
  endHour: number;
  color: string;
  type: 'class' | 'study' | 'group-project' | 'free';
}

export default function PlanningPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  
  const [events, setEvents] = useState<EventData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(DAYS[0]);
  const [selectedStartHour, setSelectedStartHour] = useState<number>(8);
  const [selectedEndHour, setSelectedEndHour] = useState<number>(9);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<keyof typeof EVENT_COLORS>('class');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Real-time Firestore sync
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'schools/my-school/events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEvents: EventData[] = [];
      snapshot.forEach((docSnap) => {
        fetchedEvents.push({ id: docSnap.id, ...docSnap.data() } as EventData);
      });
      setEvents(fetchedEvents);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] text-[var(--text-primary)]">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
           <p className="animate-pulse font-medium text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }

  const handleCellClick = (day: string, hour: number) => {
    setModalMode('create');
    setEditEventId(null);
    setSelectedDay(day);
    setSelectedStartHour(hour);
    setSelectedEndHour(hour + 1);
    setEventTitle('');
    setEventType('class');
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, ev: EventData) => {
    e.stopPropagation();
    setModalMode('edit');
    setEditEventId(ev.id);
    setSelectedDay(ev.day);
    setSelectedStartHour(ev.startHour);
    setSelectedEndHour(ev.endHour);
    setEventTitle(ev.title);
    setEventType(ev.type);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this event?')) return;
    try {
      await deleteDoc(doc(db, 'schools/my-school/events', id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete event. It may have already been removed.');
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEndHour <= selectedStartHour) {
      alert("End hour must be after the start hour!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const eventData = {
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        title: eventTitle,
        day: selectedDay,
        startHour: selectedStartHour,
        endHour: selectedEndHour,
        type: eventType,
      };

      if (modalMode === 'create') {
        await addDoc(collection(db, 'schools/my-school/events'), eventData);
      } else if (modalMode === 'edit' && editEventId) {
        await updateDoc(doc(db, 'schools/my-school/events', editEventId), eventData);
      }
      
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to sync event with Firestore database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] p-6 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)]">
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Interactive Schedule
            </h1>
            <p className="text-[var(--text-secondary)] text-sm font-medium mt-1">
              Synchronizing continuously with your classmates.
            </p>
          </div>
          <button 
            onClick={signOut}
            className="mt-4 sm:mt-0 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-transparent dark:border-red-800/30 rounded-xl font-bold transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Calendar Grid Wrapper */}
        <div className="flex bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden shadow-sm">
          
          {/* Timeline Y-Axis */}
          <div className="w-16 sm:w-20 shrink-0 border-r border-[var(--border-color)] bg-zinc-50 dark:bg-[#1f2937]/50">
            <div className="h-12 border-b border-[var(--border-color)]"></div>
            {HOURS.map(h => (
              <div key={h} className="text-[10px] sm:text-xs text-right pr-2 sm:pr-3 font-semibold text-[var(--text-secondary)] border-b border-[var(--border-color)]" style={{ height: `${HOUR_HEIGHT}px` }}>
                <span className="relative -top-2.5 bg-zinc-50 dark:bg-[#1f2937]/80 px-1 rounded-sm">{h}:00</span>
              </div>
            ))}
          </div>

          {/* Days X-Axis Columns */}
          <div className="flex-1 grid grid-cols-5 divide-x divide-[var(--border-color)] overflow-x-auto min-w-[500px]">
            {DAYS.map(day => (
              <div key={day} className="flex flex-col min-w-[100px]">
                {/* Day Header */}
                <div className="h-12 flex items-center justify-center font-bold text-xs sm:text-sm text-[var(--text-primary)] border-b border-[var(--border-color)] bg-zinc-50 dark:bg-[#1f2937]/50">
                  {day.slice(0, 3).toUpperCase()}
                </div>
                
                {/* Hourly Cells & Placed Events */}
                <div className="relative" style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}>
                  {/* Clickable Background Grid Lines */}
                  {HOURS.map(h => (
                    <div 
                      key={`${day}-${h}`} 
                      onClick={() => handleCellClick(day, h)}
                      className="absolute w-full border-b border-[var(--border-color)]/50 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
                      style={{ top: `${(h - 8) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                    ></div>
                  ))}

                  {/* Positioned Events */}
                  {events.filter(e => e.day === day).map(ev => {
                     const top = (ev.startHour - 8) * HOUR_HEIGHT;
                     const height = (ev.endHour - ev.startHour) * HOUR_HEIGHT;
                     const isOwner = ev.userId === user.uid;

                     return (
                       <div
                         key={ev.id}
                         className={`absolute left-0 right-0 m-1 md:m-1.5 p-1.5 md:p-2 border rounded-lg shadow-sm flex flex-col gap-1 overflow-hidden transition-all ${EVENT_COLORS[ev.type]} ${isOwner ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[var(--bg-card)] z-10' : 'z-0 opacity-85 hover:opacity-100'}`}
                         style={{ top: `${top}px`, height: `${height - 8}px` }}
                       >
                         <div className="flex justify-between items-start">
                           <span className="font-extrabold text-[10px] sm:text-xs leading-tight line-clamp-2 pr-1">{ev.title}</span>
                           {isOwner && (
                             <div className="flex gap-1 shrink-0 bg-white/60 dark:bg-black/30 rounded p-1 backdrop-blur-sm shadow-sm">
                               <button onClick={(e) => handleEditClick(e, ev)} className="text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 transition-all">
                                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                               </button>
                               <button onClick={(e) => handleDelete(e, ev.id)} className="text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:scale-110 transition-all">
                                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                               </button>
                             </div>
                           )}
                         </div>
                         <span className="text-[9px] sm:text-[10px] font-bold opacity-75 mt-auto truncate">{ev.userName}</span>
                       </div>
                     )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 dark:bg-black/70 backdrop-blur-sm">
           <div className="bg-[var(--bg-card)] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-[var(--border-color)] animate-in fade-in zoom-in-95 duration-200">
             <div className="px-6 py-5 border-b border-[var(--border-color)] flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/20">
               <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                 {modalMode === 'create' ? 'Schedule Event' : 'Modify Event'}
               </h2>
               <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-2xl font-light leading-none">&times;</button>
             </div>
             
             <form onSubmit={handleModalSubmit} className="p-6 flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">Title</label>
                  <input 
                    required 
                    value={eventTitle} 
                    onChange={e => setEventTitle(e.target.value)} 
                    placeholder="E.g. Advanced Physics"
                    className="w-full px-4 py-3 border border-[var(--border-color)] bg-[var(--bg-page)] rounded-xl text-[var(--text-primary)] font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">Type Profile</label>
                  <select 
                    required 
                    value={eventType} 
                    onChange={e => setEventType(e.target.value as any)} 
                    className="w-full px-4 py-3 border border-[var(--border-color)] bg-[var(--bg-page)] rounded-xl text-[var(--text-primary)] font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                  >
                    <option value="class">Class Session (Purple)</option>
                    <option value="study">Study Block (Cyan)</option>
                    <option value="group-project">Group Collaboration (Emerald)</option>
                    <option value="free">Free Time (Amber)</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">Start Info</label>
                     <select 
                        value={selectedStartHour} 
                        onChange={e => setSelectedStartHour(Number(e.target.value))} 
                        className="w-full px-4 py-3 border border-[var(--border-color)] bg-[var(--bg-page)] rounded-xl text-[var(--text-primary)] font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                     >
                       {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">End Info</label>
                     <select 
                       value={selectedEndHour} 
                       onChange={e => setSelectedEndHour(Number(e.target.value))} 
                       className="w-full px-4 py-3 border border-[var(--border-color)] bg-[var(--bg-page)] rounded-xl text-[var(--text-primary)] font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                     >
                       {HOURS.map(h => <option key={h+1} value={h+1}>{h+1}:00</option>)}
                     </select>
                   </div>
                </div>
                
                <div className="mt-6 flex gap-3 pt-2 border-t border-[var(--border-color)]">
                   <button 
                     type="button" 
                     onClick={() => setIsModalOpen(false)} 
                     className="flex-1 py-3 rounded-xl text-zinc-600 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     disabled={isSubmitting} 
                     className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50 shadow-md shadow-indigo-500/20"
                   >
                     {isSubmitting ? 'Syncing...' : 'Save Block'}
                   </button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}
