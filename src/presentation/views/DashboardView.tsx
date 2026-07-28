/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileCheck,
  FileDown,
  FileSpreadsheet,
  FileUp,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { DashboardStats } from '../../domain/usecases/SuratUseCases';

import { Disposisi, SuratKeluar, SuratMasuk } from '../../types';
import { formatDateIndonesian } from '../../utils/date';
import { StatsCard } from '../components/StatsCard';

interface DashboardViewProps {
  stats: DashboardStats;
  suratMasukList: SuratMasuk[];
  suratKeluarList: SuratKeluar[];
  disposisiList: Disposisi[];
  onNavigate: (tab: any) => void;
  onOpenCreateSuratMasuk: () => void;
  onOpenCreateSuratKeluar: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  suratMasukList,
  suratKeluarList,
  disposisiList,
  onNavigate,
  onOpenCreateSuratMasuk,
  onOpenCreateSuratKeluar,
}) => {
  const recentSuratMasuk = suratMasukList.slice(0, 3);
  const recentDisposisi = disposisiList.filter((d) => d.status !== 'Selesai').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Banner Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Sistem Informasi Arsip Sekolah
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">
            Selamat Datang di Portal Tata Usaha & Kearsipan
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Kelola persuratan masuk, pembuatan surat keluar, penerbitan lembar disposisi Kepala Sekolah,
            serta otomatisasi pencatatan ke Google Drive dan Google Sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreateSuratMasuk}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Surat Masuk</span>
          </button>
          <button
            onClick={onOpenCreateSuratKeluar}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-200 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Surat Keluar</span>
          </button>
        </div>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Surat Masuk"
          value={stats.totalSuratMasuk}
          subtitle="Arsip surat masuk terdaftar"
          icon={FileDown}
          colorTheme="blue"
        />
        <StatsCard
          title="Total Surat Keluar"
          value={stats.totalSuratKeluar}
          subtitle="Surat keluar yang diterbitkan"
          icon={FileUp}
          colorTheme="emerald"
        />
        <StatsCard
          title="Disposisi Pending"
          value={stats.totalDisposisiAktif}
          subtitle="Memerlukan tindak lanjut"
          icon={Clock}
          colorTheme="amber"
        />
        <StatsCard
          title="Google Drive Sync"
          value={`${stats.syncPercent}%`}
          subtitle="Tersinkron di Google Sheets"
          icon={FileSpreadsheet}
          colorTheme="indigo"
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Surat Masuk */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FileDown className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Surat Masuk Terbaru
                </h3>
              </div>
              <button
                onClick={() => onNavigate('surat-masuk')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentSuratMasuk.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Belum ada surat masuk terdaftar.
                </p>
              ) : (
                recentSuratMasuk.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          {item.nomorSurat}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {item.kategori}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 line-clamp-1">
                        {item.perihal}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Dari: <strong className="text-slate-600">{item.pengirim}</strong> |{' '}
                        {formatDateIndonesian(item.tanggalDiterima)}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                        item.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Terdisposisi'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Disposisi Pending Active */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Disposisi Perlu Tindak Lanjut
                </h3>
              </div>
              <button
                onClick={() => onNavigate('disposisi')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Kelola Disposisi <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentDisposisi.length === 0 ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1 opacity-70" />
                  <p className="text-xs text-slate-500 font-medium">
                    Semua disposisi surat telah selesai diproses.
                  </p>
                </div>
              ) : (
                recentDisposisi.map((disp) => (
                  <div key={disp.id} className="py-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {disp.nomorSuratMasuk}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          disp.sifat === 'Sangat Segera'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : disp.sifat === 'Penting'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {disp.sifat}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {disp.perihalSuratMasuk}
                    </p>
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                      <p>
                        Diteruskan:{' '}
                        <span className="font-semibold text-indigo-700">
                          {disp.diteruskanKepada.join(', ')}
                        </span>
                      </p>
                      <p className="font-medium text-slate-400">
                        Batas: <strong className="text-slate-700">{formatDateIndonesian(disp.batasWaktu)}</strong>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
