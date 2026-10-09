import React from 'react';
import { Shield, X, Clock, User, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuditLogModal: React.FC = () => {
  const { auditLogOpen, setAuditLogOpen, auditLogs } = useApp();

  if (!auditLogOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl bg-[#E9EEE9] dark:bg-[#1C2620] rounded-3xl shadow-[8px_8px_24px_rgba(175,188,177,0.6),-8px_-8px_24px_rgba(255,255,255,0.85)] dark:shadow-[8px_8px_24px_rgba(0,0,0,0.6)] border border-[#D5DDD6]/80 dark:border-[#2C3E33]/80 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5DDD6] dark:border-[#2C3E33] bg-[#E1E8E1]/50 dark:bg-[#151D18]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] text-[#25845A] shadow-[2px_2px_5px_rgba(175,188,177,0.4),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.4)]">
              <Shield className="w-5 h-5 text-[#25845A]" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#26372D] dark:text-[#E5ECE7] tracking-tight">System Audit Trail</h2>
              <p className="text-xs text-[#728078] dark:text-[#98A79D] font-medium">
                Security and operational log records
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuditLogOpen(false)}
            className="p-2 rounded-xl text-[#728078] hover:text-[#26372D] dark:hover:text-[#E5ECE7] bg-[#E9EEE9] dark:bg-[#151D18] shadow-[2px_2px_5px_rgba(175,188,177,0.4),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.4)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Log Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-[#728078] dark:text-[#98A79D] text-center py-10">No audit logs recorded yet.</p>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[3px_3px_8px_rgba(175,188,177,0.45),-3px_-3px_8px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.4),-2px_-2px_5px_rgba(255,255,255,0.03)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70 flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-[#DFE6E0] dark:bg-[#202E25] text-[#25845A] shrink-0 mt-0.5 shadow-[inset_1px_1px_3px_rgba(175,188,177,0.4)]">
                  <Activity className="w-4 h-4 text-[#25845A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#26372D] dark:text-[#E5ECE7]">
                        {log.action}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] bg-[#DFE6E0] dark:bg-[#202E25] text-[#26372D] dark:text-[#E5ECE7] rounded-md font-mono font-bold">
                        {log.module}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#728078] dark:text-[#98A79D] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[#728078] dark:text-[#98A79D] mt-1 font-medium">{log.details}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-[#728078] dark:text-[#98A79D]">
                    <User className="w-3 h-3" />
                    <span>Role: <strong className="text-[#26372D] dark:text-[#E5ECE7]">{log.userRole}</strong></span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

