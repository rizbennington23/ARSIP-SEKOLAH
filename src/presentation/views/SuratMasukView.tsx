/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ExternalLink,
  FileDown,
  FileText,
  Filter,
  Paperclip,
  Plus,
  PlusCircle,
  Search,
  Send,
  Trash2,
} from 'lucide-react';
import { KategoriSurat, SuratMasuk } from '../../types';
import { formatDateIndonesian } from '../../utils/date';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface SuratMasukViewProps {
  suratMasukList: SuratMasuk[];
  onSaveSuratMasuk: (item: SuratMasuk) => void;
  onDeleteSuratMasuk: (id: string) => void;
  onCreateDisposisiFromSurat: (surat: SuratMasuk) => void;
  isOpenCreateModal: boolean;
  setIsOpenCreateModal: (open: boolean) => void;
}

export const SuratMasukView: React.FC<SuratMasukViewProps> = ({
  suratMasukList,
  onSaveSuratMasuk,
  onDeleteSuratMasuk,
  onCreateDisposisiFromSurat,
  isOpenCreateModal,
  setIsOpenCreateModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [deletingItem, setDeletingItem] = useState<SuratMasuk | null>(null);

  // Form State
  const [nomorSurat, setNomorSurat] = useState('');
  const [pengirim, setPengirim] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState(new Date().toISOString().split('T')[0]);
  const [tanggalDiterima, setTanggalDiterima] = useState(new Date().toISOString().split('T')[0]);
  const [perihal, setPerihal] = useState('');
  const [kategori, setKategori] = useState<KategoriSurat>('Dinas');
  const [ringkasan, setRingkasan] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  } | null>(null);

  const resetForm = () => {
    setNomorSurat('');
    setPengirim('');
    setTanggalSurat(new Date().toISOString().split('T')[0]);
    setTanggalDiterima(new Date().toISOString().split('T')[0]);
    setPerihal('');
    setKategori('Dinas');
    setRingkasan('');
    setAttachmentFile(null);
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
    if (!nomorSurat.trim() || !pengirim.trim() || !perihal.trim()) {
      alert('Mohon lengkapi Nomor Surat, Pengirim, dan Perihal!');
      return;
    }

    const newItem: SuratMasuk = {
      id: `sm-${Date.now()}`,
      nomorSurat,
      pengirim,
      tanggalSurat,
      tanggalDiterima,
      perihal,
      kategori,
      ringkasan,
      status: 'Belum Disposisi',
      attachment: attachmentFile || undefined,
      isSyncedToDrive: false,
      isSyncedToSheet: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveSuratMasuk(newItem);
    resetForm();
    setIsOpenCreateModal(false);
  };

  const filteredList = suratMasukList.filter((item) => {
    const matchSearch =
      item.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pengirim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.perihal.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCat = selectedCategory === 'ALL' || item.kategori === selectedCategory;

    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Header & Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileDown className="w-5 h-5 text-indigo-600" />
            Buku Agenda Surat Masuk
          </h2>
          <p className="text-xs text-slate-500">
            Pencatatan dan pengarsipan surat masuk resmi sekolah
          </p>
        </div>

        <button
          onClick={() => setIsOpenCreateModal(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Surat Masuk Baru</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor surat, pengirim, atau perihal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Dinas">Dinas</option>
            <option value="Undangan">Undangan</option>
            <option value="Edaran">Edaran</option>
            <option value="Permohonan">Permohonan</option>
            <option value="Kebijakan">Kebijakan</option>
            <option value="Tugas">Tugas</option>
          </select>
        </div>
      </div>

      {/* Table Surat Masuk */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">No. Surat & Kategori</th>
                <th className="py-3.5 px-4">Pengirim & Tanggal</th>
                <th className="py-3.5 px-4">Perihal / Ringkasan</th>
                <th className="py-3.5 px-4">Lampiran</th>
                <th className="py-3.5 px-4">Status Disposisi</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada data surat masuk ditemukan.
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
                      <div className="font-semibold text-slate-800">{item.pengirim}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Surat: {formatDateIndonesian(item.tanggalSurat)} <br />
                        Diterima: {formatDateIndonesian(item.tanggalDiterima)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-2">{item.perihal}</div>
                      {item.ringkasan && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">
                          {item.ringkasan}
                        </p>
                      )}
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
                          item.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Terdisposisi'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onCreateDisposisiFromSurat(item)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-lg border border-indigo-200 transition-colors"
                          title="Buat Disposisi Kepala Sekolah"
                        >
                          <Send className="w-3 h-3" />
                          <span>Disposisi</span>
                        </button>
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Surat Masuk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Surat Masuk Baru */}
      {isOpenCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileDown className="w-5 h-5 text-indigo-600" />
                Tambah Surat Masuk Baru
              </h3>
              <button
                onClick={() => setIsOpenCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Surat Masuk *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 005/DISDIK/IV/2026"
                    value={nomorSurat}
                    onChange={(e) => setNomorSurat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Surat *
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as KategoriSurat)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="Dinas">Dinas</option>
                    <option value="Undangan">Undangan</option>
                    <option value="Edaran">Edaran</option>
                    <option value="Permohonan">Permohonan</option>
                    <option value="Kebijakan">Kebijakan</option>
                    <option value="Tugas">Tugas</option>
                    <option value="Pemberitahuan">Pemberitahuan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pengirim Surat (Instansi / Asal) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dinas Pendidikan Kota Bandung"
                  value={pengirim}
                  onChange={(e) => setPengirim(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Surat *
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalSurat}
                    onChange={(e) => setTanggalSurat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Diterima Sekolah *
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalDiterima}
                    onChange={(e) => setTanggalDiterima(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                  placeholder="Contoh: Undangan Rapat Koordinasi ANBK & Kurikulum Merdeka"
                  value={perihal}
                  onChange={(e) => setPerihal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ringkasan / Isi Singkat
                </label>
                <textarea
                  rows={3}
                  placeholder="Ringkasan poin-poin penting isi surat..."
                  value={ringkasan}
                  onChange={(e) => setRingkasan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lampiran Dokumen (PDF, Word, Image)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Surat Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        title="Hapus Surat Masuk"
        itemName={deletingItem ? `No. ${deletingItem.nomorSurat} (${deletingItem.pengirim})` : ''}
        description="Apakah Anda yakin ingin menghapus surat masuk ini? Disposisi terkait juga akan dihapus secara otomatis."
        onConfirm={() => {
          if (deletingItem) {
            onDeleteSuratMasuk(deletingItem.id);
            setDeletingItem(null);
          }
        }}
        onClose={() => setDeletingItem(null)}
      />
    </div>
  );
};
