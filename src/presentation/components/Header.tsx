/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from 'firebase/auth';
import {
  Archive,
  CloudCheck,
  CloudOff,
  LogOut,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { googleSignIn, googleSignOut } from '../../utils/auth';

interface HeaderProps {
  user: User | null;
  accessToken: string | null;
  onAuthChange: (user: User | null, token: string | null) => void;
  isSyncing: boolean;
  onTriggerSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  accessToken,
  onAuthChange,
  isSyncing,
  onTriggerSync,
}) => {
  const handleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        onAuthChange(res.user, res.accessToken);
      }
    } catch (err) {
      console.error('Login error', err);
    }
  };

  const handleLogout = async () => {
    await googleSignOut();
    onAuthChange(null, null);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-xl shadow-md shadow-indigo-200">
          <Archive className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            ARSIP SEKOLAH DIGITAL
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              <Sparkles className="w-3 h-3" /> v1.0 Production
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Sistem Manajemen Surat Masuk, Surat Keluar, Disposisi & Google Drive Sync
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {/* Sync Action Button */}
        {accessToken && (
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className={`inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all border ${
              isSyncing
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 shadow-2xs'
            }`}
          >
            {isSyncing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>Menyinkronkan...</span>
              </>
            ) : (
              <>
                <CloudCheck className="w-4 h-4 text-emerald-600" />
                <span>Sync ke Drive & Sheets</span>
              </>
            )}
          </button>
        )}

        {/* Google User Profile or Auth Login */}
        {user ? (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-8 h-8 rounded-full border border-slate-300"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                {user.displayName || user.email}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Google Drive Terhubung
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar / Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="inline-flex items-center gap-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2 rounded-xl border border-slate-300 shadow-xs transition-all hover:shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span className="flex items-center gap-1.5">
              Hubungkan Google Drive
              <CloudOff className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
