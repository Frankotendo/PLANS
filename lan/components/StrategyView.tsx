import React, { useEffect, useState } from 'react';
import { StrategyPath, UserProfile } from '../types';
import { generateStrategy } from '../services/geminiService';
import { Shield, TrendingUp, Globe, Rocket, RefreshCw, Zap } from 'lucide-react';

interface StrategyViewProps {
  userProfile: UserProfile;
}

const StrategyView: React.FC<StrategyViewProps> = ({ userProfile }) => {
  const [strategies, setStrategies] = useState<StrategyPath[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStrategy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStrategy = async () => {
    setLoading(true);
    try {
      const data = await generateStrategy(userProfile);
      setStrategies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('trad')) return <TrendingUp className="w-6 h-6 text-green-400" />;
    if (lower.includes('cyber') || lower.includes('secur')) return <Shield className="w-6 h-6 text-red-400" />;
    if (lower.includes('busine') || lower.includes('nexryde')) return <Rocket className="w-6 h-6 text-orange-400" />;
    return <Globe className="w-6 h-6 text-blue-400" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Strategic Growth Paths</h2>
          <p className="text-slate-400">Synergistic ways to level up your skills in Geomatics, Cyber, and Trading simultaneously.</p>
        </div>
        <button 
          onClick={loadStrategy}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Refresh Strategy'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.length === 0 && !loading && (
             <div className="col-span-full text-center py-20 text-slate-500">
                Click refresh to generate your personalized strategy.
             </div>
        )}
        
        {strategies.map((strat, idx) => (
          <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 group-hover:border-indigo-500/50 transition-colors">
                {getIcon(strat.title)}
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{strat.title}</h3>
            </div>
            
            <p className="text-slate-300 mb-4 text-sm leading-relaxed">{strat.description}</p>
            
            <div className="mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Synergies
              </h4>
              <div className="flex flex-wrap gap-2">
                {strat.synergies.map((syn, sIdx) => (
                  <span key={sIdx} className="px-2 py-1 bg-indigo-500/10 text-indigo-300 text-xs rounded border border-indigo-500/20">
                    {syn}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Action Items</h4>
              <ul className="space-y-2">
                {strat.actionItems.map((item, aIdx) => (
                  <li key={aIdx} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="mt-1.5 w-1 h-1 bg-emerald-400 rounded-full shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategyView;