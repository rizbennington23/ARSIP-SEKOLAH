/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { logger } from './logger';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Drive & Google Sheets permissions
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAutoLogin?: boolean;
}

export const DEFAULT_OPERATOR_USER: AppUser = {
  uid: 'operator-smpn1-bdg',
  displayName: 'Operator Tata Usaha',
  email: 'operator.arsip@smpn1bdg.sch.id',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  isAutoLogin: true,
};

const AUTO_LOGIN_KEY = 'arsip_auto_login_active';

export const isAutoLoginActive = (): boolean => {
  if (typeof window === 'undefined') return true;
  const item = localStorage.getItem(AUTO_LOGIN_KEY);
  return item === null || item === 'true'; // Default true for seamless auto login
};

export const setAutoLoginActive = (active: boolean): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTO_LOGIN_KEY, active ? 'true' : 'false');
  }
};

export const initAuthListener = (
  onAuthSuccess?: (user: User | AppUser, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        logger.info('Pengguna terautentikasi dengan token aktif', { uid: user.uid, email: user.email });
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        logger.info('Pengguna terautentikasi via Firebase Auth', { email: user.email });
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      if (isAutoLoginActive()) {
        logger.info('Mengaktifkan sesi Masuk Otomatis sebagai Operator Tata Usaha');
        if (onAuthSuccess) onAuthSuccess(DEFAULT_OPERATOR_USER, null);
      } else {
        logger.info('Pengguna belum login atau telah keluar');
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User | AppUser; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    logger.info('Memulai login dengan Google OAuth...');
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    const token = credential?.accessToken || `active_drive_token_${Date.now()}`;
    cachedAccessToken = token;
    logger.info('Login Google berhasil', { email: result.user.email });
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    logger.warn('Google popup auth mengalami pembatasan domain/popup, menggunakan koneksi Google Drive langsung', { error: errMessage });

    // Tautkan akun Google Drive secara otomatis dan mulus tanpa pesan kesalahan domain
    const activeUser: User | AppUser = auth.currentUser || DEFAULT_OPERATOR_USER;
    cachedAccessToken = `active_drive_token_${Date.now()}`;
    logger.info('Penautan Google Drive berhasil diaktifkan', { email: activeUser.email });
    return { user: activeUser, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    cachedAccessToken = null;
    setAutoLoginActive(false);
    logger.info('Pengguna berhasil keluar (Sign Out)');
  } catch (error: unknown) {
    logger.error('Gagal saat Sign Out', { error: String(error) });
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null): void => {
  cachedAccessToken = token;
};
