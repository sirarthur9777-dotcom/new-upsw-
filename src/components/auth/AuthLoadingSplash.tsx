import React from 'react';
import { Sun, Zap } from 'lucide-react';

export const AuthLoadingSplash: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="relative flex flex-col items-center gap-6">
        {/* Glow Ring */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-amber-500 to-indigo-600 p-0.5 shadow-2xl shadow-blue-500/30 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sun className="w-10 h-10 text-amber-400 animate-spin-slow" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white border-2 border-slate-950 shadow-md">
            <Zap className="w-3.5 h-3.5 fill-white" />
          </div>
        </div>

        {/* Title & Spinner */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>Solarix</span>
            <span className="text-amber-400">Solar EPC</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">Verifying Security Session & Cloud Sync...</p>
        </div>

        {/* Loading Bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-amber-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
