/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from 'firebase/auth';
import {
  AlertCircle,
  CheckCircle2,
  CloudCheck,
  ExternalLink,
  FileSpreadsheet,
  FolderOpen,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { GoogleDriveFolderConfig, SyncLog } from '../../types';
import { AppUser } from '../../utils/auth';
import { formatDateTimeIndonesian } from '../../utils/date';

interface DriveSyncViewProps {
  user: User | AppUser | null;
  accessToken: string | null;
  driveConfig: GoogleDriveFolderConfig;
  syncLogs: SyncLog[];
  isSyncing: boolean;
  onTriggerSync: () => void;
}

export const DriveSyncView: React.FC<DriveSyncViewProps> = ({
  user,
  accessToken,
  driveConfig,
  syncLogs,
  isSyncing,
  onTriggerSync,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Integrasi Google Workspace Cloud
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2 flex items-center gap-2">
            Penyimpanan Otomatis Google Drive & Sheets
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Dokumen arsip surat dan file lampiran otomatis tersimpan di folder Google Drive dan
            teregistrasi ke dalam baris Google Spreadsheet secara terstruktur.
          </p>
        </div>

        {accessToken && (
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className={`inline-flex items-center gap-2 font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all shrink-0 cursor-pointer ${
              isSyncing
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Proses Sinkronisasi...' : 'Sinkronkan Sekarang'}</span>
          </button>
        )}
      </div>

      {/* Connection & Drive Links Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Drive Folder Box */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Folder Google Drive</h3>
                <p className="text-[11px] text-slate-500">Penyimpanan File Lampiran Surat</p>
              </div>
            </div>
            {driveConfig.rootFolderId ? (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Terhubung
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                Belum dibuat
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs text-slate-600 font-medium">
            <p>
              Struktur Folder Utama: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-bold">/ARSIP_SEKOLAH_DIGITAL</code>
            </p>
            <ul className="pl-4 list-disc space-y-1 text-slate-500">
              <li>
                Subfolder 1: <code className="font-semibold text-slate-700">/Surat_Masuk</code> (File PDF/Doc Surat Masuk)
              </li>
              <li>
                Subfolder 2: <code className="font-semibold text-slate-700">/Surat_Keluar</code> (File PDF/Doc Surat Keluar)
              </li>
            </ul>
          </div>

          {driveConfig.rootFolderId && (
            <a
              href={`https://drive.google.com/drive/folders/${driveConfig.rootFolderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-amber-50 text-slate-800 hover:text-amber-900 font-bold text-xs py-2.5 rounded-xl border border-slate-200 transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-amber-600" />
              <span>Buka Folder Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          )}
        </div>

        {/* Google Spreadsheet Box */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Google Spreadsheet</h3>
                <p className="text-[11px] text-slate-500">Rekapitulasi Data & Registri Surat</p>
              </div>
            </div>
            {driveConfig.spreadsheetId ? (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Terhubung
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                Belum dibuat
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs text-slate-600 font-medium">
            <p>
              Nama Spreadsheet: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">ARSIP_SEKOLAH_SPREADSHEET</code>
            </p>
            <ul className="pl-4 list-disc space-y-1 text-slate-500">
              <li>Tab 1: <strong className="text-slate-700">Surat_Masuk</strong> (Nomor, Pengirim, Perihal, Link Drive)</li>
              <li>Tab 2: <strong className="text-slate-700">Surat_Keluar</strong> (Nomor, Penerima, Perihal, Link Drive)</li>
              <li>Tab 3: <strong className="text-slate-700">Disposisi</strong> (Diteruskan Kepada, Sifat, Batas Waktu, Status)</li>
            </ul>
          </div>

          {driveConfig.spreadsheetId && (
            <a
              href={`https://docs.google.com/spreadsheets/d/${driveConfig.spreadsheetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 font-bold text-xs py-2.5 rounded-xl border border-slate-200 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Buka Google Spreadsheet</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          )}
        </div>
      </div>

      {/* Sync History Logs */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CloudCheck className="w-4 h-4 text-indigo-600" />
            Riwayat Riwayat Sinkronisasi Cloud
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            Terakhir sync: {formatDateTimeIndonesian(driveConfig.lastSyncTime)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-3 px-4">Waktu Sync</th>
                <th className="py-3 px-4">Jenis</th>
                <th className="py-3 px-4">Target Integration</th>
                <th className="py-3 px-4">Detail Laporan</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {syncLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada catatan aktivitas sinkronisasi.
                  </td>
                </tr>
              ) : (
                syncLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {formatDateTimeIndonesian(log.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{log.type}</span>
                    </td>
                    <td className="py-3 px-4">{log.targetName}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm truncate">
                      {log.details || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
