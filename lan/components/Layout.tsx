import React, { useEffect, useState } from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Calendar, Compass, UserCircle, Flame, Zap } from 'lucide-react';
import { getStats, calculateProgress } from '../services/gamification';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const [stats, setStats] = useState(getStats());

  useEffect(() => {
    // Listen for XP updates from other components
    const handleStatsUpdate = () => setStats(getStats());
    window.addEventListener("statsUpdated", handleStatsUpdate);
    return () => window.removeEventListener("statsUpdated", handleStatsUpdate);
  }, []);

  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.STRATEGY, label: 'Strategy', icon: Compass },
    { id: ViewState.SCHEDULE, label: 'Schedule', icon: Calendar },
    { id: ViewState.PROFILE, label: 'Profile', icon: UserCircle },
  ];

  const progress = calculateProgress(stats);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 fixed md:relative z-50 bottom-0 md:bottom-auto h-auto md:h-screen">
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            GeoLevelUp
          </h1>
          <p className="text-xs text-slate-500 mt-1">Master Your Craft</p>
        </div>

        <nav className="flex-1 flex md:flex-col justify-around md:justify-start px-2 md:px-4 gap-2 py-2 md:py-0 bg-slate-900 border-t md:border-t-0 border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-4 md:py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-6 h-6 md:w-5 md:h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="text-xs md:text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 hidden md:block space-y-4">
           {/* Streak Card */}
           <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-400">
                <Flame className="w-5 h-5 fill-orange-400" />
                <span className="font-bold">{stats.streakDays} Day Streak</span>
              </div>
           </div>

           {/* Level Card */}
           <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex justify-between items-center mb-1">
                 <div className="text-xs text-slate-500">Current Rank</div>
                 <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex justify-between items-end mb-2">
                 <span className="text-white font-bold text-lg">Level {stats.level}</span>
                 <span className="text-indigo-400 text-xs">{stats.currentXP} / {stats.nextLevelXP} XP</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                 <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-700" 
                    style={{ width: `${progress}%` }}
                 ></div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-20 md:mb-0">
         <div className="max-w-6xl mx-auto">
           {children}
         </div>
      </main>
    </div>
  );
};

export default Layout;