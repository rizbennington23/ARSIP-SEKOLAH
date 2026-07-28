/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { googleDriveService } from '../../data/repositories/GoogleDriveService';
import { googleSheetsService } from '../../data/repositories/GoogleSheetsService';
import { localStorageRepository } from '../../data/repositories/LocalStorageRepository';
import { Disposisi, SuratKeluar, SuratMasuk } from '../../types';
import { logger } from '../../utils/logger';

export interface DashboardStats {
  totalSuratMasuk: number;
  totalSuratKeluar: number;
  totalDisposisiAktif: number;
  totalDisposisiSelesai: number;
  syncPercent: number;
}

export class SuratUseCases {
  /**
   * Hitung statistik ringkasan untuk Dashboard
   */
  getDashboardStats(): DashboardStats {
    const suratMasukList = localStorageRepository.getSuratMasuk();
    const suratKeluarList = localStorageRepository.getSuratKeluar();
    const disposisiList = localStorageRepository.getDisposisi();

    const totalMasuk = suratMasukList.length;
    const totalKeluar = suratKeluarList.length;
    const totalItems = totalMasuk + totalKeluar;

    const totalDisposisiAktif = disposisiList.filter((d) => d.status !== 'Selesai').length;
    const totalDisposisiSelesai = disposisiList.filter((d) => d.status === 'Selesai').length;

    const syncedItems =
      suratMasukList.filter((s) => s.isSyncedToSheet).length +
      suratKeluarList.filter((s) => s.isSyncedToSheet).length;

    const syncPercent = totalItems > 0 ? Math.round((syncedItems / totalItems) * 100) : 0;

    return {
      totalSuratMasuk: totalMasuk,
      totalSuratKeluar: totalKeluar,
      totalDisposisiAktif,
      totalDisposisiSelesai,
      syncPercent,
    };
  }

  /**
   * Jalankan Proses Sinkronisasi Otomatis Seluruh Data ke Google Drive & Google Sheets
   */
  async runFullGoogleSync(accessToken: string): Promise<{
    success: boolean;
    folderId?: string;
    spreadsheetId?: string;
    message: string;
  }> {
    try {
      logger.info('Memulai alur Sinkronisasi Otomatis Google Drive & Sheets...');

      // 1. Siapkan / Cari Struktur Folder Drive
      const folderConfig = await googleDriveService.setupFolderStructure(accessToken);

      // 2. Siapkan / Cari Spreadsheet Google Sheets
      const spreadsheetId = await googleSheetsService.getOrCreateSpreadsheet(
        accessToken,
        folderConfig.rootFolderId
      );

      folderConfig.spreadsheetId = spreadsheetId;
      localStorageRepository.saveDriveConfig(folderConfig);

      // 3. Dapatkan seluruh data lokal
      const suratMasukList = localStorageRepository.getSuratMasuk();
      const suratKeluarList = localStorageRepository.getSuratKeluar();
      const disposisiList = localStorageRepository.getDisposisi();

      // 4. Unggah attachment file Surat Masuk jika ada yang belum diunggah ke Drive
      for (const sm of suratMasukList) {
        if (sm.attachment?.dataUrl && !sm.attachment.driveFileId && folderConfig.suratMasukFolderId) {
          try {
            const driveRes = await googleDriveService.uploadFile(
              accessToken,
              `SURAT_MASUK_${sm.nomorSurat.replace(/[/\\?%*:|"<>]/g, '_')}_${sm.attachment.name}`,
              sm.attachment.type,
              sm.attachment.dataUrl,
              folderConfig.suratMasukFolderId
            );
            sm.attachment.driveFileId = driveRes.fileId;
            sm.attachment.driveWebViewLink = driveRes.webViewLink;
            sm.isSyncedToDrive = true;
            localStorageRepository.saveSuratMasuk(sm);
          } catch (uploadErr) {
            logger.warn(`Gagal upload lampiran Surat Masuk '${sm.nomorSurat}'`, {
              error: String(uploadErr),
            });
          }
        }
      }

      // 5. Unggah attachment file Surat Keluar jika ada yang belum diunggah ke Drive
      for (const sk of suratKeluarList) {
        if (sk.attachment?.dataUrl && !sk.attachment.driveFileId && folderConfig.suratKeluarFolderId) {
          try {
            const driveRes = await googleDriveService.uploadFile(
              accessToken,
              `SURAT_KELUAR_${sk.nomorSurat.replace(/[/\\?%*:|"<>]/g, '_')}_${sk.attachment.name}`,
              sk.attachment.type,
              sk.attachment.dataUrl,
              folderConfig.suratKeluarFolderId
            );
            sk.attachment.driveFileId = driveRes.fileId;
            sk.attachment.driveWebViewLink = driveRes.webViewLink;
            sk.isSyncedToDrive = true;
            localStorageRepository.saveSuratKeluar(sk);
          } catch (uploadErr) {
            logger.warn(`Gagal upload lampiran Surat Keluar '${sk.nomorSurat}'`, {
              error: String(uploadErr),
            });
          }
        }
      }

      // 6. Sinkronkan seluruh data ke Google Sheets
      let activeSpreadsheetId = spreadsheetId;
      try {
        await googleSheetsService.syncSuratMasuk(accessToken, activeSpreadsheetId, suratMasukList);
      } catch (smErr) {
        const smErrMsg = String(smErr);
        if (smErrMsg.includes('404')) {
          logger.warn('Spreadsheet 404 saat sync, membuat spreadsheet baru...', { error: smErrMsg });
          activeSpreadsheetId = await googleSheetsService.createSpreadsheet(
            accessToken,
            'ARSIP_SEKOLAH_SPREADSHEET',
            folderConfig.rootFolderId
          );
          folderConfig.spreadsheetId = activeSpreadsheetId;
          localStorageRepository.saveDriveConfig(folderConfig);
          await googleSheetsService.syncSuratMasuk(accessToken, activeSpreadsheetId, suratMasukList);
        } else {
          throw smErr;
        }
      }

      await googleSheetsService.syncSuratKeluar(accessToken, activeSpreadsheetId, suratKeluarList);
      await googleSheetsService.syncDisposisi(accessToken, activeSpreadsheetId, disposisiList);

      // 7. Tandai item sebagai ter-sync
      const updatedMasuk = suratMasukList.map((item) => ({ ...item, isSyncedToSheet: true }));
      updatedMasuk.forEach((item) => localStorageRepository.saveSuratMasuk(item));

      const updatedKeluar = suratKeluarList.map((item) => ({ ...item, isSyncedToSheet: true }));
      updatedKeluar.forEach((item) => localStorageRepository.saveSuratKeluar(item));

      const updatedDisposisi = disposisiList.map((item) => ({ ...item, isSyncedToSheet: true }));
      updatedDisposisi.forEach((item) => localStorageRepository.saveDisposisi(item));

      // Catat log sinkronisasi
      localStorageRepository.addSyncLog({
        type: 'FULL_SYNC',
        targetName: 'Google Drive & Sheets',
        status: 'SUCCESS',
        details: `Berhasil sinkronisasi ${suratMasukList.length} Surat Masuk, ${suratKeluarList.length} Surat Keluar, ${disposisiList.length} Disposisi.`,
      });

      return {
        success: true,
        folderId: folderConfig.rootFolderId,
        spreadsheetId,
        message: 'Sinkronisasi ke Google Drive & Sheets berhasil dilaksanakan secara otomatis!',
      };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logger.error('Gagal menjalankan sinkronisasi penuh ke Google', { error: errMsg });

      localStorageRepository.addSyncLog({
        type: 'FULL_SYNC',
        targetName: 'Google Drive & Sheets',
        status: 'ERROR',
        details: errMsg,
      });

      return {
        success: false,
        message: `Gagal sinkronisasi: ${errMsg}`,
      };
    }
  }
}

export const suratUseCases = new SuratUseCases();
