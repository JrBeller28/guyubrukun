# Guyub Rukun — Perbaikan Profil Data Keluarga dan Audit

## Ringkasan

Pembaruan ini menambahkan bagian **Data Keluarga** pada halaman Profil, menampilkan Nomor KK dan domisili KK dari data akun yang sedang login, serta memperbaiki beberapa masalah tipe dan konfigurasi runtime/deployment.

## Perubahan kode

1. `src/App.tsx`
   - Menambahkan pemuatan ulang data profil terbaru melalui `GET /api/me` dengan query unik agar tidak tertahan cache GET lokal.
   - Kartu **Data Keluarga** menampilkan No. KK, kategori wilayah, alamat KK, kelurahan/desa, kecamatan, kabupaten/kota, provinsi, status verifikasi, kepala keluarga, dan seluruh anggota keluarga yang tersimpan di `members`.
   - Menampilkan fallback yang jelas jika nomor KK, domisili, atau anggota keluarga belum tercatat.
   - File dokumen KK/KTP tidak diunduh ke profil; endpoint `/api/me` yang sudah ada mengecualikan kedua dokumen tersebut.
   - Memperluas tipe event sesi agar properti `preserveStoredSession` yang memang dibaca oleh handler terdefinisi dengan benar.

2. `src/types/index.ts`
   - Melengkapi tipe `User` dengan `wilayahKk`, `alamatKk`, dan `kkScanStatus`, selain field domisili KK yang sudah ada.

3. `src/DashboardContext.tsx`
   - Mengganti `NodeJS.Timeout` pada frontend dengan `ReturnType<typeof setTimeout>` agar tidak memerlukan namespace Node khusus untuk timer browser.

4. `package.json`
   - Memperbaiki script `start` dari `node server.ts` menjadi `tsx server.ts`, konsisten dengan script `dev` dan dependency `tsx` yang tersedia di manifest.

5. `vercel.json`
   - Menambahkan schema Vercel dan `installCommand: npm install --no-audit --no-fund`.
   - Ini penting karena audit menemukan `package-lock.json` lama belum sinkron dengan `package.json`. Perintah `npm install` akan menyelaraskan manifest dan lockfile saat deployment, berbeda dari `npm ci` yang menolak lockfile yang tidak sinkron.

## Data yang ditampilkan pada Profil

- Kepala keluarga (nama akun aktif)
- Nomor Kartu Keluarga (`noKk`)
- Kategori domisili (`kkCategory` atau fallback `wilayahKk`)
- Domisili/alamat asal KK (`alamatKk` atau `kkAlamatLengkap`)
- Kelurahan/desa (`kkKelurahan`)
- Kecamatan (`kkKecamatan`)
- Kabupaten/kota (`kkKabupatenKota`)
- Provinsi (`kkProvinsi`)
- Daftar anggota keluarga (`members`) dengan hubungan, jenis kelamin, umur, dan tanggal lahir jika tersedia

## Pemeriksaan

- 43 file TypeScript/TSX dipindai menggunakan TypeScript transpile parser: **0 kesalahan sintaks**.
- `package.json`, `vercel.json`, dan `tsconfig.json`: valid JSON.
- Script start dan `installCommand` diperiksa.
- `tsc --noEmit` belum bisa menyelesaikan type-check penuh di lingkungan ini karena dependency proyek tidak terpasang. Seluruh 180 diagnosis yang tersisa merupakan modul/tipe dependency yang tidak ditemukan (`TS2307`, `TS2580`, `TS2304`, `TS2875`); setelah pemeriksaan, tidak ada diagnosis TypeScript lain yang tersisa.
- Build Vite belum dapat dijalankan karena `node_modules` tidak tersedia dan permintaan pemasangan dependency ke registry npm mengalami timeout / tidak tersedia.
- Koneksi MongoDB/Vercel produksi tidak diuji dari lingkungan ini.

## Langkah sebelum deploy

1. Ekstrak ZIP dan perbarui seluruh source code di repositori GitHub proyek.
2. Pada komputer lokal yang memiliki akses internet, jalankan `npm install` dari folder proyek, lalu commit `package-lock.json` yang telah diperbarui. Ini membuat install lokal/CI lebih konsisten.
3. Pastikan Environment Variables produksi di Vercel tetap terisi (`MONGODB_URI`, `MONGODB_DB_NAME`, dan `JWT_SECRET`).
4. Push perubahan dan lakukan Redeploy.
5. Login ke akun warga, buka Profil, lalu periksa nomor KK, domisili KK, serta daftar anggota keluarga.

Tidak ada migrasi database dan tidak ada data warga yang dihapus oleh pembaruan ini.
