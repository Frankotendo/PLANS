import React, { useState } from 'react';
import Layout from './components/Layout';
import ScheduleView from './components/ScheduleView';
import StrategyView from './components/StrategyView';
import ProfileView from './components/ProfileView';
import VoiceOrb from './components/VoiceOrb';
import { INITIAL_USER_PROFILE } from './constants';
import { ViewState, UserProfile } from './types';
import { ArrowRight, Trophy, Target, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.SCHEDULE:
        return <ScheduleView userProfile={userProfile} />;
      case ViewState.STRATEGY:
        return <StrategyView userProfile={userProfile} />;
      case ViewState.PROFILE:
        return <ProfileView userProfile={userProfile} onUpdate={handleProfileUpdate} />;
      case ViewState.DASHBOARD:
      default:
        return (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Welcome */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Trophy className="w-64 h-64 text-white" />
               </div>
               <div className="relative z-10">
                  <h1 className="text-4xl font-extrabold text-white mb-2">
                    Welcome back, <span className="text-indigo-400">{userProfile.name.split(' ')[0]}</span>.
                  </h1>
                  <p className="text-slate-300 max-w-xl text-lg mb-6">
                    Ready to bridge the gap between Geomatics and the financial world? Your business, '{userProfile.businessName}', awaits optimization.
                  </p>
                  <button 
                    onClick={() => setCurrentView(ViewState.SCHEDULE)}
                    className="flex items-center gap-2 bg-white text-indigo-900 px-6 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors"
                  >
                    View Today's Mission <ArrowRight className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div onClick={() => setCurrentView(ViewState.STRATEGY)} className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-indigo-500/50 cursor-pointer transition-all group">
                  <div className="flex items-center justify-between mb-4">
                     <Target className="w-8 h-8 text-emerald-400 bg-emerald-400/10 p-1.5 rounded-lg" />
                     <span className="text-xs text-slate-500 group-hover:text-emerald-400 transition-colors">Strategy</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Skill Synergy</h3>
                  <p className="text-sm text-slate-400">View your roadmap to combine GIS with Trading & Cyber.</p>
               </div>

               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                     <Activity className="w-8 h-8 text-orange-400 bg-orange-400/10 p-1.5 rounded-lg" />
                     <span className="text-xs text-slate-500">Business</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{userProfile.businessName}</h3>
                  <p className="text-sm text-slate-400">Scheduled time block: 18:00 - 20:00 today.</p>
               </div>

               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                     <Trophy className="w-8 h-8 text-purple-400 bg-purple-400/10 p-1.5 rounded-lg" />
                     <span className="text-xs text-slate-500">Goals</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{userProfile.goals.length} Active Goals</h3>
                  <p className="text-sm text-slate-400">Progress is on track. Weekend Volleyball confirmed.</p>
               </div>
            </div>

            {/* Next Actions Preview */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
               <h3 className="text-lg font-bold text-white mb-4">Suggested Actions</h3>
               <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
                     <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                     <p className="text-slate-300 flex-1">Research Python libraries for geospatial financial analysis (e.g., GeoPandas + yfinance).</p>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
                     <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                     <p className="text-slate-300 flex-1">Check {userProfile.businessName} operational metrics for the week.</p>
                  </div>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
      <VoiceOrb />
    </Layout>
  );
};

export default App;