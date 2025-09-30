# Gold Insight

![Dashboard Screenshot](dist/assets/ss.jpeg)

Gold Insight adalah aplikasi web modern berbasis Vue 3 + Vuetify untuk mengelola dan menganalisis portofolio emas Pegadaian Anda. Fitur utama meliputi dashboard, grafik interaktif, dan integrasi database Supabase.

## Fitur Utama
- Login nasabah (nama & no HP, data tersimpan di Supabase)
- Dashboard: total emas, nilai portofolio, rata-rata harga beli & jual, potensi profit
- Komposisi emas per merk (donut chart) dan grafik harga emas historis (Chart.js)
- Tambah, lihat, dan hapus transaksi emas
- Harga beli/jual otomatis terisi dari database, bisa edit manual
- Riwayat transaksi lengkap
- Responsive & mobile friendly
- Download laporan PDF portofolio (termasuk chart, komposisi, riwayat, otomatis nama file)
- Feedback aplikasi via Google Form

## Cara Memulai

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Jalankan server pengembangan:**
   ```sh
   npm run dev
   ```
3. **Buka di browser:**
   Kunjungi [http://localhost:5173](http://localhost:5173)

## Struktur Proyek
- `src/` — Kode utama
  - `App.vue` — Shell aplikasi utama
  - `components/` — Komponen utama (Dashboard, PortfolioSummary, GoldComposition, dsb)
  - `lib/` — Supabase client & utilitas
  - `style.css` — Kustomisasi tampilan
- `api/prices.js` — Proxy API Pegadaian (untuk deployment Vercel)
- `vite.config.js` — Konfigurasi Vite

## Catatan
- Semua data transaksi dan user tersimpan di Supabase (bukan hanya local browser)
- Jika API Pegadaian terblokir CORS, gunakan proxy atau deploy ke Vercel
- Laporan PDF otomatis menyertakan chart, komposisi, riwayat, dan nama file: `report_rortofolio_emas_{nohp}_{tgl}_{seq}.pdf`
- Kompatibel desktop & mobile

---
Dibuat dengan Vue 3, Vuetify, Chart.js, Supabase, dan Vercel serverless functions.
