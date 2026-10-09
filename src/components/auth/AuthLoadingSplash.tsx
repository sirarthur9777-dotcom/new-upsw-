import React from 'react';
import { Sun, Zap } from 'lucide-react';

export const AuthLoadingSplash: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-[#E9EEE9] dark:bg-[#16211A] text-[#26372D] dark:text-[#E5ECE7] flex flex-col items-center justify-center p-6 font-sans">
      <div className="relative flex flex-col items-center gap-6">
        {/* Neumorphic Raised Emblem */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-[#E9EEE9] dark:bg-[#1B2720] shadow-[8px_8px_20px_rgba(175,192,178,0.75),-8px_-8px_20px_rgba(255,255,255,0.95)] dark:shadow-[8px_8px_20px_rgba(10,15,12,0.85),-4px_-4px_14px_rgba(38,54,44,0.4)] border border-white/70 dark:border-white/10 flex items-center justify-center">
            <Sun className="w-10 h-10 text-[#25845A] dark:text-[#38B57D]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#25845A] flex items-center justify-center text-white shadow-[2px_2px_5px_rgba(37,132,90,0.4)] border-2 border-[#E9EEE9] dark:border-[#16211A]">
            <Zap className="w-3.5 h-3.5 fill-white" />
          </div>
        </div>

        {/* Title & Status */}
        <div className="text-center space-y-1.5">
          <h2 className="text-lg font-black tracking-tight text-[#26372D] dark:text-white flex items-center justify-center gap-1.5">
            <span>Upadhyay Brother</span>
            <span className="text-[#25845A] dark:text-[#38B57D]">Solar Works</span>
          </h2>
          <p className="text-xs text-[#728078] dark:text-[#8E9F95] font-medium">Verifying Security Session & Cloud Sync...</p>
        </div>

        {/* Loading Indicator */}
        <div className="w-48 h-1.5 bg-[#E1E8E1] dark:bg-[#121A15] shadow-[inset_1px_1px_2.5px_rgba(170,188,173,0.7),inset_-1px_-1px_2.5px_rgba(255,255,255,0.9)] rounded-full overflow-hidden mt-1">
          <div className="w-full h-full bg-[#25845A] rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

