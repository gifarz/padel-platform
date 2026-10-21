# Audit & perbaikan — Platform Padel PBPI Garut

Semua perubahan di sini adalah hasil membaca seluruh kode (server actions, services, queries, halaman, komponen).
**Catatan jujur:** lingkungan kerja tidak punya akses internet/database, jadi `npm install`, `prisma migrate`, dan
`next build` **belum dijalankan**. Semua file lolos pengecekan sintaks TypeScript, tetapi type-check penuh dan uji
manual perlu kamu jalankan (lihat "Cara menerapkan" di bawah).

## Jawaban pertanyaan awal: kenapa kompetisi hanya "Draf"?

`createCompetitionAction` memang selalu membuat status `DRAFT`, dan `updateCompetitionStatusAction` sudah ada di server
**tetapi tidak dipanggil dari UI mana pun**. Tidak ada tombol untuk membuka pendaftaran, jadi kompetisi tidak pernah keluar dari draf
(dan halaman publik hanya menampilkan `REGISTRATION_OPEN / CLOSED / ONGOING`).

Sekarang di halaman **Admin → Kompetisi → Kelola** ada kotak "Langkah berikutnya" dengan tombol sesuai status:

```
DRAFT → Buka pendaftaran → Tutup pendaftaran → (konfirmasi peserta) → Buat bracket → ONGOING → (verifikasi hasil) → COMPLETED
                                  ↑ bisa dibuka lagi        CANCELLED bisa dari status mana pun yang belum selesai
```

Aturan alur ada di satu tempat (`src/lib/competition.ts`) dan ditegakkan di server.

## Temuan & perbaikan

### Kritis (data/ranking bisa rusak)
| # | Temuan | Perbaikan |
|---|--------|-----------|
| 1 | `submitResultAction` tidak cek status: pemain bisa menimpa hasil yang **sudah diverifikasi**, lalu verifikasi ulang = poin dihitung dua kali. | Hanya boleh saat `ACCEPTED/SCHEDULED`, update dijaga (`updateMany` dengan kondisi status), wajib dua sisi pemain. |
| 2 | `acceptMatchAction`: penantang bisa menerima tantangannya sendiri, dan bisa dipanggil di status apa pun. | Wajib status `REQUESTED` dan bukan penantang. |
| 3 | `declineMatchAction`: bisa membatalkan pertandingan **VERIFIED** / yang sedang berjalan. | Hanya saat `REQUESTED`; penantang kini bisa "Batalkan". |
| 4 | Koreksi hasil pertandingan bracket: pemenang lama tidak dicabut dari babak berikutnya (dua pemenang di satu tim). Tercatat sebagai batasan di README lama. | `retractWinners()` mencabut pemenang lama; ditolak jika babak berikutnya sudah dimainkan. Status peserta (Gugur/Juara) dan status kompetisi ikut dikembalikan. |
| 5 | Bracket **ganda**: pasangan (partner) tidak pernah dimasukkan ke pertandingan babak 1; seeding hanya dari rating pemain pertama; format ditebak dari peserta pertama. | Kedua pemain masuk satu tim, seed = rata-rata pasangan, format dari kategori kompetisi, wajib punya pasangan. |
| 6 | Bye ikut dihitung sebagai "pertandingan terverifikasi" di statistik landing page & riwayat profil. | Bye (tanpa tim B) dikecualikan. |
| 7 | Halaman kompetisi **draf** bisa dibuka lewat URL langsung (`/competitions/<id>`). | Draf → 404 untuk publik. |

### Keamanan
| # | Temuan | Perbaikan |
|---|--------|-----------|
| 8 | Kata sandi sementara dibuat dengan `Math.random()` (bisa ditebak). | `crypto.randomBytes` (`src/lib/password.ts`). |
| 9 | Akun yang dinonaktifkan **tetap bisa login/aksi** sampai token JWT habis. | Semua guard cek `isActive` di DB; sesi 7 hari. |
| 10 | Tidak ada pembatasan percobaan login. | Pembatas in-memory 8 gagal / 15 menit per nomor HP. |
| 11 | Website/Instagram klub disimpan mentah ke `<a href>` (bisa `javascript:`). | Hanya http(s); Instagram dinormalisasi dari `@user`. |
| 12 | Tidak ada cara mengganti kata sandi sementara (README menyebutnya, fitur tidak ada). | Form "Ganti kata sandi" di `/settings` dan `/staff`. |
| 13 | Pesan error Prisma mentah bocor ke form (atlet, pelatih, wasit, klub). | Pesan ramah; detail internal disembunyikan. |
| 14 | Upload: body besar di-buffer sebelum dicek ukurannya. | Cek `Content-Length` lebih dulu. |

### Bug fungsional
| # | Temuan | Perbaikan |
|---|--------|-----------|
| 15 | Tidak ada validasi kompetisi: tanggal akhir < mulai, deadline setelah mulai, maks peserta non-angka, rating min > maks, kategori/status bebas. | Skema `zod` + aturan tanggal/rating. |
| 16 | Pendaftaran tidak cek **batas pendaftaran**, jenis kelamin kategori, pasangan (ID cuid diketik manual!), pasangan sudah terdaftar, kuota (race condition). | Cek semua; pasangan lewat **username**; transaksi Serializable; kategori ganda wajib pasangan. |
| 17 | Tidak ada pembatalan pendaftaran, waitlist tidak pernah dipromosikan. | Atlet bisa batal; waitlist naik otomatis saat ada kursi kosong. |
| 18 | Tidak ada edit/hapus kompetisi (salah ketik = buat ulang). | Form "Ubah kompetisi" + hapus (draf/dibatalkan tanpa pertandingan). |
| 19 | Status peserta/kompetisi tidak divalidasi; bracket tidak mengubah status; hasil final tidak menutup kompetisi; peserta tidak pernah jadi Gugur/Juara. | Semua otomatis: buat bracket → Berlangsung, verifikasi → Gugur/Juara, final → Selesai. |
| 20 | Filter level di `/players` dilakukan **setelah** pagination (halaman pendek, total salah). | Filter berdasarkan rentang rating di database. |
| 21 | Atlet nonaktif tetap muncul di ranking, direktori, pencarian lawan, statistik. | Disaring. |
| 22 | Pelatih/wasit dibuat dalam dua langkah → akun yatim jika langkah kedua gagal. | Satu tulis bersarang (satu transaksi). |
| 23 | `/settings` mewajibkan "Kota" padahal atlet dibuat admin hanya dengan kecamatan → tidak bisa menyimpan profil. | Kota opsional; enum tangan/posisi divalidasi. |
| 24 | Tombol "Tantang pemain" tidak memberi umpan balik dan bisa dobel. | Redirect ke `/matches`, cegah duplikat, pesan error. |
| 25 | Dashboard memuat 500 baris hanya untuk menghitung peringkat. | `getMyRank` (2 query `count`). |
| 26 | `parseLocalDateTime` menolak nilai dengan detik; skor set seri (mis. `6-6`) diterima. | Diperbaiki. |
| 27 | Klub/lokasi dihapus tanpa transaksi; lokasi bisa dihapus walau lapangannya dipakai kompetisi. | Transaksi + pengecekan. |
| 28 | Indeks DB kurang untuk query bracket/peserta. | Migrasi `20261021000000_add_indexes`. |
| 29 | `tsconfig.tsbuildinfo` (159 KB) ikut di zip, tidak ada `.gitignore`. | Dihapus, `.gitignore` ditambah. |

## Yang sengaja TIDAK diubah / perlu keputusanmu
- **Port tidak konsisten**: `.env.example` memakai 3011, `ecosystem.config.js` memakai 3030. Samakan sesuai server.
- **Koreksi hasil tidak menghitung ulang** pertandingan berikutnya di luar bracket (batasan lama, tetap).
- **Tidak ada aksi "penyesuaian poin admin"** padahal enum `ADMIN_ADJUSTMENT` dan komentar kode merujuknya.
- **Pembatas login** hanya di memori proses (cukup untuk 1 instance PM2). Pakai Redis/proxy jika scale-out. Efek samping: penyerang bisa mengunci nomor korban 15 menit.
- Wasit **belum bisa** memverifikasi hasil (hanya admin), walau komentar lama menyebut "admin atau wasit".
- Nama kolom `rating` tetap (UI memakai istilah "Poin").

## Cara menerapkan
```bash
npm install
npx prisma migrate deploy      # menerapkan migrasi indeks baru (aman, hanya CREATE INDEX)
npm run typecheck              # jalankan ini — saya tidak bisa menjalankannya di sini
npm run build
```
Lalu uji alur: buat kompetisi → Buka pendaftaran → daftar sebagai atlet → konfirmasi → Tutup pendaftaran → Buat bracket
→ input & verifikasi skor sampai final → status berubah Selesai.
