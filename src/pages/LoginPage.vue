<template>
  <div class="figma-login-page fullscreen row items-center justify-center">
    <div class="login-card">
      <!-- Centered Logo -->
      <div class="text-center logo-wrapper">
        <MedisinLogo :width="200" height="auto" />
      </div>

      <!-- Login Form matching Figma Image 1 (Single clean notification via Quasar Notify) -->
      <form @submit.prevent="handleLogin" class="form-container">
        <!-- Username or Email input pill -->
        <div class="input-group">
          <input
            v-model="username"
            type="text"
            placeholder="Username atau Email"
            class="pill-input"
            autocomplete="username"
            required
          />
        </div>

        <!-- Password input pill -->
        <div class="input-group">
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="pill-input"
            autocomplete="current-password"
            required
          />
        </div>

        <!-- Blue LOGIN button pill -->
        <div class="button-group">
          <button type="submit" class="pill-button" :disabled="loading">
            <span v-if="!loading">LOGIN</span>
            <span v-else>MEMPROSES...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useQuasar } from 'quasar';
import MedisinLogo from '../components/MedisinLogo.vue';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const username = ref('admin');
const password = ref('password123');
const loading = ref(false);

async function handleLogin() {
  console.log('%c[UI ACTION] Form Login di-submit oleh pengguna', 'background: #0066d6; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;');
  if (!username.value?.trim()) {
    console.warn('[UI VALIDATION] Username atau email belum diisi.');
    $q.notify({
      type: 'warning',
      message: 'Username atau Email wajib diisi.',
      timeout: 3000,
      group: false,
    });
    return;
  }

  if (!password.value) {
    console.warn('[UI VALIDATION] Password belum diisi.');
    $q.notify({
      type: 'warning',
      message: 'Password wajib diisi.',
      timeout: 3000,
      group: false,
    });
    return;
  }

  loading.value = true;

  // Client-side payload encryption (Security Test requirement)
  const result = await authStore.login({
    username: username.value.trim(),
    password: password.value,
  });

  loading.value = false;

  if (result.success) {
    console.log('%c[UI ACTION] Login Berhasil. Navigasi ke Dashboard...', 'color: #2e7d32; font-weight: bold;');
    $q.notify({
      type: 'positive',
      message: 'Login berhasil!',
      timeout: 1500,
      group: false,
    });
    router.push({ name: 'dashboard' });
  } else {
    console.warn('%c[UI ACTION] Login Ditolak Backend:', 'color: #d32f2f; font-weight: bold;', result.message);
    // Single clear notification explaining the exact reason
    $q.notify({
      type: 'negative',
      message: result.message || 'Gagal masuk. Silakan periksa kembali kredensial Anda.',
      timeout: 3500,
      group: false,
    });
  }
}
</script>

<style scoped>
.figma-login-page {
  background-color: #0066d6; /* Exact royal blue matching Figma */
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 16px;
  box-sizing: border-box;
}

.login-card {
  background: #ffffff;
  width: 440px;
  max-width: 92vw;
  border-radius: 24px;
  padding: 38px 36px 36px 36px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
}

.logo-wrapper {
  margin-bottom: 28px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.input-group {
  width: 100%;
}

.pill-input {
  width: 100%;
  height: 42px;
  background-color: #d2d2d2; /* Exact grey pill background */
  border: none;
  outline: none;
  border-radius: 9999px; /* Full pill */
  padding: 0 20px;
  font-size: 14px;
  color: #222222;
  box-sizing: border-box;
  font-family: inherit;
}

.pill-input::placeholder {
  color: #555555;
  font-size: 13.5px;
}

.pill-input:focus {
  background-color: #cacaca;
}

.button-group {
  margin-top: 4px;
}

.pill-button {
  width: 100%;
  height: 42px;
  background-color: #0061d5; /* Exact blue button */
  color: #ffffff;
  border: none;
  border-radius: 9999px; /* Full pill */
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
  box-sizing: border-box;
  transition: background-color 0.15s ease;
  font-family: inherit;
}

.pill-button:hover {
  background-color: #0052b8;
}

.pill-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
