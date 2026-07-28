/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleDriveFolderConfig } from '../../types';
import { logger } from '../../utils/logger';

export class GoogleDriveService {
  /**
   * Cari folder berdasarkan nama & parent
   */
  async findFolder(
    accessToken: string,
    folderName: string,
    parentId?: string
  ): Promise<string | null> {
    try {
      let q = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
      if (parentId) {
        q += ` and '${parentId}' in parents`;
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Drive API query failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
      return null;
    } catch (err) {
      logger.error('Gagal memproses pencarian folder Drive', { folderName, error: String(err) });
      return null;
    }
  }

  /**
   * Buat folder baru di Google Drive
   */
  async createFolder(
    accessToken: string,
    folderName: string,
    parentId?: string
  ): Promise<string> {
    try {
      const metadata: Record<string, unknown> = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };
      if (parentId) {
        metadata.parents = [parentId];
      }

      const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal membuat folder (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      logger.info(`Folder Drive '${folderName}' berhasil dibuat`, { id: data.id });
      return data.id;
    } catch (err) {
      logger.error('Error membuat folder di Google Drive', { folderName, error: String(err) });
      throw err;
    }
  }

  /**
   * Menyiapkan struktur folder Arsip Sekolah secara otomatis
   */
  async setupFolderStructure(accessToken: string): Promise<GoogleDriveFolderConfig> {
    logger.info('Mengecek / menyiapkan struktur folder Arsip Sekolah di Google Drive...');

    // 1. Root folder: ARSIP_SEKOLAH_DIGITAL
    let rootFolderId = await this.findFolder(accessToken, 'ARSIP_SEKOLAH_DIGITAL');
    if (!rootFolderId) {
      rootFolderId = await this.createFolder(accessToken, 'ARSIP_SEKOLAH_DIGITAL');
    }

    // 2. Subfolder Surat Masuk
    let suratMasukFolderId = await this.findFolder(accessToken, 'Surat_Masuk', rootFolderId);
    if (!suratMasukFolderId) {
      suratMasukFolderId = await this.createFolder(accessToken, 'Surat_Masuk', rootFolderId);
    }

    // 3. Subfolder Surat Keluar
    let suratKeluarFolderId = await this.findFolder(accessToken, 'Surat_Keluar', rootFolderId);
    if (!suratKeluarFolderId) {
      suratKeluarFolderId = await this.createFolder(accessToken, 'Surat_Keluar', rootFolderId);
    }

    return {
      rootFolderId,
      suratMasukFolderId,
      suratKeluarFolderId,
      lastSyncTime: new Date().toISOString(),
    };
  }

  /**
   * Upload file lampiran surat ke Google Drive
   */
  async uploadFile(
    accessToken: string,
    fileName: string,
    fileType: string,
    base64Data: string,
    targetFolderId: string
  ): Promise<{ fileId: string; webViewLink: string }> {
    try {
      logger.info(`Mengunggah file '${fileName}' ke Google Drive...`);

      // Decodifikasi base64 dataURL
      const base64Content = base64Data.includes('base64,')
        ? base64Data.split('base64,')[1]
        : base64Data;

      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const fileBlob = new Blob([byteArray], { type: fileType || 'application/octet-stream' });

      const metadata = {
        name: fileName,
        parents: [targetFolderId],
      };

      const formData = new FormData();
      formData.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' })
      );
      formData.append('file', fileBlob);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal mengunggah file (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      logger.info(`File '${fileName}' berhasil diunggah ke Google Drive`, { fileId: data.id });
      return {
        fileId: data.id,
        webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
      };
    } catch (err) {
      logger.error('Gagal mengunggah file ke Drive', { fileName, error: String(err) });
      throw err;
    }
  }
}

export const googleDriveService = new GoogleDriveService();
