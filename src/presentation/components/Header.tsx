/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Archive,
  CloudCheck,
  CloudOff,
  LogOut,
  Sparkles,
  User as UserIcon,
  UserCheck,
} from 'lucide-react';
import { AppUser, DEFAULT_OPERATOR_USER, googleSignIn, googleSignOut } from '../../utils/auth';

interface HeaderProps {
  user: User | AppUser | null;
  accessToken: string | null;
  onAuthChange: (user: User | AppUser | null, token: string | null) => void;
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
    } catch (err: unknown) {
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
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
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
              {accessToken ? (
                <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Google Drive Terhubung
                </p>
              ) : (
                <p className="text-[10px] text-indigo-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Operator Aktif (Otomatis Masuk)
                </p>
              )}
            </div>

            {!accessToken && (
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-indigo-200 transition-all cursor-pointer ml-1"
                title="Hubungkan akun Google Drive untuk sinkronisasi cloud"
              >
                <span>Sync Drive</span>
                <CloudOff className="w-3 h-3 text-indigo-500" />
              </button>
            )}

            <button
              onClick={handleLogout}
              title="Keluar / Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-0.5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAuthChange(DEFAULT_OPERATOR_USER, null)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Masuk Otomatis</span>
            </button>
            <button
              onClick={handleLogin}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-2 rounded-xl border border-slate-300 shadow-xs transition-all"
            >
              <CloudOff className="w-3.5 h-3.5 text-slate-400" />
              <span>Drive Sync</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
