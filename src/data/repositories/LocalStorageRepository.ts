/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Disposisi,
  GoogleDriveFolderConfig,
  SchoolProfile,
  SuratKeluar,
  SuratMasuk,
  SyncLog,
} from '../../types';
import { logger } from '../../utils/logger';

const STORAGE_KEYS = {
  SURAT_MASUK: 'arsip_sekolah_surat_masuk_v1',
  SURAT_KELUAR: 'arsip_sekolah_surat_keluar_v1',
  DISPOSISI: 'arsip_sekolah_disposisi_v1',
  DRIVE_CONFIG: 'arsip_sekolah_drive_config_v1',
  SYNC_LOGS: 'arsip_sekolah_sync_logs_v1',
  SCHOOL_PROFILE: 'arsip_sekolah_profile_v1',
};

const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
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

// Initial Seed Data
const MOCK_SURAT_MASUK: SuratMasuk[] = [
  {
    id: 'sm-001',
    nomorSurat: '005/DISDIK/IV/2026',
    pengirim: 'Dinas Pendidikan Kota Bandung',
    tanggalSurat: '2026-07-20',
    tanggalDiterima: '2026-07-22',
    perihal: 'Undangan Rapat Koordinasi Evaluasi Kurikulum Merdeka & ANBK 2026',
    kategori: 'Undangan',
    ringkasan: 'Undangan untuk Kepala Sekolah dan Wakasek Kurikulum pada hari Kamis di Aula Disdik Kota Bandung.',
    status: 'Terdisposisi',
    isSyncedToDrive: false,
    isSyncedToSheet: false,
    createdAt: new Date('2026-07-22T08:30:00').toISOString(),
    updatedAt: new Date('2026-07-22T08:30:00').toISOString(),
  },
  {
    id: 'sm-002',
    nomorSurat: '421.2/108/MKKS.SMP/2026',
    pengirim: 'Musyawarah Kerja Kepala Sekolah (MKKS) SMP',
    tanggalSurat: '2026-07-18',
    tanggalDiterima: '2026-07-21',
    perihal: 'Pemberitahuan Pelaksanaan Lomba O2SN & FL2SN Tingkat Subrayon',
    kategori: 'Edaran',
    ringkasan: 'Edaran petunjuk teknis pendataan atlet dan peserta didik pendaftar O2SN & FL2SN SMP tahun 2026.',
    status: 'Terdisposisi',
    isSyncedToDrive: false,
    isSyncedToSheet: false,
    createdAt: new Date('2026-07-21T10:15:00').toISOString(),
    updatedAt: new Date('2026-07-21T10:15:00').toISOString(),
  },
  {
    id: 'sm-003',
    nomorSurat: '800/234/BKN-REG/2026',
    pengirim: 'Badan Kepegawaian Daerah (BKD)',
    tanggalSurat: '2026-07-15',
    tanggalDiterima: '2026-07-19',
    perihal: 'Permohonan Verifikasi Berkas Usulan Kenaikan Pangkat Pendidik & Tenaga Kependidikan',
    kategori: 'Dinas',
    ringkasan: 'Daftar kelengkapan berkas guru sertifikasi untuk periode usul Oktober 2026.',
    status: 'Belum Disposisi',
    isSyncedToDrive: false,
    isSyncedToSheet: false,
    createdAt: new Date('2026-07-19T14:00:00').toISOString(),
    updatedAt: new Date('2026-07-19T14:00:00').toISOString(),
  },
];

const MOCK_SURAT_KELUAR: SuratKeluar[] = [
  {
    id: 'sk-001',
    nomorSurat: '421.2/089/SMP.N1/2026',
    penerima: 'Orang Tua / Wali Murid Kelas VII, VIII & IX',
    tanggalSurat: '2026-07-24',
    perihal: 'Pemberitahuan Pelaksanaan Pertemuan Orang Tua & Sosialisasi Program Sekolah',
    kategori: 'Edaran',
    ringkasan: 'Undangan Rapat Pleno Komite Sekolah & Sosialisasi Kalender Akademik 2026/2027.',
    status: 'Dikirim',
    penandatangan: 'Drs. H. Ahmad Fauzi, M.Pd. (Kepala Sekolah)',
    isSyncedToDrive: false,
    isSyncedToSheet: false,
    createdAt: new Date('2026-07-24T09:00:00').toISOString(),
    updatedAt: new Date('2026-07-24T09:00:00').toISOString(),
  },
  {
    id: 'sk-002',
    nomorSurat: '090/090/SMP.N1/2026',
    penerima: 'Kepala Puskesmas Wilayah Kecamatan',
    tanggalSurat: '2026-07-23',
    perihal: 'Permohonan Pendampingan Pemeriksaan Kesehatan Berkala & Immunisasi Peserta Didik Baru',
    kategori: 'Permohonan',
    ringkasan: 'Permohonan tim medis Puskesmas untuk skrining kesehatan dan pemberian vaksinasi siswa kelas VII.',
    status: 'Dikirim',
    penandatangan: 'Drs. H. Ahmad Fauzi, M.Pd. (Kepala Sekolah)',
    isSyncedToDrive: false,
    isSyncedToSheet: false,
    createdAt: new Date('2026-07-23T11:20:00').toISOString(),
    updatedAt: new Date('2026-07-23T11:20:00').toISOString(),
  },
];

const MOCK_DISPOSISI: Disposisi[] = [
  {
    id: 'disp-001',
    suratMasukId: 'sm-001',
    nomorSuratMasuk: '005/DISDIK/IV/2026',
    perihalSuratMasuk: 'Undangan Rapat Koordinasi Evaluasi Kurikulum Merdeka & ANBK 2026',
    pengirimSuratMasuk: 'Dinas Pendidikan Kota Bandung',
    tanggalSuratMasuk: '2026-07-20',
    diteruskanKepada: ['Wakasek Kurikulum', 'Kepala Tata Usaha (TU)'],
    sifat: 'Sangat Segera',
    batasWaktu: '2026-07-29',
    instruksiCatatan: 'Hadir mewakili Kepala Sekolah, siapkan data ketercapaian ANBK tahun lalu & laporan evaluasi.',
    status: 'Dalam Proses',
    catatanTindakLanjut: 'Berkas materi paparan sedang disiapkan oleh Tim Kurikulum.',
    isSyncedToSheet: false,
    createdAt: new Date('2026-07-22T09:00:00').toISOString(),
    updatedAt: new Date('2026-07-22T09:00:00').toISOString(),
  },
  {
    id: 'disp-002',
    suratMasukId: 'sm-002',
    nomorSuratMasuk: '421.2/108/MKKS.SMP/2026',
    perihalSuratMasuk: 'Pemberitahuan Pelaksanaan Lomba O2SN & FL2SN Tingkat Subrayon',
    pengirimSuratMasuk: 'Musyawarah Kerja Kepala Sekolah (MKKS) SMP',
    tanggalSuratMasuk: '2026-07-18',
    diteruskanKepada: ['Wakasek Kesiswaan', 'Guru / Wali Kelas'],
    sifat: 'Penting',
    batasWaktu: '2026-07-31',
    instruksiCatatan: 'Koordinasikan seleksi internal siswa dan segera kirimkan daftar nama peserta lomba.',
    status: 'Belum Diproses',
    isSyncedToSheet: false,
    createdAt: new Date('2026-07-21T11:00:00').toISOString(),
    updatedAt: new Date('2026-07-21T11:00:00').toISOString(),
  },
];

export class LocalStorageRepository {
  constructor() {
    this.initSeedData();
  }

  private initSeedData() {
    if (!localStorage.getItem(STORAGE_KEYS.SURAT_MASUK)) {
      localStorage.setItem(STORAGE_KEYS.SURAT_MASUK, JSON.stringify(MOCK_SURAT_MASUK));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SURAT_KELUAR)) {
      localStorage.setItem(STORAGE_KEYS.SURAT_KELUAR, JSON.stringify(MOCK_SURAT_KELUAR));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DISPOSISI)) {
      localStorage.setItem(STORAGE_KEYS.DISPOSISI, JSON.stringify(MOCK_DISPOSISI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCHOOL_PROFILE)) {
      localStorage.setItem(STORAGE_KEYS.SCHOOL_PROFILE, JSON.stringify(DEFAULT_SCHOOL_PROFILE));
    }
  }

  // --- SCHOOL PROFILE ---
  getSchoolProfile(): SchoolProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHOOL_PROFILE);
      return data ? { ...DEFAULT_SCHOOL_PROFILE, ...JSON.parse(data) } : DEFAULT_SCHOOL_PROFILE;
    } catch (err) {
      logger.error('Error membaca School Profile dari LocalStorage', { error: String(err) });
      return DEFAULT_SCHOOL_PROFILE;
    }
  }

  saveSchoolProfile(profile: SchoolProfile): SchoolProfile {
    localStorage.setItem(STORAGE_KEYS.SCHOOL_PROFILE, JSON.stringify(profile));
    logger.info('Profil Sekolah dan Kop Surat berhasil diperbarui');
    return profile;
  }

  // --- SURAT MASUK ---
  getSuratMasuk(): SuratMasuk[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SURAT_MASUK);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      logger.error('Error membaca Surat Masuk dari LocalStorage', { error: String(err) });
      return [];
    }
  }

  saveSuratMasuk(item: SuratMasuk): SuratMasuk {
    const list = this.getSuratMasuk();
    const index = list.findIndex((x) => x.id === item.id);
    if (index >= 0) {
      list[index] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(STORAGE_KEYS.SURAT_MASUK, JSON.stringify(list));
    logger.info(`Surat Masuk '${item.nomorSurat}' berhasil disimpan`);
    return item;
  }

  deleteSuratMasuk(id: string): void {
    let list = this.getSuratMasuk();
    list = list.filter((x) => x.id !== id);
    localStorage.setItem(STORAGE_KEYS.SURAT_MASUK, JSON.stringify(list));

    // Hapus disposisi terkait
    let disposisiList = this.getDisposisi();
    disposisiList = disposisiList.filter((d) => d.suratMasukId !== id);
    localStorage.setItem(STORAGE_KEYS.DISPOSISI, JSON.stringify(disposisiList));

    logger.info(`Surat Masuk ID '${id}' dan disposisinya telah dihapus`);
  }

  // --- SURAT KELUAR ---
  getSuratKeluar(): SuratKeluar[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SURAT_KELUAR);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      logger.error('Error membaca Surat Keluar dari LocalStorage', { error: String(err) });
      return [];
    }
  }

  saveSuratKeluar(item: SuratKeluar): SuratKeluar {
    const list = this.getSuratKeluar();
    const index = list.findIndex((x) => x.id === item.id);
    if (index >= 0) {
      list[index] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(STORAGE_KEYS.SURAT_KELUAR, JSON.stringify(list));
    logger.info(`Surat Keluar '${item.nomorSurat}' berhasil disimpan`);
    return item;
  }

  deleteSuratKeluar(id: string): void {
    let list = this.getSuratKeluar();
    list = list.filter((x) => x.id !== id);
    localStorage.setItem(STORAGE_KEYS.SURAT_KELUAR, JSON.stringify(list));
    logger.info(`Surat Keluar ID '${id}' telah dihapus`);
  }

  // --- DISPOSISI ---
  getDisposisi(): Disposisi[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DISPOSISI);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      logger.error('Error membaca Disposisi dari LocalStorage', { error: String(err) });
      return [];
    }
  }

  saveDisposisi(item: Disposisi): Disposisi {
    const list = this.getDisposisi();
    const index = list.findIndex((x) => x.id === item.id);

    if (index >= 0) {
      list[index] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(STORAGE_KEYS.DISPOSISI, JSON.stringify(list));

    // Update status Surat Masuk terkait
    const suratMasukList = this.getSuratMasuk();
    const smIndex = suratMasukList.findIndex((s) => s.id === item.suratMasukId);
    if (smIndex >= 0) {
      suratMasukList[smIndex].status = item.status === 'Selesai' ? 'Selesai' : 'Terdisposisi';
      suratMasukList[smIndex].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.SURAT_MASUK, JSON.stringify(suratMasukList));
    }

    logger.info(`Disposisi untuk Surat '${item.nomorSuratMasuk}' berhasil disimpan`);
    return item;
  }

  deleteDisposisi(id: string): void {
    let list = this.getDisposisi();
    const target = list.find((x) => x.id === id);
    list = list.filter((x) => x.id !== id);
    localStorage.setItem(STORAGE_KEYS.DISPOSISI, JSON.stringify(list));

    // Jika tidak ada disposisi tersisa untuk Surat Masuk terkait, kembalikan status ke 'Belum Disposisi'
    if (target) {
      const remainingForSm = list.filter((x) => x.suratMasukId === target.suratMasukId);
      if (remainingForSm.length === 0) {
        const smList = this.getSuratMasuk();
        const smIndex = smList.findIndex((s) => s.id === target.suratMasukId);
        if (smIndex >= 0) {
          smList[smIndex].status = 'Belum Disposisi';
          localStorage.setItem(STORAGE_KEYS.SURAT_MASUK, JSON.stringify(smList));
        }
      }
    }

    logger.info(`Disposisi ID '${id}' telah dihapus`);
  }

  // --- DRIVE CONFIG & LOGS ---
  getDriveConfig(): GoogleDriveFolderConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRIVE_CONFIG);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  saveDriveConfig(config: GoogleDriveFolderConfig): void {
    localStorage.setItem(STORAGE_KEYS.DRIVE_CONFIG, JSON.stringify(config));
  }

  getSyncLogs(): SyncLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addSyncLog(log: Omit<SyncLog, 'id' | 'timestamp'>): void {
    const logs = this.getSyncLogs();
    logs.unshift({
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    });
    if (logs.length > 50) logs.pop();
    localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(logs));
  }
}

export const localStorageRepository = new LocalStorageRepository();
