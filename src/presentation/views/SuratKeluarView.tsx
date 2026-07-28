/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ExternalLink,
  FileText,
  FileUp,
  Filter,
  Paperclip,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { KategoriSurat, StatusSuratKeluar, SuratKeluar } from '../../types';
import { formatDateIndonesian } from '../../utils/date';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface SuratKeluarViewProps {
  suratKeluarList: SuratKeluar[];
  onSaveSuratKeluar: (item: SuratKeluar) => void;
  onDeleteSuratKeluar: (id: string) => void;
  isOpenCreateModal: boolean;
  setIsOpenCreateModal: (open: boolean) => void;
}

export const SuratKeluarView: React.FC<SuratKeluarViewProps> = ({
  suratKeluarList,
  onSaveSuratKeluar,
  onDeleteSuratKeluar,
  isOpenCreateModal,
  setIsOpenCreateModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [deletingItem, setDeletingItem] = useState<SuratKeluar | null>(null);

  // Form State
  const [nomorSurat, setNomorSurat] = useState('');
  const [penerima, setPenerima] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState(new Date().toISOString().split('T')[0]);
  const [perihal, setPerihal] = useState('');
  const [kategori, setKategori] = useState<KategoriSurat>('Edaran');
  const [status, setStatus] = useState<StatusSuratKeluar>('Dikirim');
  const [penandatangan, setPenandatangan] = useState('Drs. H. Ahmad Fauzi, M.Pd. (Kepala Sekolah)');
  const [ringkasan, setRingkasan] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  } | null>(null);

  const resetForm = () => {
    setNomorSurat('');
    setPenerima('');
    setTanggalSurat(new Date().toISOString().split('T')[0]);
    setPerihal('');
    setKategori('Edaran');
    setStatus('Dikirim');
    setPenandatangan('Drs. H. Ahmad Fauzi, M.Pd. (Kepala Sekolah)');
    setRingkasan('');
    setAttachmentFile(null);
  };

  const handleGenerateNomorAuto = () => {
    const nextNum = String(suratKeluarList.length + 1).padStart(3, '0');
    const year = new Date().getFullYear();
    setNomorSurat(`421.2/${nextNum}/SMP.N1/${year}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentFile({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorSurat.trim() || !penerima.trim() || !perihal.trim()) {
      alert('Mohon lengkapi Nomor Surat, Penerima, dan Perihal!');
      return;
    }

    const newItem: SuratKeluar = {
      id: `sk-${Date.now()}`,
      nomorSurat,
      penerima,
      tanggalSurat,
      perihal,
      kategori,
      ringkasan,
      status,
      penandatangan,
      attachment: attachmentFile || undefined,
      isSyncedToDrive: false,
      isSyncedToSheet: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveSuratKeluar(newItem);
    resetForm();
    setIsOpenCreateModal(false);
  };

  const filteredList = suratKeluarList.filter((item) => {
    const matchSearch =
      item.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.penerima.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.perihal.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCat = selectedCategory === 'ALL' || item.kategori === selectedCategory;

    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileUp className="w-5 h-5 text-emerald-600" />
            Buku Agenda Surat Keluar
          </h2>
          <p className="text-xs text-slate-500">
            Pencatatan dan penerbitan surat resmi yang dikeluarkan sekolah
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            handleGenerateNomorAuto();
            setIsOpenCreateModal(true);
          }}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Surat Keluar Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor surat, penerima, atau perihal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Edaran">Edaran</option>
            <option value="Permohonan">Permohonan</option>
            <option value="Undangan">Undangan</option>
            <option value="Dinas">Dinas</option>
            <option value="Tugas">Tugas</option>
          </select>
        </div>
      </div>

      {/* Table Surat Keluar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">No. Surat & Kategori</th>
                <th className="py-3.5 px-4">Penerima & Tanggal</th>
                <th className="py-3.5 px-4">Perihal / Penandatangan</th>
                <th className="py-3.5 px-4">Lampiran File</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada data surat keluar ditemukan.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 font-mono">{item.nomorSurat}</div>
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{item.penerima}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Tanggal: {formatDateIndonesian(item.tanggalSurat)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-2">{item.perihal}</div>
                      <p className="text-[11px] text-indigo-700 font-medium mt-1">
                        Ttd: {item.penandatangan}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.attachment ? (
                        item.attachment.driveWebViewLink ? (
                          <a
                            href={item.attachment.driveWebViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Lihat di Drive</span>
                            <ExternalLink className="w-3 h-3 text-emerald-500" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                            <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate max-w-[120px]">{item.attachment.name}</span>
                          </span>
                        )
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Tidak ada</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          item.status === 'Dikirim' || item.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Surat Keluar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Surat Keluar */}
      {isOpenCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileUp className="w-5 h-5 text-emerald-600" />
                Terbitkan Surat Keluar Baru
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Nomor Surat Keluar *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateNomorAuto}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    + Generate Format Urut Sekolah
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 421.2/089/SMP.N1/2026"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Surat *
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as KategoriSurat)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Edaran">Edaran</option>
                    <option value="Permohonan">Permohonan</option>
                    <option value="Undangan">Undangan</option>
                    <option value="Dinas">Dinas</option>
                    <option value="Tugas">Tugas</option>
                    <option value="Pemberitahuan">Pemberitahuan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Surat *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusSuratKeluar)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Dikirim">Dikirim / Terbit</option>
                    <option value="Draft">Draft Konsultasi</option>
                    <option value="Selesai">Selesai / Terarsip</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penerima Surat / Tujuan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Orang Tua / Wali Murid Kelas VII, VIII & IX"
                  value={penerima}
                  onChange={(e) => setPenerima(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Terbit Surat *
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalSurat}
                    onChange={(e) => setTanggalSurat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Penandatangan *
                  </label>
                  <input
                    type="text"
                    required
                    value={penandatangan}
                    onChange={(e) => setPenandatangan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Perihal Surat *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemberitahuan Pertemuan Komite Sekolah & Sosialisasi Program"
                  value={perihal}
                  onChange={(e) => setPerihal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ringkasan Isi / Catatan
                </label>
                <textarea
                  rows={3}
                  placeholder="Ringkasan poin-poin keputusan atau isi surat..."
                  value={ringkasan}
                  onChange={(e) => setRingkasan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lampiran Dokumen Keluar (PDF, Word)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
                {attachmentFile && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    ✓ File terpilih: {attachmentFile.name} (
                    {Math.round(attachmentFile.size / 1024)} KB)
                  </p>
                )}
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Simpan & Terbitkan Surat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        title="Hapus Surat Keluar"
        itemName={deletingItem ? `No. ${deletingItem.nomorSurat} (${deletingItem.penerima})` : ''}
        description="Apakah Anda yakin ingin menghapus surat keluar ini dari agenda digital?"
        onConfirm={() => {
          if (deletingItem) {
            onDeleteSuratKeluar(deletingItem.id);
            setDeletingItem(null);
          }
        }}
        onClose={() => setDeletingItem(null)}
      />
    </div>
  );
};
