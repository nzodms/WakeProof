import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient, SupportedStorage } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Stockage de session : chiffré (SecureStore) sur natif, localStorage sur web.
// expo-secure-store est natif uniquement, on ne doit pas l'appeler côté web.
const NativeStorageAdapter: SupportedStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

const WebStorageAdapter: SupportedStorage = {
  getItem: (key) => {
    try {
      return Promise.resolve(globalThis.localStorage?.getItem(key) ?? null);
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key, value) => {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      /* no-op */
    }
    return Promise.resolve();
  },
  removeItem: (key) => {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* no-op */
    }
    return Promise.resolve();
  },
};

const storage = Platform.OS === 'web' ? WebStorageAdapter : NativeStorageAdapter;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // En MVP/dev sans backend, on tourne en mode démo (mock). On évite de crasher.
  console.warn('[WakeProof] Supabase non configuré — mode démo actif. Renseigne .env.');
}

export const supabase = createClient(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseAnonKey || 'public-anon-demo',
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  },
);
