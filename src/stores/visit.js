import { defineStore } from 'pinia';
import api from '../services/api';

export const useVisitStore = defineStore('visit', {
  state: () => ({
    visits: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchVisits() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.get('/visits');
        this.visits = Array.isArray(data.data) ? data.data : (data.data?.data || []);

        console.groupCollapsed(
          `%c[VISIT STORE] Loaded ${this.visits.length} Visits`,
          'color: #2e7d32; font-weight: bold;'
        );
        console.table(
          this.visits.map((v, i) => ({
            'No': i + 1,
            'ID': v.id,
            'Patient MRN': v.patient?.medical_record_number || '-',
            'Patient Name': v.patient?.name || '-',
            'Created At': v.created_at,
          }))
        );
        console.groupEnd();

        return this.visits;
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat data kunjungan.';
        console.error('[VISIT STORE] Error loading visits:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createVisit(payload) {
      this.loading = true;
      this.error = null;

      console.group(
        '%c[VISIT STORE] Action: Create Patient Visit',
        'background: #2e7d32; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;'
      );
      console.log('%cVisit Request Payload:%c', 'color: #555; font-weight: bold;', '', payload);

      try {
        const { data } = await api.post('/visits', payload);

        console.log('%cVisit Created Successfully:%c', 'color: #2e7d32; font-weight: bold;', '', data);
        console.groupEnd();

        return {
          success: true,
          message: data.message,
          data: data.data,
        };
      } catch (err) {
        const errData = err.response?.data;
        const firstError = errData?.errors ? Object.values(errData.errors).flat()[0] : null;

        console.warn('%cVisit Creation Failed:%c', 'color: #d32f2f; font-weight: bold;', '', firstError || errData?.message);
        console.groupEnd();

        return {
          success: false,
          message: firstError || errData?.message || (err.code === 'ERR_NETWORK' ? 'Tidak dapat terhubung ke server backend.' : 'Gagal membuat kunjungan pasien.'),
          errors: errData?.errors || {},
        };
      } finally {
        this.loading = false;
      }
    },
  },
});

