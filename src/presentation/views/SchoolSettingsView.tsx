/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Building2, CheckCircle2, Save, School } from 'lucide-react';
import { SchoolProfile } from '../../types';

interface SchoolSettingsViewProps {
  schoolProfile: SchoolProfile;
  onSaveSchoolProfile: (profile: SchoolProfile) => void;
}

export const SchoolSettingsView: React.FC<SchoolSettingsViewProps> = ({
  schoolProfile,
  onSaveSchoolProfile,
}) => {
  const [formState, setFormState] = useState<SchoolProfile>(schoolProfile);
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSchoolProfile(formState);
    setShowSavedNotification(true);
    setTimeout(() => {
      setShowSavedNotification(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          Pengaturan Kop Surat & Profil Sekolah
        </h2>
        <p className="text-xs text-slate-500">
          Atur nama sekolah, identitas dinas, dan penandatangan resmi untuk lembar disposisi dan cetak arsip
        </p>
      </div>

      {showSavedNotification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan Profil Sekolah & Kop Disposisi berhasil disimpan!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Identitas Kop Surat */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <School className="w-4 h-4 text-indigo-600" />
            Informasi Kop Surat Resmi
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instansi Pembina / Dinas (Baris Atas Kop Surat) *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PEMERINTAH KOTA BANDUNG • DINAS PENDIDIKAN"
                value={formState.namaInstansiPembina}
                onChange={(e) =>
                  setFormState({ ...formState, namaInstansiPembina: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Sekolah / Satuan Pendidikan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SMP NEGERI 1 BANDUNG"
                  value={formState.namaSekolah}
                  onChange={(e) => setFormState({ ...formState, namaSekolah: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kota / Kabupaten (Lokasi Terbit Surat) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bandung"
                  value={formState.kota}
                  onChange={(e) => setFormState({ ...formState, kota: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Lengkap Jalan & Wilayah *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Jl. Ksatriaan No. 1, Kec. Cicendo, Kota Bandung"
                value={formState.alamatSekolah}
                onChange={(e) => setFormState({ ...formState, alamatSekolah: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Telepon Sekolah
                </label>
                <input
                  type="text"
                  placeholder="Contoh: (022) 4200000"
                  value={formState.teleponSekolah}
                  onChange={(e) => setFormState({ ...formState, teleponSekolah: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Resmi Sekolah
                </label>
                <input
                  type="email"
                  placeholder="Contoh: info@smpn1bdg.sch.id"
                  value={formState.emailSekolah}
                  onChange={(e) => setFormState({ ...formState, emailSekolah: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Penandatangan Utama (Kepala Sekolah) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Penandatangan Resmi Lembar Disposisi & Surat
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan Penandatangan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Kepala SMP Negeri 1 Bandung"
                value={formState.jabatanKepalaSekolah}
                onChange={(e) =>
                  setFormState({ ...formState, jabatanKepalaSekolah: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Pd."
                value={formState.namaKepalaSekolah}
                onChange={(e) =>
                  setFormState({ ...formState, namaKepalaSekolah: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Penandatangan
              </label>
              <input
                type="text"
                placeholder="Contoh: 19680512 199403 1 004"
                value={formState.nipKepalaSekolah}
                onChange={(e) =>
                  setFormState({ ...formState, nipKepalaSekolah: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Live Preview Kop Surat Disposisi
          </div>
          <div className="bg-white text-slate-900 p-6 rounded-xl border border-slate-300 font-serif text-center space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
              {formState.namaInstansiPembina || 'INSTANSI PEMBINA'}
            </p>
            <h4 className="text-lg font-black uppercase tracking-wide">
              {formState.namaSekolah || 'NAMA SEKOLAH'}
            </h4>
            <p className="text-[10px] text-slate-600 font-sans italic">
              {formState.alamatSekolah} | Telp: {formState.teleponSekolah} | Email: {formState.emailSekolah}
            </p>
            <div className="border-b-2 border-slate-900 pt-2" />
            <div className="text-right pt-4 text-xs font-sans">
              <p>{formState.kota}, [Tanggal Disposisi]</p>
              <p className="font-bold">{formState.jabatanKepalaSekolah}</p>
              <div className="h-10" />
              <p className="font-bold underline">{formState.namaKepalaSekolah}</p>
              <p className="text-[10px] text-slate-600 font-mono">NIP. {formState.nipKepalaSekolah}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan Profil Sekolah</span>
          </button>
        </div>
      </form>
    </div>
  );
};
