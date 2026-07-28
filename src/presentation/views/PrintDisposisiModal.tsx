/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Building2, Check, Edit2, ExternalLink, Printer, Save, X } from 'lucide-react';
import { Disposisi, SchoolProfile, SuratMasuk } from '../../types';
import { formatDateIndonesian } from '../../utils/date';

interface PrintDisposisiModalProps {
  disposisi: Disposisi;
  suratMasuk?: SuratMasuk;
  schoolProfile?: SchoolProfile;
  onUpdateSchoolProfile?: (profile: SchoolProfile) => void;
  onClose: () => void;
}

const DEFAULT_PROFILE: SchoolProfile = {
  namaInstansiPembina: 'PEMERINTAH KOTA BANDUNG • DINAS PENDIDIKAN',
  namaSekolah: 'SMP NEGERI 1 BANDUNG',
  alamatSekolah: 'Jl. Ksatriaan No. 1, Kec. Cicendo',
  teleponSekolah: '(022) 4200000',
  emailSekolah: 'info@smpn1bdg.sch.id',
  kota: 'Bandung',
  namaKepalaSekolah: 'Drs. H. Ahmad Fauzi, M.Pd.',
  nipKepalaSekolah: '19680512 199403 1 004',
  jabatanKepalaSekolah: 'Kepala SMP Negeri 1 Bandung',
};

export const PrintDisposisiModal: React.FC<PrintDisposisiModalProps> = ({
  disposisi,
  suratMasuk,
  schoolProfile = DEFAULT_PROFILE,
  onUpdateSchoolProfile,
  onClose,
}) => {
  const [isEditingKop, setIsEditingKop] = useState(false);
  const [profileForm, setProfileForm] = useState<SchoolProfile>(schoolProfile);
  const [savedNotice, setSavedNotice] = useState(false);

  const handlePrint = () => {
    const printElement = document.getElementById('printable-disposisi');
    if (!printElement) {
      window.print();
      return;
    }

    try {
      // Create hidden iframe for isolated print context
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.title = 'Print Frame';
      document.body.appendChild(iframe);

      const pri = iframe.contentWindow;
      if (pri) {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Lembar Disposisi - ${disposisi.nomorSuratMasuk}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }
                body {
                  background-color: #ffffff !important;
                  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
                  color: #0f172a;
                  padding: 15px;
                }
              </style>
            </head>
            <body>
              <div class="bg-white p-6 border-2 border-slate-900 font-serif text-slate-900 space-y-4 max-w-[210mm] mx-auto">
                ${printElement.innerHTML}
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.focus();
                    window.print();
                  }, 400);
                };
              </script>
            </body>
          </html>
        `;

        pri.document.open();
        pri.document.write(htmlContent);
        pri.document.close();

        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch (e) {
            // ignore
          }
        }, 3000);
        return;
      }
    } catch (err) {
      console.warn('Iframe print error, falling back to direct print', err);
    }

    // Direct window.print fallback
    window.print();
  };

  const handleOpenNewWindow = () => {
    const printElement = document.getElementById('printable-disposisi');
    if (!printElement) return;

    const newWin = window.open('', '_blank');
    if (newWin) {
      newWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Cetak Disposisi - ${disposisi.nomorSuratMasuk}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @page { size: A4 portrait; margin: 10mm; }
              body { background: #fff; padding: 20px; font-family: ui-serif, Georgia, Cambria, serif; }
            </style>
          </head>
          <body>
            <div class="max-w-[210mm] mx-auto p-6 border-2 border-black">
              ${printElement.innerHTML}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.focus();
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      newWin.document.close();
    } else {
      handlePrint();
    }
  };

  const handleSaveKop = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSchoolProfile) {
      onUpdateSchoolProfile(profileForm);
    }
    setIsEditingKop(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const allJabatan = [
    'Wakasek Kurikulum',
    'Wakasek Kesiswaan',
    'Wakasek Humas & Sarpras',
    'Kepala Tata Usaha (TU)',
    'Guru / Wali Kelas',
    'Bendahara Sekolah',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-100 rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-auto max-h-[92vh] flex flex-col">
        {/* Header Controls - Hidden on Print */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-600" />
              Cetak / Preview Lembar Disposisi
            </h3>
            <p className="text-xs text-slate-500">
              Format lembar disposisi cetak resmi A4 untuk arsip fisik tata usaha
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsEditingKop(!isEditingKop)}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                isEditingKop
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditingKop ? 'Tutup Pengaturan Kop' : 'Pengaturan Kop & TTD'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer transition-all"
              title="Cetak langsung melalui dialog cetak browser"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>

            <button
              onClick={handleOpenNewWindow}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-3 py-2 rounded-xl shadow-sm cursor-pointer transition-all"
              title="Buka dokumen di tab/window baru untuk dicetak"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka & Cetak di Tab Baru</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {savedNotice && (
          <div className="print:hidden bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Kop Surat & Nama Kepala Sekolah berhasil diperbarui!</span>
          </div>
        )}

        {/* Form Pengaturan Kop Surat & TTD (In-line Drawer) */}
        {isEditingKop && (
          <div className="print:hidden bg-white rounded-xl p-4 border border-amber-300 shadow-md space-y-3 shrink-0 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-600" />
                Ubah Kop Surat, Nama Sekolah & Penandatangan
              </h4>
              <span className="text-[10px] text-amber-700 font-medium">
                Perubahan langsung diterapkan di preview & disimpan ke database
              </span>
            </div>

            <form onSubmit={handleSaveKop} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Instansi Pembina (Baris Atas Kop)
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.namaInstansiPembina}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, namaInstansiPembina: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Sekolah / Satuan Pendidikan
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.namaSekolah}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, namaSekolah: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Alamat Lengkap Sekolah
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.alamatSekolah}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, alamatSekolah: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nomor Telepon Sekolah
                  </label>
                  <input
                    type="text"
                    value={profileForm.teleponSekolah}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, teleponSekolah: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Resmi Sekolah
                  </label>
                  <input
                    type="email"
                    value={profileForm.emailSekolah}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, emailSekolah: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kota / Kab (Lokasi Surat)
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.kota}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, kota: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Jabatan Penandatangan
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.jabatanKepalaSekolah}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, jabatanKepalaSekolah: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.namaKepalaSekolah}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, namaKepalaSekolah: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-indigo-900 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={profileForm.nipKepalaSekolah}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, nipKepalaSekolah: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setProfileForm(schoolProfile);
                    setIsEditingKop(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-1.5 rounded-lg shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Kop & TTD</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Printable Area - Formatted A4 Sheet */}
        <div className="overflow-y-auto flex-1 p-2 bg-slate-200/60 rounded-xl">
          <div
            id="printable-disposisi"
            className="bg-white p-8 sm:p-10 border-2 border-slate-900 font-serif text-slate-900 space-y-4 max-w-[210mm] mx-auto shadow-lg rounded-xs"
          >
            {/* KOP SEKOLAH */}
            <div className="text-center border-b-4 border-double border-slate-900 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                {profileForm.namaInstansiPembina}
              </h4>
              <h2 className="text-xl font-black uppercase text-slate-900 tracking-wide mt-1">
                {profileForm.namaSekolah}
              </h2>
              <p className="text-[11px] text-slate-600 italic font-sans mt-0.5">
                {profileForm.alamatSekolah}
                {profileForm.teleponSekolah && ` • Telp ${profileForm.teleponSekolah}`}
                {profileForm.emailSekolah && ` • Email: ${profileForm.emailSekolah}`}
              </p>
            </div>

            <div className="text-center py-1">
              <h3 className="text-base font-extrabold underline uppercase tracking-wider">
                LEMBAR DISPOSISI KEPALA SEKOLAH
              </h3>
            </div>

            {/* TABLE INFORMASI SURAT */}
            <table className="w-full text-xs border-collapse border border-slate-900 font-sans">
              <tbody>
                <tr className="border-b border-slate-900">
                  <td className="p-2.5 font-bold w-1/3 bg-slate-50 border-r border-slate-900">
                    Surat Dari / Pengirim:
                  </td>
                  <td className="p-2.5 w-2/3 font-medium">{disposisi.pengirimSuratMasuk}</td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-900">
                    Nomor Surat Masuk:
                  </td>
                  <td className="p-2.5 font-mono font-bold">{disposisi.nomorSuratMasuk}</td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-900">
                    Tanggal Surat & Tanggal Diterima:
                  </td>
                  <td className="p-2.5 font-medium">
                    Tgl Surat: {formatDateIndonesian(disposisi.tanggalSuratMasuk)}
                    {suratMasuk && ` | Diterima: ${formatDateIndonesian(suratMasuk.tanggalDiterima)}`}
                  </td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-900">
                    Perihal Surat:
                  </td>
                  <td className="p-2.5 font-bold">{disposisi.perihalSuratMasuk}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-900">
                    Sifat Disposisi & Batas Waktu:
                  </td>
                  <td className="p-2.5 font-bold text-slate-900">
                    [{disposisi.sifat.toUpperCase()}] • Target Penyelesaian: {formatDateIndonesian(disposisi.batasWaktu)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* TABLE DITERUSKAN KEPADA */}
            <div className="border border-slate-900 p-3 font-sans space-y-2">
              <p className="text-xs font-bold uppercase underline">
                Diteruskan Kepada Yth:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {allJabatan.map((jbt) => {
                  const isSelected = disposisi.diteruskanKepada.includes(jbt as any);
                  return (
                    <div key={jbt} className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 border border-slate-900 inline-flex items-center justify-center font-bold text-[10px] ${
                          isSelected ? 'bg-slate-900 text-white' : ''
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </span>
                      <span className={isSelected ? 'font-bold text-slate-900' : 'text-slate-700'}>
                        {jbt}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CATATAN & INSTRUKSI */}
            <div className="border border-slate-900 p-3 font-sans space-y-2 min-h-[110px]">
              <p className="text-xs font-bold uppercase underline">
                Petunjuk / Catatan Instruksi Kepala Sekolah:
              </p>
              <p className="text-xs font-medium leading-relaxed italic bg-slate-50 p-2.5 rounded border border-slate-200">
                "{disposisi.instruksiCatatan}"
              </p>
            </div>

            {/* TANDA TANGAN */}
            <div className="pt-6 flex items-end justify-between font-sans text-xs">
              <div className="text-[11px] text-slate-600 space-y-1">
                <p>Status Disposisi: <strong>{disposisi.status}</strong></p>
                <p>Tanggal Diterbitkan: {formatDateIndonesian(disposisi.createdAt)}</p>
              </div>
              <div className="text-center w-60 space-y-12">
                <p className="leading-tight">
                  {profileForm.kota}, {formatDateIndonesian(new Date().toISOString())}
                  <br />
                  <strong>{profileForm.jabatanKepalaSekolah}</strong>
                </p>
                <div>
                  <p className="font-bold underline text-sm">{profileForm.namaKepalaSekolah}</p>
                  <p className="text-[10px] text-slate-600 font-mono">
                    NIP. {profileForm.nipKepalaSekolah || '--------------------'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
