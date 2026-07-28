/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogEntry, logger } from '../../utils/logger';
import { formatDateTimeIndonesian } from '../../utils/date';
import { ShieldAlert, Trash2 } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(logger.getLogs());
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const handleClear = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'ALL') return true;
    return log.level === filterLevel;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            Audit Log System & Debug Logging
          </h2>
          <p className="text-xs text-slate-500">
            Pencatatan riwayat aktivitas sistem, error handling, dan respon API
          </p>
        </div>

        <button
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Bersihkan Log</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-600">Filter Level:</span>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
        >
          <option value="ALL">Semua Level</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
          <option value="FATAL">FATAL</option>
        </select>
      </div>

      <div className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-slate-300 border border-slate-800 space-y-2 max-h-[500px] overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <p className="text-slate-600 py-6 text-center">Belum ada log sistem yang tercatat.</p>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{formatDateTimeIndonesian(log.timestamp)}</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    log.level === 'ERROR' || log.level === 'FATAL'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : log.level === 'WARN'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  [{log.level}]
                </span>
              </div>
              <p className="text-slate-200 font-semibold">{log.message}</p>
              {log.context && (
                <pre className="text-[10px] text-slate-400 bg-slate-950/80 p-2 rounded overflow-x-auto">
                  {JSON.stringify(log.context, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
