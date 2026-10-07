# Platform Kompetisi Padel — PBPI Kab. Garut

Next.js 15 (App Router) + TypeScript + Tailwind + Prisma + NextAuth.

## Pembaruan terbaru

- **Rating → Poin** — seluruh teks yang tampil di UI (admin, atlet, publik, pesan error) sekarang memakai istilah "Poin". Nama kolom database & kode (`rating`, `peakRating`, `RatingHistory`) sengaja tidak diubah supaya tidak perlu migrasi.
- **CRUD admin lengkap** untuk Atlet, Wasit, Pelatih, Pengurus, dan Pertandingan (tambah, ubah inline, hapus).
  - Atlet yang sudah punya pertandingan/riwayat poin/pendaftaran kompetisi tidak bisa dihapus (hanya dinonaktifkan) agar peringkat tetap utuh.
  - Pertandingan: form pakai dropdown (atlet, lapangan, wasit, pelatih), bukan lagi mengetik ID. Setelah hasil dikirim/diverifikasi, susunan pemain & skor dikunci; pertandingan terverifikasi dan pertandingan bagan kompetisi tidak bisa dihapus.
  - Admin bisa mengisi skor dari form ubah pertandingan; hasilnya masuk antrean verifikasi.
- **Pengurus**: unggah foto (folder `organization`) + bagan struktur organisasi di `/organization` (pratinjau juga di `/admin/organization`). Bagan disusun otomatis: Ketua → Wakil Ketua/Sekretaris/Bendahara → kolom per divisi.
- **Lokasi**: input "Jumlah lapangan" di form tambah & ubah. Sistem membuat/menonaktifkan data `Court` ("Lapangan 1…N"); lapangan yang sudah dipakai pertandingan/kompetisi dinonaktifkan, bukan dihapus.
- **Landing page**: hero full-background dengan navbar transparan di atas foto (berubah putih saat di-scroll).
- **Detail klub**: daftar atlet berbentuk tabel dengan kolom Poin.
- Tidak ada perubahan skema database — tidak perlu migrasi baru.

## Status: tersambung ke database sungguhan

Berbeda dari draf sebelumnya, hampir semua halaman sekarang mengambil data lewat
`src/server/queries.ts` (query Prisma asli) dan menulis lewat `src/server/actions/*.ts`
(server actions asli), bukan lagi array contoh. Yang berubah:

- **Login / daftar** (`/login`, `/register`) — NextAuth Credentials + bcrypt.
- **Proteksi rute** (`src/middleware.ts`) — `/admin/*` khusus `SUPER_ADMIN`, halaman atlet butuh login.
- **Dashboard, Cari Pemain, Peringkat, Profil, Pertandingan** — server component, ambil data lewat `queries.ts`.
- **Tantang / terima / tolak / input skor** — server actions di `src/server/actions/matches.ts`, termasuk parser skor (`src/lib/score.ts`) yang menerima format `"6-4, 3-6, 6-2"`.
- **Verifikasi & koreksi hasil (admin)** — tombol di `/admin/matches` memanggil `verifyMatch()` / `correctMatchResult()` sungguhan; rating berubah beneran di database dalam satu transaksi.
- **Kompetisi** — daftar, buat kompetisi baru (draf), detail dengan manajemen status peserta, semuanya nyata. Pendaftaran mandiri atlet (dengan pengecekan syarat rating & kuota) juga nyata (`registerForCompetitionAction`), tinggal dipasang ke halaman publik kompetisi (belum ada halaman `/competitions` di sisi atlet — lihat "Belum selesai" di bawah).
- **Atlet (admin)** — tabel pencarian & pagination nyata (lewat server action, bukan lagi `useEffect` ke array statis), aksi aktifkan/nonaktifkan akun nyata, dan halaman detail atlet (`/admin/athletes/[id]`) menampilkan riwayat rating asli dari `RatingHistory`.
- **Seed** (`prisma/seed.ts`) — isi level, satu venue, satu admin, beberapa atlet contoh.

### Perbaikan dari draf sebelumnya
Waktu meninjau ulang kode lama, saya temukan bug di `correctMatchResult`: pertandingan
yang dikoreksi menghitung dua kali jumlah main dan menang/kalah atlet, dan baris riwayat
koreksinya kosong (rating 0 → 0). Sudah diperbaiki — sekarang koreksi membatalkan hasil
lama secara akurat sebelum menghitung ulang, dan keduanya jalan di transaksi level
**Serializable** supaya dua verifikasi yang menimpa atlet yang sama tidak saling tabrakan.

## Baru: bracket turnamen, tren peringkat, dan edit profil

- **Bracket turnamen** (`src/server/services/bracket.ts`) — generator single elimination sungguhan. Dari peserta berstatus "Dikonfirmasi", diurutkan berdasarkan rating (seed), dipasangkan dengan urutan bracket standar (unggulan 1 vs paling bawah, dst) supaya unggulan teratas nggak ketemu di babak awal. Kalau jumlah peserta bukan kelipatan 2, otomatis dapat bye. Begitu admin memverifikasi hasil suatu pertandingan bracket, pemenangnya **otomatis maju** ke babak berikutnya (`advanceWinner`, dipanggil dari `match-verification.ts`) — nggak perlu isi manual. Tombol "Buat bracket" dan tampilan bracket-nya ada di halaman detail kompetisi admin.
  - Batasan yang saya sadari: kalau admin mengoreksi hasil pertandingan bracket yang sudah bikin pemenangnya maju ke babak berikutnya, sistem *menambahkan* pemenang baru tapi *tidak mencabut* pemenang lama dari babak berikutnya. Ini kasus tepi yang jarang terjadi (koreksi pada pertandingan bracket, bukan pertandingan biasa), tapi saya belum sempat menanganinya — kalau kejadian, admin perlu membetulkan peserta babak berikutnya secara manual.
- **Tren naik/turun di peringkat** — sekarang dihitung dari perubahan rating terakhir tiap atlet (`getRecentTrends`), bukan lagi kosong. Muncul di kolom "Tren" halaman `/ranking`.
- **Edit profil sendiri** (`/settings`) — atlet bisa ubah kota, tangan dominan, posisi favorit, dan bio pendek. Bio dan info ini juga muncul di halaman profil publik kalau sudah diisi.

## Baru: landing page sudah masuk ke proyek Next.js

Sebelumnya landing page cuma ada sebagai file HTML berdiri sendiri (di luar proyek ini).
Sekarang jadi rute `/` di aplikasi yang sama:

- `src/app/page.tsx` — struktur sama seperti versi HTML (hero, marquee, stats, preview peringkat, sistem level, "cari lawan", kompetisi, cara main, pelatih, wasit, CTA akhir, footer), ditulis ulang pakai Tailwind + komponen React, bukan HTML statis.
- **Data yang sudah nyata** (bukan lagi contoh): jumlah atlet/pertandingan/kompetisi/lapangan di bagian statistik, 5 peringkat teratas, daftar kompetisi yang dibuka, daftar pelatih, daftar wasit — semuanya lewat `getPublicStats()` dan query lain di `queries.ts`. Bagian "Lawan tandingmu udah nunggu" sengaja tetap pakai contoh ilustratif (Arif/Daniel/Salsa) karena itu perlu rating atlet yang sedang login untuk dihitung — jadi belum bisa dipersonalisasi sebelum orang masuk akun.
- **Logo dan foto** dipindah jadi file asli di `public/logo/` dan `public/images/` (bukan base64 ditempel di HTML seperti sebelumnya), dipakai lewat `next/image`.
- Tombol/link yang butuh login (lihat peringkat lengkap, buka kompetisi, tantang pemain) mengarah ke `/login` — itu wajar karena halaman-halaman itu memang diproteksi middleware untuk pengguna yang sudah masuk.
- Landing page ini **tidak diproteksi** middleware, jadi siapa pun bisa membukanya tanpa login — sesuai fungsinya sebagai halaman depan publik.

## Baru: kompetisi publik & staf (pelatih/wasit) nyata

- **`/competitions`** — atlet bisa lihat daftar kompetisi yang dibuka, buka detailnya, dan daftar sendiri (`RegisterCompetitionForm` → `registerForCompetitionAction`, sudah mengecek syarat rating dan kuota/waiting list).
- **Pelatih & wasit (admin)** — `/admin/trainers` dan `/admin/referees` sekarang CRUD nyata: form tambah membuat akun `User` (role TRAINER/REFEREE) plus profilnya sekaligus, dengan kata sandi sementara yang ditampilkan sekali ke admin. Status (aktif/nonaktif/ditangguhkan) bisa diubah langsung dari tabel.
- Tidak ada lagi halaman yang membaca dari `mock-data.ts` — filenya sudah dihapus dari proyek.

## Belum selesai / perlu diketahui

- **Belum pernah dijalankan.** Tidak ada akses internet/database di lingkungan pengerjaan ini, jadi `npm install`, `prisma migrate`, dan `next dev` belum pernah benar-benar dieksekusi. Semua file sudah dicek pakai `tsc` (nol galat sungguhan — sisanya cuma "module not found" karena `node_modules` belum ada), tapi itu tidak sama dengan menjalankan aplikasinya. Bracket generator khususnya (`src/server/services/bracket.ts`) itu logika yang cukup rumit — sudah saya telusuri manual baris per baris untuk cari bug (dan memang nemu satu, sudah dibetulkan — lihat catatan "Perbaikan" di bawah), tapi belum pernah dicoba jalan di database sungguhan.
- **Koreksi hasil** tidak menghitung ulang pertandingan-pertandingan berikutnya yang dimainkan atlet tersebut — mereka tetap memakai rating yang berlaku saat itu diverifikasi. Untuk pertandingan bracket, koreksi juga belum mencabut pemenang lama dari babak berikutnya (lihat catatan di atas).
- **Kata sandi sementara pelatih/wasit** ditampilkan langsung di layar admin, bukan dikirim lewat email — belum ada pengiriman email di proyek ini.
- Bracket cuma mendukung format single elimination. Double elimination atau round-robin belum ada.
- Belum ada halaman untuk atlet membatalkan pendaftaran kompetisi sendiri (admin bisa lewat "Keluarkan" di panel kelola peserta).

## Perbaikan dari sesi sebelumnya

Saat menulis `bracket.ts`, saya sempat salah arah waktu menghubungkan `nextMatchId` — kodenya menunjuk ke pertandingan babak *sebelumnya*, bukan babak *berikutnya* (kebalik). Sudah saya perbaiki: sekarang setiap babak baru dibuat dulu, baru babak sebelumnya di-update supaya `nextMatchId`-nya menunjuk maju dengan benar. Saya sebutkan ini biar transparan bahwa kode kompleks seperti ini saya tinjau ulang sendiri sebelum dianggap selesai, bukan cuma ditulis sekali lalu diserahkan.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env        # isi DATABASE_URL dan AUTH_SECRET (npx auth secret)
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Login setelah seeding:
- Admin: `[email protected]` / `admin12345`
- Atlet contoh: `gifar@example.com` / `atlet12345`

## Struktur

```
prisma/schema.prisma          Model database
prisma/seed.ts                Data awal
src/lib/rating/                Algoritma rating & level (murni, tanpa database)
src/lib/score.ts               Parser skor pertandingan
src/server/services/           Logika transaksional (verifikasi/koreksi pertandingan)
src/server/queries.ts          Semua query baca (dipakai server component)
src/server/actions/            Server actions (ditempel ke form/tombol)
src/server/guards.ts           Pengecekan sesi admin/atlet
src/app/(athlete)/             Aplikasi atlet
src/app/admin/                 Aplikasi admin
src/auth.ts / auth.config.ts   NextAuth
src/middleware.ts              Proteksi rute
```
