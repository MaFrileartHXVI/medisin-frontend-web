import { defineStore } from 'pinia';
import api from '../services/api';
import { encryptPayload, CRYPTO_KEY } from '../services/crypto';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('sintasi_user') || 'null'),
    token: localStorage.getItem('sintasi_token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => state.user?.name || 'Pengguna',
    userEmail: (state) => state.user?.email || '',
  },

  actions: {
    /**
     * Login action with Client-Side Payload Encryption.
     * Encripts username and password using AES before transmission.
     */
    async login({ username, password }) {
      this.loading = true;
      this.error = null;

      try {
        // Enkripsi username/email dan password pada payload
        const encryptedUsername = encryptPayload(username);
        const encryptedPassword = encryptPayload(password);

        // Security Test Console Inspection matching the PDF prompt specification
        console.group(
          '%c[SECURITY TEST] Client-Side AES-256 Payload Encryption',
          'background: #1565c0; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;'
        );
        console.log('%c1. Plaintext Form Inputs:', 'font-weight: bold; color: #027be3;', {
          username_or_email: username,
          password: '•'.repeat(password?.length || 8) + ` (${password?.length} chars)`,
        });
        console.log('%c2. AES-256 Shared Key (VITE_PAYLOAD_KEY):', 'font-weight: bold; color: #795548;', CRYPTO_KEY);
        console.log('%c3. Encrypted Payload Dispatched to Backend:', 'font-weight: bold; color: #2e7d32;', {
          username: encryptedUsername,
          password: encryptedPassword,
        });
        console.log(
          '%c💡 SINTASI SECURITY REQUIREMENT: Network Payload tab shows ciphertext, prevented from MITM sniffing.',
          'color: #666; font-style: italic;'
        );
        console.groupEnd();

        const response = await api.post('/auth/login', {
          username: encryptedUsername,
          password: encryptedPassword,
        });

        const { user, token } = response.data.data;
        this.user = user;
        this.token = token;

        localStorage.setItem('sintasi_token', token);
        localStorage.setItem('sintasi_user', JSON.stringify(user));

        console.log('%c[AUTH STORE] Login Successful! Authenticated User:', 'color: #2e7d32; font-weight: bold;', user);
        console.log('%c[AUTH STORE] Sanctum Bearer Token:', 'color: #2e7d32;', token);

        return { success: true, data: response.data };
      } catch (err) {
        const message = err.response?.data?.message 
          || (err.code === 'ERR_NETWORK' || err.message?.toLowerCase().includes('network')
              ? 'Tidak dapat terhubung ke server backend (port 8000). Pastikan server backend sedang aktif.'
              : 'Gagal masuk ke sistem. Silakan periksa kredensial Anda.');
        this.error = message;

        console.warn('%c[AUTH STORE] Login Failed:', 'color: #d32f2f; font-weight: bold;', message, err.response?.data);

        return {
          success: false,
          message,
          errors: err.response?.data?.errors,
        };
      } finally {
        this.loading = false;
      }
    },

    async fetchMe() {
      if (!this.token) return null;
      try {
        console.log('%c[AUTH STORE] Fetching current user session (/auth/me)...', 'color: #555;');
        const response = await api.get('/auth/me');
        this.user = response.data.data;
        localStorage.setItem('sintasi_user', JSON.stringify(this.user));
        return this.user;
      } catch (err) {
        console.warn('%c[AUTH STORE] Session expired or invalid on /auth/me.', 'color: #e65100;');
        this.logout();
        return null;
      }
    },

    async logout() {
      console.log('%c[AUTH STORE] Logging out...', 'color: #e65100; font-weight: bold;');
      try {
        if (this.token) {
          await api.post('/auth/logout');
        }
      } catch (err) {
        // Ignore network errors during logout
      } finally {
        this.user = null;
        this.token = null;
        localStorage.removeItem('sintasi_token');
        localStorage.removeItem('sintasi_user');
        console.log('%c[AUTH STORE] Logout complete. Session & token cleared.', 'color: #e65100; font-weight: bold;');
      }
    },
  },
});


