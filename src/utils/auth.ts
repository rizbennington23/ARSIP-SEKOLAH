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

export const initAuthListener = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        logger.info('Pengguna terautentikasi dengan token aktif', { uid: user.uid, email: user.email });
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        logger.info('Pengguna terautentikasi tetapi token sesi perlu diperbarui', { email: user.email });
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      logger.info('Pengguna belum login atau telah keluar');
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    logger.info('Memulai login dengan Google OAuth...');
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan OAuth Access Token dari Google');
    }

    cachedAccessToken = credential.accessToken;
    logger.info('Login Google berhasil', { email: result.user.email });
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    const errCode = (error as { code?: string })?.code || '';

    if (
      errCode === 'auth/unauthorized-domain' ||
      errMessage.includes('auth/unauthorized-domain') ||
      errMessage.includes('domain tidak sah') ||
      errMessage.includes('unauthorized domain')
    ) {
      const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'domain Anda';
      logger.error('Gagal login Google Auth: Domain belum diizinkan di Firebase Console Authorized Domains', {
        error: errMessage,
        currentDomain,
      });
      throw new Error(`UNAUTHORIZED_DOMAIN:${currentDomain}`);
    }

    logger.error('Gagal login Google Auth', { error: errMessage });
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    cachedAccessToken = null;
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
