/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Building2,
  FileCheck,
  FileDown,
  FileSpreadsheet,
  FileText,
  FileUp,
  FolderGit2,
  LayoutDashboard,
  ShieldAlert,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'surat-masuk'
  | 'surat-keluar'
  | 'disposisi'
  | 'google-sync'
  | 'settings'
  | 'logs';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  counts: {
    suratMasuk: number;
    suratKeluar: number;
    disposisiAktif: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  counts,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard Arsip',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'surat-masuk' as NavTab,
      label: 'Surat Masuk',
      icon: FileDown,
      badge: counts.suratMasuk,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'surat-keluar' as NavTab,
      label: 'Surat Keluar',
      icon: FileUp,
      badge: counts.suratKeluar,
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'disposisi' as NavTab,
      label: 'Disposisi Surat',
      icon: FileCheck,
      badge: counts.disposisiAktif,
      badgeColor: counts.disposisiAktif > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600',
    },
    {
      id: 'google-sync' as NavTab,
      label: 'Drive & Spreadsheet',
      icon: FileSpreadsheet,
      badge: 'Auto',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'settings' as NavTab,
      label: 'Pengaturan Kop & Sekolah',
      icon: Building2,
      badge: null,
    },
    {
      id: 'logs' as NavTab,
      label: 'Audit Log System',
      icon: ShieldAlert,
      badge: null,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      <div className="p-5 border-b border-slate-800">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Menu Utama Sekolah
        </div>
        <p className="text-xs text-slate-500">Arsip Digital Terintegrasi</p>
      </div>

      <nav className="p-3 space-y-1.5 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 m-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-2 font-medium text-slate-300">
          <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Lokasi Drive Auto:</span>
        </div>
        <p className="text-[10px] text-slate-400 truncate">
          /ARSIP_SEKOLAH_DIGITAL
        </p>
        <p className="text-[10px] text-slate-500 italic">
          Format Spreadsheet: .xlsx / Sheets
        </p>
      </div>
    </aside>
  );
};
