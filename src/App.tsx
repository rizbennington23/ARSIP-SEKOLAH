/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';

import { localStorageRepository } from './data/repositories/LocalStorageRepository';
import { suratUseCases } from './domain/usecases/SuratUseCases';
import {
  Disposisi,
  GoogleDriveFolderConfig,
  SchoolProfile,
  SuratKeluar,
  SuratMasuk,
  SyncLog,
} from './types';
import {
  AppUser,
  DEFAULT_OPERATOR_USER,
  getAccessToken,
  initAuthListener,
  setAccessToken,
  setAutoLoginActive,
} from './utils/auth';
import { logger } from './utils/logger';

// Presentation
import { GoogleAuthBanner } from './presentation/components/GoogleAuthBanner';
import { Header } from './presentation/components/Header';
import { NavTab, Sidebar } from './presentation/components/Sidebar';
import { AuditLogsView } from './presentation/views/AuditLogsView';
import { DashboardView } from './presentation/views/DashboardView';
import { DisposisiView } from './presentation/views/DisposisiView';
import { DriveSyncView } from './presentation/views/DriveSyncView';
import { SchoolSettingsView } from './presentation/views/SchoolSettingsView';
import { SuratKeluarView } from './presentation/views/SuratKeluarView';
import { SuratMasukView } from './presentation/views/SuratMasukView';

export default function App() {
  const [user, setUser] = useState<User | AppUser | null>(DEFAULT_OPERATOR_USER);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Domain Data State
  const [suratMasukList, setSuratMasukList] = useState<SuratMasuk[]>([]);
  const [suratKeluarList, setSuratKeluarList] = useState<SuratKeluar[]>([]);
  const [disposisiList, setDisposisiList] = useState<Disposisi[]>([]);
  const [driveConfig, setDriveConfig] = useState<GoogleDriveFolderConfig>({});
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(
    localStorageRepository.getSchoolProfile()
  );
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals Controls State
  const [isOpenCreateSuratMasuk, setIsOpenCreateSuratMasuk] = useState(false);
  const [isOpenCreateSuratKeluar, setIsOpenCreateSuratKeluar] = useState(false);
  const [isOpenCreateDisposisi, setIsOpenCreateDisposisi] = useState(false);
  const [preSelectedSuratMasuk, setPreSelectedSuratMasuk] = useState<SuratMasuk | null>(null);

  // Load Data SSOT from Repository
  const refreshData = () => {
    setSuratMasukList(localStorageRepository.getSuratMasuk());
    setSuratKeluarList(localStorageRepository.getSuratKeluar());
    setDisposisiList(localStorageRepository.getDisposisi());
    setDriveConfig(localStorageRepository.getDriveConfig());
    setSchoolProfile(localStorageRepository.getSchoolProfile());
    setSyncLogs(localStorageRepository.getSyncLogs());
  };

  useEffect(() => {
    refreshData();

    // Initialize Auth Listener
    const unsubscribe = initAuthListener(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessTokenState(token);
        logger.info('Auth listener aktif', { user: currentUser.email });
      },
      () => {
        setUser(null);
        setAccessTokenState(null);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAuthChange = (newUser: User | AppUser | null, newToken: string | null) => {
    setUser(newUser);
    setAccessTokenState(newToken);
    setAccessToken(newToken);

    if (newUser) {
      setAutoLoginActive(true);
    }

    if (newToken) {
      // Auto Sync upon initial login
      handleTriggerSync(newToken);
    }
  };

  // Trigger Google Drive & Sheets Sync
  const handleTriggerSync = async (overrideToken?: string) => {
    const token = overrideToken || accessToken || getAccessToken();
    if (!token) {
      alert('Silakan hubungkan akun Google terlebih dahulu untuk melakukan sinkronisasi!');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await suratUseCases.runFullGoogleSync(token);
      refreshData();
      if (!overrideToken) {
        alert(res.message);
      }
    } catch (err) {
      alert(`Gagal sinkronisasi: ${String(err)}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Surat Masuk CRUD Handlers
  const handleSaveSuratMasuk = (item: SuratMasuk) => {
    localStorageRepository.saveSuratMasuk(item);
    refreshData();
  };

  const handleDeleteSuratMasuk = (id: string) => {
    localStorageRepository.deleteSuratMasuk(id);
    refreshData();
  };

  const handleCreateDisposisiFromSurat = (surat: SuratMasuk) => {
    setPreSelectedSuratMasuk(surat);
    setIsOpenCreateDisposisi(true);
    setActiveTab('disposisi');
  };

  // Surat Keluar CRUD Handlers
  const handleSaveSuratKeluar = (item: SuratKeluar) => {
    localStorageRepository.saveSuratKeluar(item);
    refreshData();
  };

  const handleDeleteSuratKeluar = (id: string) => {
    localStorageRepository.deleteSuratKeluar(id);
    refreshData();
  };

  // Disposisi CRUD Handlers
  const handleSaveDisposisi = (item: Disposisi) => {
    localStorageRepository.saveDisposisi(item);
    refreshData();
  };

  const handleDeleteDisposisi = (id: string) => {
    localStorageRepository.deleteDisposisi(id);
    refreshData();
  };

  // School Profile Handler
  const handleSaveSchoolProfile = (profile: SchoolProfile) => {
    localStorageRepository.saveSchoolProfile(profile);
    refreshData();
  };

  const dashboardStats = suratUseCases.getDashboardStats();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* App Header */}
      <Header
        user={user}
        accessToken={accessToken}
        onAuthChange={handleAuthChange}
        isSyncing={isSyncing}
        onTriggerSync={() => handleTriggerSync()}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          counts={{
            suratMasuk: suratMasukList.length,
            suratKeluar: suratKeluarList.length,
            disposisiAktif: disposisiList.filter((d) => d.status !== 'Selesai').length,
          }}
        />

        {/* Main Content View Container */}
        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Google Auth Connection Banner */}
          <GoogleAuthBanner
            user={user}
            folderId={driveConfig.rootFolderId}
            spreadsheetId={driveConfig.spreadsheetId}
            onAuthSuccess={(u, t) => handleAuthChange(u, t)}
          />

          {/* Tab Views Switching */}
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={dashboardStats}
              suratMasukList={suratMasukList}
              suratKeluarList={suratKeluarList}
              disposisiList={disposisiList}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenCreateSuratMasuk={() => {
                setActiveTab('surat-masuk');
                setIsOpenCreateSuratMasuk(true);
              }}
              onOpenCreateSuratKeluar={() => {
                setActiveTab('surat-keluar');
                setIsOpenCreateSuratKeluar(true);
              }}
            />
          )}

          {activeTab === 'surat-masuk' && (
            <SuratMasukView
              suratMasukList={suratMasukList}
              onSaveSuratMasuk={handleSaveSuratMasuk}
              onDeleteSuratMasuk={handleDeleteSuratMasuk}
              onCreateDisposisiFromSurat={handleCreateDisposisiFromSurat}
              isOpenCreateModal={isOpenCreateSuratMasuk}
              setIsOpenCreateModal={setIsOpenCreateSuratMasuk}
            />
          )}

          {activeTab === 'surat-keluar' && (
            <SuratKeluarView
              suratKeluarList={suratKeluarList}
              onSaveSuratKeluar={handleSaveSuratKeluar}
              onDeleteSuratKeluar={handleDeleteSuratKeluar}
              isOpenCreateModal={isOpenCreateSuratKeluar}
              setIsOpenCreateModal={setIsOpenCreateSuratKeluar}
            />
          )}

          {activeTab === 'disposisi' && (
            <DisposisiView
              disposisiList={disposisiList}
              suratMasukList={suratMasukList}
              schoolProfile={schoolProfile}
              onSaveDisposisi={handleSaveDisposisi}
              onDeleteDisposisi={handleDeleteDisposisi}
              onUpdateSchoolProfile={handleSaveSchoolProfile}
              isOpenCreateModal={isOpenCreateDisposisi}
              setIsOpenCreateModal={setIsOpenCreateDisposisi}
              preSelectedSuratMasuk={preSelectedSuratMasuk}
            />
          )}

          {activeTab === 'google-sync' && (
            <DriveSyncView
              user={user}
              accessToken={accessToken}
              driveConfig={driveConfig}
              syncLogs={syncLogs}
              isSyncing={isSyncing}
              onTriggerSync={() => handleTriggerSync()}
            />
          )}

          {activeTab === 'settings' && (
            <SchoolSettingsView
              schoolProfile={schoolProfile}
              onSaveSchoolProfile={handleSaveSchoolProfile}
            />
          )}

          {activeTab === 'logs' && <AuditLogsView />}
        </main>
      </div>
    </div>
  );
}
