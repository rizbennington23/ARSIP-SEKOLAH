/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FileCheck,
  Filter,
  Plus,
  Printer,
  Search,
  Send,
  Trash2,
} from 'lucide-react';
import {
  Disposisi,
  JabatanDisposisi,
  SchoolProfile,
  SifatDisposisi,
  StatusDisposisi,
  SuratMasuk,
} from '../../types';
import { formatDateIndonesian } from '../../utils/date';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { PrintDisposisiModal } from './PrintDisposisiModal';

interface DisposisiViewProps {
  disposisiList: Disposisi[];
  suratMasukList: SuratMasuk[];
  schoolProfile: SchoolProfile;
  onSaveDisposisi: (item: Disposisi) => void;
  onDeleteDisposisi: (id: string) => void;
  onUpdateSchoolProfile: (profile: SchoolProfile) => void;
  isOpenCreateModal: boolean;
  setIsOpenCreateModal: (open: boolean) => void;
  preSelectedSuratMasuk?: SuratMasuk | null;
}

const ALL_JABATAN: JabatanDisposisi[] = [
  'Wakasek Kurikulum',
  'Wakasek Kesiswaan',
  'Wakasek Humas & Sarpras',
  'Kepala Tata Usaha (TU)',
  'Guru / Wali Kelas',
  'Bendahara Sekolah',
  'Tim Kurikulum',
  'Tim Kesiswaan',
];

export const DisposisiView: React.FC<DisposisiViewProps> = ({
  disposisiList,
  suratMasukList,
  schoolProfile,
  onSaveDisposisi,
  onDeleteDisposisi,
  onUpdateSchoolProfile,
  isOpenCreateModal,
  setIsOpenCreateModal,
  preSelectedSuratMasuk,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deletingItem, setDeletingItem] = useState<Disposisi | null>(null);

  // Modal Print State
  const [printingDisposisi, setPrintingDisposisi] = useState<Disposisi | null>(null);

  // Modal Form State
  const [selectedSuratMasukId, setSelectedSuratMasukId] = useState<string>(
    preSelectedSuratMasuk ? preSelectedSuratMasuk.id : ''
  );
  const [diteruskanKepada, setDiteruskanKepada] = useState<JabatanDisposisi[]>([
    'Wakasek Kurikulum',
  ]);
  const [sifat, setSifat] = useState<SifatDisposisi>('Penting');
  const [batasWaktu, setBatasWaktu] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [instruksiCatatan, setInstruksiCatatan] = useState('');
  const [status, setStatus] = useState<StatusDisposisi>('Belum Diproses');
  const [catatanTindakLanjut, setCatatanTindakLanjut] = useState('');

  // Sync selected Surat Masuk details
  const activeSuratMasuk =
    suratMasukList.find((s) => s.id === selectedSuratMasukId) || preSelectedSuratMasuk;

  const toggleJabatan = (jbt: JabatanDisposisi) => {
    if (diteruskanKepada.includes(jbt)) {
      setDiteruskanKepada(diteruskanKepada.filter((x) => x !== jbt));
    } else {
      setDiteruskanKepada([...diteruskanKepada, jbt]);
    }
  };

  const resetForm = () => {
    setSelectedSuratMasukId(suratMasukList.length > 0 ? suratMasukList[0].id : '');
    setDiteruskanKepada(['Wakasek Kurikulum']);
    setSifat('Penting');
    setBatasWaktu(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setInstruksiCatatan('');
    setStatus('Belum Diproses');
    setCatatanTindakLanjut('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSuratMasuk) {
      alert('Mohon pilih Surat Masuk terlebih dahulu!');
      return;
    }
    if (diteruskanKepada.length === 0) {
      alert('Pilih minimal satu penerima disposisi (Diteruskan Kepada)!');
      return;
    }
    if (!instruksiCatatan.trim()) {
      alert('Mohon isi instruksi / catatan Kepala Sekolah!');
      return;
    }

    const newItem: Disposisi = {
      id: `disp-${Date.now()}`,
      suratMasukId: activeSuratMasuk.id,
      nomorSuratMasuk: activeSuratMasuk.nomorSurat,
      perihalSuratMasuk: activeSuratMasuk.perihal,
      pengirimSuratMasuk: activeSuratMasuk.pengirim,
      tanggalSuratMasuk: activeSuratMasuk.tanggalSurat,
      diteruskanKepada,
      sifat,
      batasWaktu,
      instruksiCatatan,
      status,
      catatanTindakLanjut,
      isSyncedToSheet: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveDisposisi(newItem);
    resetForm();
    setIsOpenCreateModal(false);
  };

  const filteredList = disposisiList.filter((item) => {
    const matchSearch =
      item.nomorSuratMasuk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.perihalSuratMasuk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pengirimSuratMasuk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.diteruskanKepada.some((d) => d.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-600" />
            Buku Disposisi Kepala Sekolah
          </h2>
          <p className="text-xs text-slate-500">
            Penerbitan instruksi dan pemantauan tindak lanjut surat masuk
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsOpenCreateModal(true);
          }}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Terbitkan Disposisi Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor surat, pengirim, atau penerima disposisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="ALL">Semua Status</option>
            <option value="Belum Diproses">Belum Diproses</option>
            <option value="Dalam Proses">Dalam Proses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Cards List Disposisi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center text-slate-400 font-medium border border-slate-200/80">
            Tidak ada data disposisi ditemukan.
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {item.nomorSuratMasuk}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Dari: <strong className="text-slate-700">{item.pengirimSuratMasuk}</strong>
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                      item.sifat === 'Sangat Segera'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : item.sifat === 'Penting'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.sifat}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                    {item.perihalSuratMasuk}
                  </h4>
                  <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-600">
                      Diteruskan Kepada:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item.diteruskanKepada.map((jbt) => (
                        <span
                          key={jbt}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                        >
                          {jbt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-slate-700">Instruksi Kepala Sekolah:</p>
                  <p className="text-slate-600 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed text-[11px]">
                    "{item.instruksiCatatan}"
                  </p>
                </div>

                {item.catatanTindakLanjut && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/60">
                    <strong>Tindak Lanjut:</strong> {item.catatanTindakLanjut}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Batas: {formatDateIndonesian(item.batasWaktu)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPrintingDisposisi(item)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Cetak Lembar Disposisi"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak</span>
                  </button>

                  <button
                    onClick={() => {
                      const nextStatus =
                        item.status === 'Belum Diproses'
                          ? 'Dalam Proses'
                          : item.status === 'Dalam Proses'
                          ? 'Selesai'
                          : 'Belum Diproses';
                      onSaveDisposisi({ ...item, status: nextStatus as StatusDisposisi });
                    }}
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
                      item.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : item.status === 'Dalam Proses'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.status}</span>
                  </button>

                  <button
                    onClick={() => setDeletingItem(item)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Disposisi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Terbitkan Disposisi Baru */}
      {isOpenCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-600" />
                Terbitkan Disposisi Kepala Sekolah
              </h3>
              <button
                onClick={() => setIsOpenCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Surat Masuk Terdaftar *
                </label>
                <select
                  value={selectedSuratMasukId}
                  onChange={(e) => setSelectedSuratMasukId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="" disabled>
                    -- Pilih Surat Masuk --
                  </option>
                  {suratMasukList.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.nomorSurat}] - {s.pengirim} ({s.perihal})
                    </option>
                  ))}
                </select>
              </div>

              {activeSuratMasuk && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-800">{activeSuratMasuk.perihal}</p>
                  <p className="text-[11px] text-slate-500">
                    Pengirim: <strong>{activeSuratMasuk.pengirim}</strong> | Tgl Surat:{' '}
                    {formatDateIndonesian(activeSuratMasuk.tanggalSurat)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Diteruskan Kepada (Pilih Pejabat/Staf) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_JABATAN.map((jbt) => {
                    const isChecked = diteruskanKepada.includes(jbt);
                    return (
                      <button
                        type="button"
                        key={jbt}
                        onClick={() => toggleJabatan(jbt)}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '} {jbt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sifat Disposisi *
                  </label>
                  <select
                    value={sifat}
                    onChange={(e) => setSifat(e.target.value as SifatDisposisi)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="Sangat Segera">Sangat Segera</option>
                    <option value="Penting">Penting</option>
                    <option value="Biasa">Biasa</option>
                    <option value="Rahasia">Rahasia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batas Waktu Penyelesaian *
                  </label>
                  <input
                    type="date"
                    required
                    value={batasWaktu}
                    onChange={(e) => setBatasWaktu(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instruksi / Catatan Kepala Sekolah *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Hadir mewakili Kepala Sekolah, siapkan berkas laporan dan koordinasikan..."
                  value={instruksiCatatan}
                  onChange={(e) => setInstruksiCatatan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tindak Lanjut Awal (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Berkas sudah diterima Wakasek Kurikulum..."
                  value={catatanTindakLanjut}
                  onChange={(e) => setCatatanTindakLanjut(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpenCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Simpan & Terbitkan Disposisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Modal */}
      {printingDisposisi && (
        <PrintDisposisiModal
          disposisi={printingDisposisi}
          suratMasuk={suratMasukList.find((s) => s.id === printingDisposisi.suratMasukId)}
          schoolProfile={schoolProfile}
          onUpdateSchoolProfile={onUpdateSchoolProfile}
          onClose={() => setPrintingDisposisi(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        title="Hapus Disposisi"
        itemName={deletingItem ? `Disposisi Surat Masuk: ${deletingItem.nomorSuratMasuk}` : ''}
        description="Apakah Anda yakin ingin menghapus lembar disposisi ini? Status surat masuk terkait akan disesuaikan kembali."
        onConfirm={() => {
          if (deletingItem) {
            onDeleteDisposisi(deletingItem.id);
            setDeletingItem(null);
          }
        }}
        onClose={() => setDeletingItem(null)}
      />
    </div>
  );
};
