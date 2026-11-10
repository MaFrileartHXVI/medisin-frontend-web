# MEDISIN - Frontend Web (Quasar Framework Vue.js)

Aplikasi antarmuka web sistem informasi pendaftaran pasien dan manajemen kunjungan klinik berbasis **Quasar Framework (Vue.js 3)**, **Vite**, dan **Pinia**, terintegrasi penuh dengan REST API Laravel Backend.

---

## 🎨 Fitur Utama & Kepatuhan Spesifikasi

1. **Autentikasi & Security Test (Payload Encryption)**:
   - Formulir Login modern dengan indikator keamanan aktif.
   - Mengenkripsi `username`/`email` dan `password` menggunakan **AES-256-CBC (CryptoJS)** pada saat transmisi jaringan sebelum payload dikirim ke API Backend.
   - Fitur inspeksi langsung ciphertext payload di UI untuk verifikasi reviewer.

2. **Pendaftaran Pasien (Auto No RM & Database Encryption)**:
   - **Auto-Generate No Rekam Medik**: Pratinjau otomatis nomor rekam medis berikutnya (format `RM0001`, `RM0002`, `RM0003`, dst) secara berurutan.
   - Validasi formulir interaktif di sisi klien (NIK 16 digit angka, nama pasien wajib diisi) serta penanganan respons error dari backend (Negative Testing).
   - Tabel direktori pasien terdaftar dengan NIK yang didekripsi di frontend dan counter jumlah kunjungan dinamis.

3. **Buat Kunjungan (Input No RM & Auto Load)**:
   - Pengguna **hanya perlu memasukkan Nomor Rekam Medik**, data pasien (Nama, NIK, Alamat) langsung muncul secara otomatis (*auto-fill*) via debounced API search.
   - **Jumlah Kunjungan Dinamis**: Menghitung otomatis berapa kali pasien telah berkunjung dari relasi database (`withCount('visits')`).
   - Penanganan kasus negatif: Notifikasi peringatan jika Nomor RM tidak terdaftar atau belum dipilih.

---

## 🛠️ Tech Stack

- **Framework**: Quasar Framework 2 (Vue.js 3 Composition API)
- **Bundler**: Vite 6
- **State Management**: Pinia 3
- **Routing**: Vue Router 4 (Navigation Guards)
- **HTTP Client**: Axios (dengan Interceptor Sanctum Bearer Token & Styled Browser Console Debugging)
- **Enkripsi Klien**: CryptoJS (AES-256-CBC)
- **Desain UI**: Figma 1:1 Pixel-Perfect Theme (Royal Blue `#0066d6`, Pill Buttons, Subtle Rounded Modals)

---

## 🚀 Menjalankan Proyek Frontend

### 1. Masuk ke direktori frontend
```bash
cd medisin-frontend-web
```

### 2. Instal dependensi (jika belum)
```bash
npm install
```

### 3. Konfigurasi Environment di `.env`
```ini
VITE_API_URL=http://localhost:8000/api
VITE_PAYLOAD_KEY="SintasiSecurePayloadKey2026#X9!"
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Aplikasi web akan dapat diakses pada browser di: `http://localhost:9000`

---

## 🔐 Akun Pengujian (Seeder)

| Username / Email | Password | Role |
| :--- | :--- | :--- |
| `admin` atau `admin@medisin.id` | `password123` | Administrator |

