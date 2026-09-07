import React from 'react';
import { Shield, X, Clock, User, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuditLogModal: React.FC = () => {
  const { auditLogOpen, setAuditLogOpen, auditLogs } = useApp();

  if (!auditLogOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">System Audit Trail</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Security and operational log records
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuditLogOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Log Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">No audit logs recorded yet.</p>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                  <Activity className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {log.action}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-mono">
                        {log.module}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{log.details}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                    <User className="w-3 h-3" />
                    <span>Role: {log.userRole}</span>
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
