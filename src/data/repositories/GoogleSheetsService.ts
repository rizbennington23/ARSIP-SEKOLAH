/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Disposisi, SuratKeluar, SuratMasuk } from '../../types';
import { logger } from '../../utils/logger';

export class GoogleSheetsService {
  /**
   * Cari Google Spreadsheet berdasarkan nama
   */
  async findSpreadsheet(accessToken: string, title: string): Promise<string | null> {
    try {
      const q = `name = '${title}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`;
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) return null;
      const data = await response.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
      return null;
    } catch (err) {
      logger.error('Error saat mencari spreadsheet', { title, error: String(err) });
      return null;
    }
  }

  /**
   * Buat Google Spreadsheet baru beserta Tab default
   */
  async createSpreadsheet(
    accessToken: string,
    title: string,
    parentFolderId?: string
  ): Promise<string> {
    try {
      logger.info(`Membuat Google Spreadsheet '${title}'...`);
      const payload = {
        properties: {
          title: title,
        },
        sheets: [
          { properties: { title: 'Surat_Masuk' } },
          { properties: { title: 'Surat_Keluar' } },
          { properties: { title: 'Disposisi' } },
        ],
      };

      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gagal membuat Spreadsheet (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const spreadsheetId = data.spreadsheetId;

      // Jika ada parent folder, pindahkan file spreadsheet ke parentFolder
      if (parentFolderId && spreadsheetId) {
        try {
          await fetch(
            `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${parentFolderId}&fields=id,parents`,
            {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
        } catch (moveErr) {
          logger.warn('Tidak dapat memindahkan Spreadsheet ke subfolder Drive', {
            error: String(moveErr),
          });
        }
      }

      logger.info(`Spreadsheet '${title}' berhasil dibuat`, { spreadsheetId });
      return spreadsheetId;
    } catch (err) {
      logger.error('Gagal membuat Google Spreadsheet', { title, error: String(err) });
      throw err;
    }
  }

  /**
   * Menyiapkan / Mengecek ketersediaan Google Spreadsheet Arsip Sekolah
   */
  async getOrCreateSpreadsheet(
    accessToken: string,
    parentFolderId?: string
  ): Promise<string> {
    const title = 'ARSIP_SEKOLAH_SPREADSHEET';
    let spreadsheetId = await this.findSpreadsheet(accessToken, title);

    if (spreadsheetId) {
      try {
        await this.ensureSheetsExist(accessToken, spreadsheetId);
        return spreadsheetId;
      } catch (err) {
        logger.warn('Spreadsheet terdaftar tidak dapat diakses atau telah dihapus, membuat ulang...', {
          spreadsheetId,
          error: String(err),
        });
        spreadsheetId = null;
      }
    }

    if (!spreadsheetId) {
      spreadsheetId = await this.createSpreadsheet(accessToken, title, parentFolderId);
    }

    return spreadsheetId;
  }

  /**
   * Memastikan tab sheet (Surat_Masuk, Surat_Keluar, Disposisi) tersedia dalam Spreadsheet
   */
  async ensureSheetsExist(
    accessToken: string,
    spreadsheetId: string,
    requiredTitles: string[] = ['Surat_Masuk', 'Surat_Keluar', 'Disposisi']
  ): Promise<void> {
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gagal membaca metadata Spreadsheet (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const existingTitles: string[] = (data.sheets || []).map(
        (s: { properties?: { title?: string } }) => s.properties?.title || ''
      );

      const missingTitles = requiredTitles.filter((t) => !existingTitles.includes(t));

      if (missingTitles.length > 0) {
        logger.info(`Menambahkan tab sheet yang belum ada: ${missingTitles.join(', ')}...`);
        const requests = missingTitles.map((title) => ({
          addSheet: {
            properties: { title },
          },
        }));

        const batchRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ requests }),
          }
        );

        if (!batchRes.ok) {
          const errText = await batchRes.text();
          logger.warn(`Gagal menambah sheet tab secara otomatis (${batchRes.status}): ${errText}`);
        } else {
          logger.info(`Berhasil menambahkan sheet tab: ${missingTitles.join(', ')}`);
        }
      }
    } catch (err) {
      logger.error('Error saat mengecek/menambah sheet tabs', { error: String(err) });
      throw err;
    }
  }

  /**
   * Update / Sinkronisasi Seluruh Data Surat Masuk ke Google Sheet
   */
  async syncSuratMasuk(
    accessToken: string,
    spreadsheetId: string,
    suratMasukList: SuratMasuk[]
  ): Promise<void> {
    try {
      logger.info('Melakukan sinkronisasi Surat Masuk ke Google Sheets...');

      await this.ensureSheetsExist(accessToken, spreadsheetId, ['Surat_Masuk']);

      // Header Kolom
      const headers = [
        'ID System',
        'Nomor Surat',
        'Tanggal Surat',
        'Tanggal Diterima',
        'Pengirim',
        'Perihal',
        'Kategori',
        'Status Disposisi',
        'Ringkasan',
        'Link File Drive',
        'Terakhir Diperbarui',
      ];

      const rows = suratMasukList.map((item) => [
        String(item.id || ''),
        String(item.nomorSurat || ''),
        String(item.tanggalSurat || ''),
        String(item.tanggalDiterima || ''),
        String(item.pengirim || ''),
        String(item.perihal || ''),
        String(item.kategori || ''),
        String(item.status || ''),
        String(item.ringkasan || ''),
        String(item.attachment?.driveWebViewLink || '-'),
        String(item.updatedAt || ''),
      ]);

      const values = [headers, ...rows];
      const rangeTarget = `Surat_Masuk!A1:K${values.length}`;

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rangeTarget}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range: rangeTarget,
            majorDimension: 'ROWS',
            values,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gagal sync Surat Masuk (${response.status}): ${errText}`);
      }

      logger.info('Surat Masuk berhasil disinkronkan ke Google Sheets');
    } catch (err) {
      logger.error('Error sinkronisasi Surat Masuk ke Sheets', { error: String(err) });
      throw err;
    }
  }

  /**
   * Update / Sinkronisasi Seluruh Data Surat Keluar ke Google Sheet
   */
  async syncSuratKeluar(
    accessToken: string,
    spreadsheetId: string,
    suratKeluarList: SuratKeluar[]
  ): Promise<void> {
    try {
      logger.info('Melakukan sinkronisasi Surat Keluar ke Google Sheets...');

      await this.ensureSheetsExist(accessToken, spreadsheetId, ['Surat_Keluar']);

      const headers = [
        'ID System',
        'Nomor Surat',
        'Tanggal Surat',
        'Penerima Surat',
        'Perihal',
        'Kategori',
        'Penandatangan',
        'Status',
        'Ringkasan',
        'Link File Drive',
        'Terakhir Diperbarui',
      ];

      const rows = suratKeluarList.map((item) => [
        String(item.id || ''),
        String(item.nomorSurat || ''),
        String(item.tanggalSurat || ''),
        String(item.penerima || ''),
        String(item.perihal || ''),
        String(item.kategori || ''),
        String(item.penandatangan || ''),
        String(item.status || ''),
        String(item.ringkasan || ''),
        String(item.attachment?.driveWebViewLink || '-'),
        String(item.updatedAt || ''),
      ]);

      const values = [headers, ...rows];
      const rangeTarget = `Surat_Keluar!A1:K${values.length}`;

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rangeTarget}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range: rangeTarget,
            majorDimension: 'ROWS',
            values,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gagal sync Surat Keluar (${response.status}): ${errText}`);
      }

      logger.info('Surat Keluar berhasil disinkronkan ke Google Sheets');
    } catch (err) {
      logger.error('Error sinkronisasi Surat Keluar ke Sheets', { error: String(err) });
      throw err;
    }
  }

  /**
   * Update / Sinkronisasi Seluruh Data Disposisi ke Google Sheet
   */
  async syncDisposisi(
    accessToken: string,
    spreadsheetId: string,
    disposisiList: Disposisi[]
  ): Promise<void> {
    try {
      logger.info('Melakukan sinkronisasi Disposisi ke Google Sheets...');

      await this.ensureSheetsExist(accessToken, spreadsheetId, ['Disposisi']);

      const headers = [
        'ID Disposisi',
        'ID Surat Masuk',
        'Nomor Surat Masuk',
        'Perihal Surat',
        'Diteruskan Kepada',
        'Sifat Disposisi',
        'Batas Waktu',
        'Instruksi / Catatan',
        'Status Disposisi',
        'Catatan Tindak Lanjut',
        'Terakhir Diperbarui',
      ];

      const rows = disposisiList.map((item) => [
        String(item.id || ''),
        String(item.suratMasukId || ''),
        String(item.nomorSuratMasuk || ''),
        String(item.perihalSuratMasuk || ''),
        Array.isArray(item.diteruskanKepada) ? item.diteruskanKepada.join(', ') : String(item.diteruskanKepada || ''),
        String(item.sifat || ''),
        String(item.batasWaktu || ''),
        String(item.instruksiCatatan || ''),
        String(item.status || ''),
        String(item.catatanTindakLanjut || '-'),
        String(item.updatedAt || ''),
      ]);

      const values = [headers, ...rows];
      const rangeTarget = `Disposisi!A1:K${values.length}`;

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rangeTarget}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range: rangeTarget,
            majorDimension: 'ROWS',
            values,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gagal sync Disposisi (${response.status}): ${errText}`);
      }

      logger.info('Disposisi berhasil disinkronkan ke Google Sheets');
    } catch (err) {
      logger.error('Error sinkronisasi Disposisi ke Sheets', { error: String(err) });
      throw err;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
