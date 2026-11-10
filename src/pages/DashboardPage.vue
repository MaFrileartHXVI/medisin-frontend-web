<template>
  <div class="figma-page-wrapper">
    <!-- Main White Container Card matching Figma Image 2 -->
    <div class="figma-white-card">
      <!-- Centered Medisin Logo -->
      <div class="logo-section">
        <MedisinLogo :width="220" height="auto" />
      </div>

      <!-- Action Buttons Row matching Figma Image 2 -->
      <div class="action-buttons-row">
        <!-- TAMBAH PASIEN Button (Vibrant Blue Pill) -->
        <button class="btn-tambah-pasien" @click="openAddPatientModal">
          TAMBAH PASIEN
        </button>

        <!-- BUAT KUNJUNGAN Button (Vibrant Green Pill) -->
        <button class="btn-buat-kunjungan" @click="openCreateVisitModal">
          BUAT KUNJUNGAN
        </button>

        <!-- Logout Pill -->
        <div class="logout-pill" @click="handleLogout" title="Keluar">
          LOGOUT
        </div>
      </div>

      <!-- Patients Grid Table matching Figma Image 2 -->
      <div class="table-container">
        <table class="figma-grid-table">
          <thead>
            <tr>
              <th style="width: 7%;">NO</th>
              <th style="width: 17%;">NO REKAM MEDIK</th>
              <th style="width: 20%;">NAMA PASIEN</th>
              <th style="width: 19%;">NIK</th>
              <th style="width: 25%;">ALAMAT</th>
              <th style="width: 12%;">JML KUNJUNGAN</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="table-empty-cell">
                Memuat data...
              </td>
            </tr>
            <tr v-else-if="patients.length === 0">
              <td colspan="6" class="table-empty-cell">
                Belum ada data pasien.
              </td>
            </tr>
            <tr v-for="(p, index) in patients" :key="p.id">
              <td>{{ index + 1 }}</td>
              <td>{{ p.medical_record_number }}</td>
              <td>{{ p.name }}</td>
              <td>{{ p.national_id }}</td>
              <td>{{ p.address || '-' }}</td>
              <td>{{ p.visits_count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL: TAMBAH PASIEN (Matching Figma Image 3)            -->
    <!-- ======================================================== -->
    <div v-if="showAddPatientModal" class="figma-modal-backdrop" @click.self="showAddPatientModal = false">
      <div class="figma-dialog-card">
        <!-- Close 'X' Button -->
        <div class="close-x-btn" @click="showAddPatientModal = false">✕</div>

        <!-- Title -->
        <div class="modal-title">TAMBAH PASIEN</div>

        <!-- Form Tambah Pasien -->
        <form @submit.prevent="submitAddPatient">
          <!-- Field 1: No. Rekam Medik (Full Width Grey Box) -->
          <div class="form-row-full">
            <input
              type="text"
              :value="nextMrn"
              class="grey-box-input"
              readonly
              placeholder="No. Rekam Medik"
            />
          </div>

          <!-- Field 2 & 3: Nama Pasien & NIK (Two Columns) -->
          <div class="form-row-split">
            <input
              v-model="patientForm.name"
              type="text"
              placeholder="Nama Pasien"
              class="bordered-white-input"
              required
            />
            <input
              v-model="patientForm.national_id"
              type="text"
              placeholder="NIK"
              class="bordered-white-input"
              required
            />
          </div>

          <!-- Field 4: Alamat (Full Width Box) -->
          <div class="form-row-full">
            <textarea
              v-model="patientForm.address"
              placeholder="Alamat"
              class="bordered-white-textarea"
              rows="3"
            ></textarea>
          </div>

          <!-- Centered SIMPAN Button -->
          <div class="modal-button-center">
            <button type="submit" class="btn-modal-blue" :disabled="submittingPatient">
              <span v-if="!submittingPatient">SIMPAN</span>
              <span v-else>...</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL: BUAT KUNJUNGAN (Matching Figma Image 4)           -->
    <!-- ======================================================== -->
    <div v-if="showCreateVisitModal" class="figma-modal-backdrop" @click.self="showCreateVisitModal = false">
      <div class="figma-dialog-card">
        <!-- Close 'X' Button -->
        <div class="close-x-btn" @click="showCreateVisitModal = false">✕</div>

        <!-- Title -->
        <div class="modal-title">BUAT KUNJUNGAN</div>

        <form @submit.prevent="submitCreateVisit">
          <!-- Section 1: Cari Pasien -->
          <div class="section-label">Cari Pasien</div>
          <div class="form-row-full">
            <input
              :value="searchMrnInput"
              type="text"
              placeholder="No Rekam Medik"
              class="bordered-white-input uppercase-input"
              @input="onSearchInput"
              @change="handleSearchPatient"
              @blur="handleSearchPatient"
              @keyup.enter="handleSearchPatient"
            />
          </div>

          <!-- Horizontal Divider -->
          <div class="modal-divider"></div>

          <!-- Section 2: Data Pasien -->
          <div class="section-label">Data Pasien</div>
          <div class="form-row-split">
            <div class="grey-box-display">
              {{ selectedPatient ? selectedPatient.name : 'Nama Pasien' }}
            </div>
            <div class="grey-box-display">
              {{ selectedPatient ? selectedPatient.national_id : 'NIK' }}
            </div>
          </div>

          <div class="form-row-full" style="margin-top: 10px;">
            <div class="grey-box-display-multiline">
              {{ selectedPatient ? (selectedPatient.address || '-') : 'Alamat' }}
            </div>
          </div>

          <!-- Centered BUAT KUNJUNGAN Button -->
          <div class="modal-button-center">
            <button
              type="submit"
              class="btn-modal-blue"
              :disabled="!selectedPatient || submittingVisit"
            >
              <span v-if="!submittingVisit">BUAT KUNJUNGAN</span>
              <span v-else>...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePatientStore } from '../stores/patient';
import { useVisitStore } from '../stores/visit';
import { useAuthStore } from '../stores/auth';
import { useQuasar } from 'quasar';
import MedisinLogo from '../components/MedisinLogo.vue';

const $q = useQuasar();
const router = useRouter();
const patientStore = usePatientStore();
const visitStore = useVisitStore();
const authStore = useAuthStore();

const patients = computed(() => patientStore.patients);
const loading = computed(() => patientStore.loading);

// Modal 1: Tambah Pasien
const showAddPatientModal = ref(false);
const nextMrn = ref('No. Rekam Medik');
const submittingPatient = ref(false);
const patientForm = ref({
  name: '',
  national_id: '',
  address: '',
});

// Modal 2: Buat Kunjungan
const showCreateVisitModal = ref(false);
const searchMrnInput = ref('');
const selectedPatient = ref(null);
const submittingVisit = ref(false);

async function loadPatients() {
  try {
    await patientStore.fetchPatients();
  } catch (err) {
    console.error('Error fetching patients:', err);
  }
}

async function openAddPatientModal() {
  console.log('%c[UI ACTION] Buka Modal: TAMBAH PASIEN', 'background: #0066d6; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;');
  patientForm.value = {
    name: '',
    national_id: '',
    address: '',
  };
  const mrn = await patientStore.fetchNextMrn();
  nextMrn.value = mrn || 'RM0003';
  showAddPatientModal.value = true;
}

async function submitAddPatient() {
  if (!patientForm.value.name?.trim()) {
    console.warn('[UI VALIDATION] Nama pasien kosong.');
    $q.notify({
      type: 'warning',
      message: 'Nama pasien wajib diisi.',
      timeout: 3000,
      group: false,
    });
    return;
  }

  if (!patientForm.value.national_id?.trim()) {
    console.warn('[UI VALIDATION] NIK pasien kosong.');
    $q.notify({
      type: 'warning',
      message: 'NIK pasien wajib diisi.',
      timeout: 3000,
      group: false,
    });
    return;
  }

  if (!/^\d{16}$/.test(patientForm.value.national_id.trim())) {
    console.warn('[UI VALIDATION] NIK tidak valid (harus 16 digit).');
    $q.notify({
      type: 'warning',
      message: 'NIK harus berupa 16 digit angka.',
      timeout: 3000,
      group: false,
    });
    return;
  }

  submittingPatient.value = true;

  const payload = {
    name: patientForm.value.name.trim(),
    national_id: patientForm.value.national_id.trim(),
    address: patientForm.value.address?.trim() || '',
  };

  console.log('%c[UI ACTION] Submit Formulir Pendaftaran Pasien:', 'color: #00897b; font-weight: bold;', payload);

  const res = await patientStore.registerPatient(payload);
  submittingPatient.value = false;

  if (res.success) {
    showAddPatientModal.value = false;
    $q.notify({
      type: 'positive',
      message: res.message || 'Pasien berhasil didaftarkan!',
      timeout: 2000,
      group: false,
    });
    loadPatients();
  } else {
    $q.notify({
      type: 'negative',
      message: res.message || 'Gagal mendaftarkan pasien.',
      timeout: 3500,
      group: false,
    });
  }
}

function openCreateVisitModal() {
  console.log('%c[UI ACTION] Buka Modal: BUAT KUNJUNGAN', 'background: #2e7d32; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;');
  searchMrnInput.value = '';
  selectedPatient.value = null;
  showCreateVisitModal.value = true;
}

let searchTimer = null;
function onSearchInput(e) {
  const upper = (e?.target?.value || searchMrnInput.value || '').toUpperCase();
  searchMrnInput.value = upper;
  if (e?.target) {
    e.target.value = upper;
  }
  clearTimeout(searchTimer);
  const delay = upper.trim().length >= 4 ? 100 : 300;
  searchTimer = setTimeout(() => {
    handleSearchPatient();
  }, delay);
}

async function handleSearchPatient() {
  const term = searchMrnInput.value.trim();
  if (!term) {
    selectedPatient.value = null;
    return;
  }

  console.log(`%c[UI ACTION] Mencari data pasien otomatis untuk No. Rekam Medik: %c"${term}"`, 'color: #555;', 'color: #0066d6; font-weight: bold;');
  const res = await patientStore.findByMrn(term);
  const patient = res?.data?.patient || res?.data;
  if (res && res.success && patient && patient.medical_record_number) {
    selectedPatient.value = patient;
    console.log('%c[UI ACTION] Auto-fill Berhasil! Data Pasien Terisi:', 'color: #2e7d32; font-weight: bold;', {
      nama: patient.name,
      nik: patient.national_id,
      alamat: patient.address,
    });
  } else {
    selectedPatient.value = null;
    console.log('%c[UI ACTION] Pasien tidak ditemukan untuk No. Rekam Medik tersebut.', 'color: #e65100; font-style: italic;');
  }
}

async function submitCreateVisit() {
  if (!selectedPatient.value) {
    console.warn('[UI VALIDATION] Belum ada pasien yang dipilih untuk kunjungan.');
    $q.notify({
      type: 'warning',
      message: 'Silakan pilih pasien berdasarkan No. Rekam Medik yang valid terlebih dahulu.',
      timeout: 3000,
      group: false,
    });
    return;
  }

  submittingVisit.value = true;
  const payload = {
    medical_record_number: selectedPatient.value.medical_record_number,
  };

  console.log('%c[UI ACTION] Submit Pembuatan Kunjungan untuk No Rekam Medik:', 'color: #2e7d32; font-weight: bold;', payload.medical_record_number);

  const res = await visitStore.createVisit(payload);
  submittingVisit.value = false;

  if (res.success) {
    showCreateVisitModal.value = false;
    $q.notify({
      type: 'positive',
      message: 'Kunjungan pasien berhasil dibuat!',
      timeout: 2000,
      group: false,
    });
    loadPatients();
  } else {
    $q.notify({
      type: 'negative',
      message: res.message || 'Gagal membuat kunjungan pasien.',
      timeout: 3500,
      group: false,
    });
  }
}

async function handleLogout() {
  console.log('%c[UI ACTION] Tombol Logout diklik oleh pengguna.', 'color: #e65100; font-weight: bold;');
  await authStore.logout();
  router.push({ name: 'login' });
}

onMounted(() => {
  loadPatients();
});
</script>

<style scoped>
.figma-page-wrapper {
  background-color: #0066d6; /* Exact royal blue matching Figma */
  min-height: 100vh;
  width: 100%;
  padding: 48px 32px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.figma-white-card {
  background: #ffffff;
  border-radius: 28px;
  width: 100%;
  max-width: 1100px;
  padding: 40px 48px 48px 48px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
}

.logo-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.action-buttons-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.btn-tambah-pasien {
  background-color: #0061d5;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  padding: 10px 28px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: opacity 0.15s;
}

.btn-tambah-pasien:hover {
  opacity: 0.9;
}

.btn-buat-kunjungan {
  background-color: #38b000;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  padding: 10px 28px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: opacity 0.15s;
}

.btn-buat-kunjungan:hover {
  opacity: 0.9;
}

.logout-pill {
  margin-left: auto;
  background-color: #f1f3f5;
  color: #666;
  border-radius: 9999px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s;
}

.logout-pill:hover {
  background-color: #e2e6ea;
  color: #333;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.figma-grid-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #777777;
}

.figma-grid-table th {
  background-color: #cccccc;
  color: #111111;
  font-size: 13.5px;
  font-weight: 700;
  text-align: center;
  padding: 10px 8px;
  border: 1px solid #777777;
  letter-spacing: 0.02em;
}

.figma-grid-table td {
  padding: 10px 12px;
  font-size: 13.5px;
  color: #222222;
  border: 1px solid #777777;
  text-align: center;
  background-color: #ffffff;
}

.table-empty-cell {
  padding: 24px;
  text-align: center;
  color: #666;
}

.figma-grid-table td:nth-child(3),
.figma-grid-table td:nth-child(5) {
  text-align: left;
}

.figma-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  box-sizing: border-box;
}

.figma-dialog-card {
  position: relative;
  background-color: #ffffff;
  border: 1.5px solid #222222;
  border-radius: 12px;
  width: 600px;
  max-width: 95vw;
  padding: 28px 36px 36px 36px;
  box-sizing: border-box;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.close-x-btn {
  position: absolute;
  top: 14px;
  right: 18px;
  font-size: 18px;
  font-weight: 700;
  color: #222222;
  cursor: pointer;
  line-height: 1;
}

.modal-title {
  text-align: center;
  font-size: 17px;
  font-weight: 800;
  color: #111111;
  letter-spacing: 0.04em;
  margin-bottom: 24px;
}

.form-row-full {
  width: 100%;
  margin-bottom: 14px;
}

.form-row-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 14px;
}

.grey-box-input {
  width: 100%;
  height: 42px;
  background-color: #e5e5e5;
  border: none;
  border-radius: 8px;
  outline: none;
  padding: 0 14px;
  font-size: 13.5px;
  color: #555555;
  box-sizing: border-box;
  font-family: inherit;
}

.bordered-white-input {
  width: 100%;
  height: 42px;
  background-color: #ffffff;
  border: 1px solid #777777;
  border-radius: 8px;
  outline: none;
  padding: 0 14px;
  font-size: 13.5px;
  color: #222222;
  box-sizing: border-box;
  font-family: inherit;
}

.uppercase-input {
  text-transform: uppercase;
}

.bordered-white-input::placeholder {
  color: #777777;
}

.bordered-white-textarea {
  width: 100%;
  background-color: #ffffff;
  border: 1px solid #777777;
  border-radius: 8px;
  outline: none;
  padding: 10px 14px;
  font-size: 13.5px;
  color: #222222;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
}

.bordered-white-textarea::placeholder {
  color: #777777;
}

.modal-button-center {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.btn-modal-blue {
  background-color: #0061d5;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  padding: 10px 36px;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-modal-blue:hover {
  opacity: 0.9;
}

.btn-modal-blue:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 6px;
}

.modal-divider {
  width: 100%;
  height: 1px;
  background-color: #cccccc;
  margin: 16px 0;
}

.grey-box-display {
  background-color: #e5e5e5;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  font-size: 13.5px;
  color: #333333;
  box-sizing: border-box;
}

.grey-box-display-multiline {
  background-color: #e5e5e5;
  border-radius: 8px;
  min-height: 52px;
  padding: 10px 14px;
  font-size: 13.5px;
  color: #333333;
  box-sizing: border-box;
  white-space: pre-wrap;
}
</style>
