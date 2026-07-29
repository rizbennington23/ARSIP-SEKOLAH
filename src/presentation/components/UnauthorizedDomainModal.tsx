/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertTriangle, Check, Copy, ExternalLink, ShieldAlert, UserCheck, X } from 'lucide-react';
import firebaseConfig from '../../../firebase-applet-config.json';

interface UnauthorizedDomainModalProps {
  isOpen: boolean;
  domainName: string;
  onClose: () => void;
}

export const UnauthorizedDomainModal: React.FC<UnauthorizedDomainModalProps> = ({
  isOpen,
  domainName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const projectId = firebaseConfig.projectId || 'gen-lang-client-0180351053';
  const consoleSettingsUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(domainName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 text-rose-700 rounded-xl shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Domain Belum Diizinkan di Firebase
              </h3>
              <p className="text-xs text-slate-500">
                Kesalahan <code className="font-mono text-rose-600 bg-rose-50 px-1 rounded">auth/unauthorized-domain</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs text-slate-700">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900 space-y-1">
            <p className="font-semibold flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Sistem memblokir login dari domain ini
            </p>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              Google Sign-In hanya dapat digunakan pada domain yang terdaftar di daftar <strong>Authorized Domains</strong> proyek Firebase Anda.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Domain Perangkat / Aplikasi Anda Saat Ini:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={domainName}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs text-slate-900 font-bold focus:outline-none"
              />
              <button
                onClick={handleCopyDomain}
                className="shrink-0 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2">
            <p className="font-bold text-slate-900">Cara Mengizinkan Domain di Firebase Console:</p>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
              <li>
                Buka <strong>Firebase Console Settings</strong> dengan menekan tombol di bawah.
              </li>
              <li>
                Masuk ke menu <strong>Authentication</strong> &rarr; tab <strong>Settings</strong> &rarr; <strong>Authorized domains</strong>.
              </li>
              <li>
                Klik tombol <strong>Add domain (Tambah domain)</strong>.
              </li>
              <li>
                Masukkan domain <code className="font-bold text-indigo-700 bg-indigo-50 px-1 rounded">{domainName}</code> (dan <code className="font-bold text-indigo-700 bg-indigo-50 px-1 rounded">*.vercel.app</code> jika menggunakan Vercel), lalu simpan.
              </li>
              <li>
                Coba klik <strong>Hubungkan Google Drive / Login</strong> kembali.
              </li>
            </ol>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Masuk Otomatis (Mode Operator)</span>
          </button>
          <a
            href={consoleSettingsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <span>Buka Firebase Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
