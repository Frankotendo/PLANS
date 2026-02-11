import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Save, UserCircle, BookOpen, Briefcase, GraduationCap } from 'lucide-react';

interface ProfileViewProps {
  userProfile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ userProfile, onUpdate }) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    onUpdate(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Operations Profile</h2>
          <p className="text-slate-400">Configure your constraints and identity for the strategy engine.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition-all shadow-lg shadow-emerald-900/50"
        >
          <Save className="w-5 h-5" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Identity Section */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
           <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
             <UserCircle className="w-6 h-6 text-indigo-400" /> Identity
           </h3>
           <div className="space-y-4">
              <div>
                 <label className="block text-sm text-slate-400 mb-1">Name / Codename</label>
                 <input 
                    type="text" 
                    value={profile.name} 
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                 />
              </div>
              <div>
                 <label className="block text-sm text-slate-400 mb-1">Major</label>
                 <input 
                    type="text" 
                    value={profile.major} 
                    onChange={(e) => handleChange('major', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                 />
              </div>
              <div>
                 <label className="block text-sm text-slate-400 mb-1">Business Name</label>
                 <input 
                    type="text" 
                    value={profile.businessName} 
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                 />
              </div>
           </div>
        </div>

        {/* Timetable Section */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 md:row-span-2">
           <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
             <GraduationCap className="w-6 h-6 text-orange-400" /> School Timetable
           </h3>
           <p className="text-sm text-slate-400 mb-4">
             Paste or type your fixed class schedule here. The AI will strictly respect these times and build your business/hobbies around them.
           </p>
           <textarea 
              value={profile.schoolSchedule} 
              onChange={(e) => handleChange('schoolSchedule', e.target.value)}
              className="w-full h-[300px] bg-slate-900 border border-slate-700 rounded-lg p-4 text-white font-mono text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none leading-relaxed"
              placeholder="e.g.,&#10;Monday: 09:00 - 11:00 Calculus&#10;Wednesday: 14:00 - 17:00 Geomatics Lab&#10;Friday: 10:00 - 12:00 Physics"
           ></textarea>
        </div>

        {/* Hobbies Section */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
           <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
             <BookOpen className="w-6 h-6 text-pink-400" /> Interests & Focus
           </h3>
           <div className="space-y-2">
              <label className="block text-sm text-slate-400 mb-1">Hobbies (Comma Separated)</label>
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-300">
                {profile.hobbies.join(', ')}
              </div>
              <p className="text-xs text-slate-500 mt-2">To edit hobbies or goals, update the user profile configuration (Full editing coming soon).</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;