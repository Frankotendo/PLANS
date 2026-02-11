import React, { useEffect, useState } from 'react';
import { DailyPlan, UserProfile, ScheduleItem } from '../types';
import { generateDailySchedule } from '../services/geminiService';
import { addXP } from '../services/gamification';
import { Calendar, CheckCircle2, Coffee, Dumbbell, Laptop, Briefcase, Moon, Sun, RefreshCw, ChevronLeft, ChevronRight, CheckSquare, Square, Bell, Download, Clock, Play, XCircle, Timer } from 'lucide-react';
import { format, addDays, subDays, isSameDay, addMinutes } from 'date-fns';

interface ScheduleViewProps {
  userProfile: UserProfile;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ userProfile }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminders, setReminders] = useState<Set<string>>(new Set());
  
  // Focus Mode State
  const [activeTask, setActiveTask] = useState<ScheduleItem | null>(null);
  const [focusTime, setFocusTime] = useState(0); // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Check initial notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setFocusTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Reminder Interval
  useEffect(() => {
    if (!notificationsEnabled || !plan) return;
    const checkReminders = () => {
      const now = new Date();
      plan.schedule.forEach(item => {
        const id = `${item.time}-${item.activity}`;
        if (!reminders.has(id)) return; 
        if (!isSameDay(currentDate, now)) return;
        const timeParts = item.time.match(/(\d{1,2}):(\d{2})/);
        if (timeParts) {
            const [_, h, m] = timeParts;
            const itemTime = new Date(now);
            itemTime.setHours(parseInt(h), parseInt(m), 0);
            const notifyTime = addMinutes(itemTime, -5);
            if (now.getHours() === notifyTime.getHours() && now.getMinutes() === notifyTime.getMinutes()) {
                new Notification(`Upcoming: ${item.activity}`, {
                    body: `Starting in 5 minutes: ${item.description}`,
                    icon: '/favicon.ico'
                });
            }
        }
      });
    };
    const interval = setInterval(checkReminders, 60000); 
    return () => clearInterval(interval);
  }, [plan, reminders, notificationsEnabled, currentDate]);


  // Load schedule
  useEffect(() => {
    fetchSchedule(currentDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  // Load/Save completed items & reminders
  useEffect(() => {
    const key = `geoLevelUp_done_${format(currentDate, 'yyyy-MM-dd')}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setCompletedItems(new Set(JSON.parse(saved)));
      } catch (e) {
        setCompletedItems(new Set());
      }
    } else {
      setCompletedItems(new Set());
    }
    const reminderKey = `geoLevelUp_reminders_${format(currentDate, 'yyyy-MM-dd')}`;
    const savedReminders = localStorage.getItem(reminderKey);
    if (savedReminders) setReminders(new Set(JSON.parse(savedReminders)));
  }, [currentDate]);

  useEffect(() => {
    const key = `geoLevelUp_done_${format(currentDate, 'yyyy-MM-dd')}`;
    localStorage.setItem(key, JSON.stringify(Array.from(completedItems)));
  }, [completedItems, currentDate]);

  useEffect(() => {
    const key = `geoLevelUp_reminders_${format(currentDate, 'yyyy-MM-dd')}`;
    localStorage.setItem(key, JSON.stringify(Array.from(reminders)));
  }, [reminders, currentDate]);

  const fetchSchedule = async (date: Date, forceRegenerate = false) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const storageKey = `geoLevelUp_plan_${dateKey}`;
    
    // Try load from storage first if not forcing regeneration
    if (!forceRegenerate) {
        const storedPlan = localStorage.getItem(storageKey);
        if (storedPlan) {
            try {
                setPlan(JSON.parse(storedPlan));
                return;
            } catch (e) {
                console.error("Failed to parse stored plan", e);
            }
        }
    }

    setLoading(true);
    try {
      const data = await generateDailySchedule(userProfile, date);
      setPlan(data);
      // Save generated plan
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1));
  const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));

  const toggleItem = (item: ScheduleItem, earnedXP = 50) => {
    const id = `${item.time}-${item.activity}`;
    const newSet = new Set(completedItems);
    
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
        addXP(earnedXP); 
        
        const btn = document.getElementById(`btn-${id}`);
        if(btn) {
            btn.classList.add('animate-bounce');
            setTimeout(() => btn.classList.remove('animate-bounce'), 1000);
        }
    }
    setCompletedItems(newSet);
  };

  const toggleReminder = (item: ScheduleItem, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!notificationsEnabled) {
          requestNotificationPermission();
          return;
      }
      const id = `${item.time}-${item.activity}`;
      const newSet = new Set(reminders);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setReminders(newSet);
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
      new Notification("GeoLevelUp", { body: "Notifications enabled! Click the bell icon on tasks to set reminders." });
    }
  };

  const exportToCalendar = () => {
    if (!plan) return;
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//GeoLevelUp//Schedule//EN\n";
    plan.schedule.forEach(item => {
      const timeMatch = item.time.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const [_, hours, minutes] = timeMatch;
        const startDate = new Date(currentDate);
        startDate.setHours(parseInt(hours), parseInt(minutes), 0);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        const formatICSDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        icsContent += "BEGIN:VEVENT\n";
        icsContent += `DTSTART:${formatICSDate(startDate)}\n`;
        icsContent += `DTEND:${formatICSDate(endDate)}\n`;
        icsContent += `SUMMARY:${item.activity}\n`;
        icsContent += `DESCRIPTION:${item.description}\n`;
        icsContent += "END:VEVENT\n";
      }
    });
    icsContent += "END:VCALENDAR";
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `schedule_${format(currentDate, 'yyyy-MM-dd')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Focus Mode Handlers ---
  const startFocusSession = (item: ScheduleItem) => {
      setActiveTask(item);
      setFocusTime(0);
      setIsTimerRunning(true);
  };

  const endFocusSession = () => {
      if (activeTask) {
          const minutes = Math.floor(focusTime / 60);
          const xpEarned = 50 + (minutes * 2); 
          
          const id = `${activeTask.time}-${activeTask.activity}`;
          if (!completedItems.has(id)) {
              toggleItem(activeTask, xpEarned);
          } else {
              addXP(xpEarned, minutes); 
          }
      }
      setActiveTask(null);
      setIsTimerRunning(false);
      setFocusTime(0);
  };

  const formatTimer = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'learning': return <Laptop className="w-5 h-5 text-blue-400" />;
      case 'business': return <Briefcase className="w-5 h-5 text-orange-400" />;
      case 'health': return <Dumbbell className="w-5 h-5 text-green-400" />;
      case 'rest': return <Moon className="w-5 h-5 text-purple-400" />;
      case 'hobby': return <Coffee className="w-5 h-5 text-pink-400" />;
      case 'fixed': return <Clock className="w-5 h-5 text-red-400" />;
      default: return <Sun className="w-5 h-5 text-slate-400" />;
    }
  };

  const getCategoryColor = (category: string, isCompleted: boolean) => {
    if (isCompleted) return 'border-emerald-500/20 bg-emerald-900/10 opacity-60';
    switch (category) {
      case 'learning': return 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50';
      case 'business': return 'border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50';
      case 'health': return 'border-green-500/30 bg-green-500/5 hover:border-green-500/50';
      case 'rest': return 'border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50';
      case 'hobby': return 'border-pink-500/30 bg-pink-500/5 hover:border-pink-500/50';
      case 'fixed': return 'border-red-500/30 bg-red-500/5 hover:border-red-500/50';
      default: return 'border-slate-700 bg-slate-800 hover:border-slate-600';
    }
  };

  const totalItems = plan?.schedule.length || 0;
  const completedCount = plan?.schedule.filter(i => completedItems.has(`${i.time}-${i.activity}`)).length || 0;
  const progressPercentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Focus Mode Overlay */}
      {activeTask && (
          <div className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center p-6 animate-fade-in backdrop-blur-sm">
             <div className="max-w-md w-full text-center space-y-8">
                 <div className="animate-pulse">
                     <Timer className="w-20 h-20 text-indigo-400 mx-auto mb-4" />
                 </div>
                 <div>
                     <h2 className="text-3xl font-bold text-white mb-2">Deep Focus Mode</h2>
                     <p className="text-xl text-indigo-300 font-medium">{activeTask.activity}</p>
                     <p className="text-slate-500 mt-2">{activeTask.description}</p>
                 </div>
                 
                 <div className="text-8xl font-mono font-bold text-white tabular-nums tracking-wider">
                     {formatTimer(focusTime)}
                 </div>
                 
                 <div className="flex gap-4 justify-center">
                    <button 
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${isTimerRunning ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                    >
                        {isTimerRunning ? 'Pause' : 'Resume'}
                    </button>
                    <button 
                        onClick={endFocusSession}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
                    >
                        Complete Session
                    </button>
                 </div>
                 <p className="text-sm text-slate-500">Every minute earns extra XP. Stay disciplined.</p>
             </div>
          </div>
      )}

      {/* Header Date Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={handlePrevDay} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-500" />
              {format(currentDate, 'EEEE, MMM do')}
            </h2>
            <p className="text-sm text-slate-400">{isSameDay(currentDate, new Date()) ? 'Today' : 'Plan Ahead'}</p>
          </div>
          <button onClick={handleNextDay} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          {plan && (
             <button 
                onClick={exportToCalendar}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                title="Export to Calendar (.ics)"
             >
                <Download className="w-5 h-5" />
             </button>
          )}
          <button 
            onClick={requestNotificationPermission}
            className={`p-2 rounded-lg transition-colors ${notificationsEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
            title="Toggle Notifications"
          >
             <Bell className={`w-5 h-5 ${notificationsEnabled ? 'fill-white' : ''}`} />
          </button>
          <button 
            onClick={() => fetchSchedule(currentDate, true)}
            disabled={loading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-all disabled:opacity-50 shadow-md hover:shadow-indigo-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Regenerate' : 'Regenerate'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
           <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-slate-400">Strategizing study blocks & business ops...</p>
        </div>
      ) : plan ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Schedule Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Focus & Progress Card */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
               <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Mission Focus</h3>
                    <p className="text-indigo-400 font-medium">{plan.focusOfTheDay}</p>
                 </div>
                 <div className="text-right">
                    <div className="text-3xl font-bold text-white">{progressPercentage}%</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Complete</div>
                 </div>
               </div>
               
               {/* Progress Bar */}
               <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
               </div>
            </div>

            {/* Interactive Timeline */}
            <div className="relative border-l-2 border-slate-700 ml-3 space-y-6 pb-4">
              {plan.schedule.map((item, index) => {
                const id = `${item.time}-${item.activity}`;
                const isCompleted = completedItems.has(id);
                const isReminderSet = reminders.has(id);
                
                return (
                  <div key={index} className="ml-6 relative group">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[35px] top-6 w-5 h-5 rounded-full border-4 z-10 transition-colors ${isCompleted ? 'bg-emerald-500 border-emerald-900' : item.category === 'fixed' ? 'bg-red-500 border-red-900' : 'bg-slate-900 border-slate-600'}`}></div>
                    
                    <div 
                      className={`p-4 rounded-xl border transition-all duration-200 ${getCategoryColor(item.category, isCompleted)} shadow-md relative`}
                    >
                      {/* Reminder Bell */}
                      <button 
                        onClick={(e) => toggleReminder(item, e)}
                        className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${isReminderSet ? 'text-indigo-400 bg-indigo-900/50' : 'text-slate-600 hover:text-indigo-400 hover:bg-slate-700'}`}
                        title={isReminderSet ? "Reminder active (5 min before)" : "Set reminder"}
                      >
                         <Bell className={`w-4 h-4 ${isReminderSet ? 'fill-indigo-400' : ''}`} />
                      </button>

                      {/* Focus Start Button */}
                      {!isCompleted && item.category !== 'fixed' && item.category !== 'rest' && (
                          <button
                            onClick={() => startFocusSession(item)}
                            className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-900/50 transition-all hover:scale-105"
                          >
                             <Play className="w-3 h-3 fill-white" /> Start Focus
                          </button>
                      )}

                      <div className="flex items-start justify-between mb-2">
                         <div className="flex items-center gap-3">
                           <button onClick={() => toggleItem(item)} id={`btn-${id}`}>
                             {isCompleted ? (
                               <CheckSquare className="w-6 h-6 text-emerald-500 shrink-0 cursor-pointer" />
                             ) : (
                               <Square className="w-6 h-6 text-slate-500 hover:text-indigo-400 shrink-0 cursor-pointer" />
                             )}
                           </button>
                           <span className={`font-mono text-sm font-bold px-2 py-1 rounded ${isCompleted ? 'text-emerald-400 bg-emerald-950/30' : item.category === 'fixed' ? 'text-red-400 bg-red-950/30' : 'text-indigo-400 bg-indigo-950/30'}`}>
                             {item.time}
                           </span>
                         </div>
                         <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-wider opacity-60 mr-8">
                            {getCategoryIcon(item.category)}
                            {item.category}
                         </div>
                      </div>
                      <div className={isCompleted ? 'opacity-50 grayscale' : ''}>
                        <h4 className={`text-lg font-bold mb-1 ${isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>{item.activity}</h4>
                        <p className={`text-sm leading-relaxed ${isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>{item.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 sticky top-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Daily Objectives
              </h3>
              <ul className="space-y-3">
                {plan.tips.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-300">
                    <span className="text-indigo-500 font-bold">•</span>
                    {tip}
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-slate-700">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Priority Check</h4>
                <div className="space-y-2">
                   {plan.schedule.some(i => i.category === 'fixed') && (
                      <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-300 text-sm">
                         <Clock className="w-4 h-4" /> Classes Scheduled
                      </div>
                   )}
                   <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20 text-orange-300 text-sm">
                      <Briefcase className="w-4 h-4" /> MyNexRyde Ops
                   </div>
                   <div className="flex items-center gap-2 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-300 text-sm">
                      <CheckCircle2 className="w-4 h-4" /> A-Student Methods
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">
          Select a date or click regenerate to view schedule.
        </div>
      )}
    </div>
  );
};

export default ScheduleView;