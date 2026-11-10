import { defineStore } from 'pinia';
import api from '../services/api';

export const usePatientStore = defineStore('patient', {
  state: () => ({
    patients: [],
    nextMrn: 'RM0003',
    loading: false,
    searchingMrn: false,
    error: null,
  }),

  actions: {
    async fetchPatients(options = {}) {
      this.loading = true;
      this.error = null;
      try {
        const search = typeof options === 'string' ? options : (options?.search || '');
        const params = search ? { search } : {};
        const { data } = await api.get('/patients', { params });
        this.patients = Array.isArray(data.data) ? data.data : (data.data?.data || []);

        console.groupCollapsed(
          `%c[PATIENT STORE] Loaded ${this.patients.length} Patients from Backend API`,
          'color: #027be3; font-weight: bold;'
        );
        if (this.patients.length > 0) {
          console.table(
            this.patients.map((p, idx) => ({
              'No': idx + 1,
              'No. Rekam Medik': p.medical_record_number,
              'Nama Pasien': p.name,
              'NIK': p.national_id,
              'Alamat': p.address || '-',
              'Jml Kunjungan': p.visits_count ?? 0,
            }))
          );
        } else {
          console.log('%cNo patient records found in database.', 'color: #888; font-style: italic;');
        }
        console.groupEnd();

        return this.patients;
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat data pasien.';
        console.error('%c[PATIENT STORE] Error fetching patients:', 'color: #d32f2f; font-weight: bold;', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchNextMrn() {
      try {
        const { data } = await api.get('/patients/next-mrn');
        this.nextMrn = data.data.medical_record_number;

        console.log(
          `%c[PATIENT STORE] Auto-Generated Next MRN: %c${this.nextMrn}`,
          'color: #00897b; font-weight: bold;',
          'color: #00897b; font-weight: bold; background: #e0f2f1; padding: 2px 6px; border-radius: 3px;'
        );

        return this.nextMrn;
      } catch (err) {
        console.warn('[PATIENT STORE] Failed to fetch next MRN, falling back to RM0001');
        return 'RM0001';
      }
    },

    async registerPatient(formData) {
      this.loading = true;
      this.error = null;

      console.group(
        '%c[PATIENT STORE] Action: Registering New Patient',
        'background: #00897b; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;'
      );
      console.log('%cInput Form Data:', 'font-weight: bold; color: #555;', formData);

      try {
        const { data } = await api.post('/patients', formData);
        
        console.log('%cRegistration Success Result:', 'color: #2e7d32; font-weight: bold;', data);
        console.groupEnd();

        await this.fetchPatients();
        await this.fetchNextMrn();

        return {
          success: true,
          message: data.message,
          data: data.data,
        };
      } catch (err) {
        const errData = err.response?.data;
        const firstError = errData?.errors ? Object.values(errData.errors).flat()[0] : null;

        console.warn('%cRegistration Failed:', 'color: #d32f2f; font-weight: bold;', firstError || errData?.message);
        console.groupEnd();

        return {
          success: false,
          message: firstError || errData?.message || (err.code === 'ERR_NETWORK' ? 'Tidak dapat terhubung ke server backend.' : 'Gagal mendaftarkan pasien.'),
          errors: errData?.errors || {},
        };
      } finally {
        this.loading = false;
      }
    },

    async findByMrn(mrn) {
      if (!mrn) return null;
      this.searchingMrn = true;

      const trimmedMrn = mrn.trim();
      console.groupCollapsed(
        `%c[PATIENT STORE] Auto-search by MRN: %c${trimmedMrn}`,
        'color: #6a1b9a; font-weight: bold;',
        'color: #1565c0; font-weight: bold;'
      );

      try {
        const { data } = await api.get(`/patients/by-mrn/${encodeURIComponent(trimmedMrn)}`);
        const patientData = data.data?.patient || data.data;

        console.log('%cFound Patient Record:%c', 'color: #2e7d32; font-weight: bold;', '', patientData);
        console.groupEnd();

        return {
          success: true,
          data: patientData,
        };
      } catch (err) {
        console.warn(`%cPatient with MRN "${trimmedMrn}" not found in database.`, 'color: #e65100; font-style: italic;');
        console.groupEnd();

        return {
          success: false,
          message: err.response?.data?.message || `Pasien dengan No. Rekam Medik "${mrn}" tidak ditemukan.`,
        };
      } finally {
        this.searchingMrn = false;
      }
    },
  },
});

