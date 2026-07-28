/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type KategoriSurat =
  | 'Dinas'
  | 'Undangan'
  | 'Edaran'
  | 'Permohonan'
  | 'Kebijakan'
  | 'Tugas'
  | 'Pemberitahuan'
  | 'Lainnya';

export type StatusSuratMasuk = 'Belum Disposisi' | 'Terdisposisi' | 'Selesai';

export type StatusSuratKeluar = 'Draft' | 'Dikirim' | 'Selesai';

export type SifatDisposisi = 'Biasa' | 'Penting' | 'Rahasia' | 'Sangat Segera';

export type StatusDisposisi = 'Belum Diproses' | 'Dalam Proses' | 'Selesai';

export type JabatanDisposisi =
  | 'Wakasek Kurikulum'
  | 'Wakasek Kesiswaan'
  | 'Wakasek Humas & Sarpras'
  | 'Kepala Tata Usaha (TU)'
  | 'Guru / Wali Kelas'
  | 'Bendahara Sekolah'
  | 'Tim Kurikulum'
  | 'Tim Kesiswaan';

export interface SuratAttachment {
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // Base64 data for local preview
  driveFileId?: string; // ID File di Google Drive
  driveWebViewLink?: string; // Link preview Google Drive
}

export interface SuratMasuk {
  id: string;
  nomorSurat: string;
  pengirim: string;
  tanggalSurat: string; // YYYY-MM-DD
  tanggalDiterima: string; // YYYY-MM-DD
  perihal: string;
  kategori: KategoriSurat;
  ringkasan: string;
  status: StatusSuratMasuk;
  attachment?: SuratAttachment;
  isSyncedToDrive: boolean;
  isSyncedToSheet: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SuratKeluar {
  id: string;
  nomorSurat: string;
  penerima: string;
  tanggalSurat: string; // YYYY-MM-DD
  perihal: string;
  kategori: KategoriSurat;
  ringkasan: string;
  status: StatusSuratKeluar;
  penandatangan: string;
  attachment?: SuratAttachment;
  isSyncedToDrive: boolean;
  isSyncedToSheet: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Disposisi {
  id: string;
  suratMasukId: string;
  nomorSuratMasuk: string;
  perihalSuratMasuk: string;
  pengirimSuratMasuk: string;
  tanggalSuratMasuk: string;
  diteruskanKepada: JabatanDisposisi[];
  sifat: SifatDisposisi;
  batasWaktu: string; // YYYY-MM-DD
  instruksiCatatan: string;
  status: StatusDisposisi;
  catatanTindakLanjut?: string;
  isSyncedToSheet: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleDriveFolderConfig {
  rootFolderId?: string;
  suratMasukFolderId?: string;
  suratKeluarFolderId?: string;
  spreadsheetId?: string;
  lastSyncTime?: string;
}

export interface SchoolProfile {
  namaInstansiPembina: string;
  namaSekolah: string;
  alamatSekolah: string;
  teleponSekolah: string;
  emailSekolah: string;
  kota: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  jabatanKepalaSekolah: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'DRIVE_FILE' | 'SPREADSHEET_ROW' | 'FULL_SYNC';
  targetName: string;
  status: 'SUCCESS' | 'ERROR' | 'IN_PROGRESS';
  details?: string;
}
