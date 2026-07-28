/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from 'firebase/auth';
import {
  CheckCircle2,
  Cloud,
  ExternalLink,
  FileSpreadsheet,
  FolderOpen,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { googleSignIn } from '../../utils/auth';

interface GoogleAuthBannerProps {
  user: User | null;
  folderId?: string;
  spreadsheetId?: string;
  onAuthSuccess: (user: User, token: string) => void;
}

export const GoogleAuthBanner: React.FC<GoogleAuthBannerProps> = ({
  user,
  folderId,
  spreadsheetId,
  onAuthSuccess,
}) => {
  const handleConnect = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        onAuthSuccess(res.user, res.accessToken);
      }
    } catch (err) {
      console.error('Connection error', err);
    }
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-blue-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-blue-300 border border-white/10 shrink-0">
              <Cloud className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Otomatisasi penyimpanan Google Drive & Spreadsheet
              </h3>
              <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
                Hubungkan akun Google Sekolah untuk mengunggah dokumen arsip secara otomatis ke folder
                Google Drive dan mencatat rekapitulasi data surat ke Google Spreadsheet secara real-time.
              </p>
            </div>
          </div>
          <button
            onClick={handleConnect}
            className="shrink-0 inline-flex items-center gap-2 bg-white text-indigo-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md hover:bg-blue-50 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Hubungkan Google Sekolah</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-emerald-900/10 border border-emerald-300/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/20 text-emerald-700 rounded-xl">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
            Penyimpanan Otomatis Aktif
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
              {user.email}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Arsip surat dan file lampiran otomatis tersimpan di Google Drive & Spreadsheet.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {folderId && (
          <a
            href={`https://drive.google.com/drive/folders/${folderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Folder Drive</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        )}
        {spreadsheetId && (
          <a
            href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-emerald-800 hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Spreadsheet</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        )}
      </div>
    </div>
  );
};
