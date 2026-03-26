# Frontend-Capstone
Capstone project dari Dicoding AI bootcamp Batch 10 2025-2026.

## Stack
- React 19
- Vite
- Recharts

## Menjalankan project
```bash
npm install
npm run dev
```

## Konfigurasi backend
Secara default frontend akan memanggil backend FastAPI di:

```bash
http://127.0.0.1:8000
```

Jika ingin mengubah base URL backend, buat file `.env`:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Fitur UI MVP
- Dashboard utama dengan hero, health badge, dan ilustrasi region Indonesia
- Select region dan tombol generate forecast
- Loading, error, dan empty state
- Summary cards untuk peak, average, reference, dan generated time
- Line chart 24 jam untuk `model_prediction` dan `Open-Meteo Reference`
- Tabel forecast per jam
- Metadata panel
- Log/riwayat prediksi sederhana

## Build production
```bash
npm run build
```
