# GymBro: warm training journal

## Brief pengguna

Rombak tampilan dari awal. Modern casual, hangat, eye catching, terasa seperti teman gym, mudah dipakai di HP. Kalender memberi animasi pada hari yang punya history latihan. Tetap tanpa emoji dekoratif.

## Arah implementasi

Jurnal latihan yang ramah: kertas krem, panel peach, terracotta untuk aksi, olive untuk rutinitas dan konsistensi. Fraunces memberi karakter pada judul; DM Sans menjaga label, angka, dan form tetap mudah dipindai. Logo memakai monogram G yang menyatu dengan barbel, warna charcoal/cream/peach, tanpa gradient. Bentuk sederhana tetap terbaca di favicon 32px dan digunakan konsisten di header, autentikasi, landing, serta kartu share.

ENERGY 5 / RHYTHM 6 / MOTION 3. Ruang lega pada sambutan, daftar lebih rapat pada aktivitas, tombol besar pada alur latihan. Aksen visual memakai ikon alat gym yang sudah tersedia dan motif piring beban. Tidak ada testimoni, profil pengguna, atau angka pemasaran yang direka.

## Referensi luar

- [Gentler Streak](https://gentlerstories.com/gentlerstreak): pendekatan yang ramah pada konsistensi dan progres pribadi. Diadaptasi sebagai arah suasana, bahasa, dan permukaan hangat.
- [Hevy](https://www.hevyapp.com/): kejelasan pencatatan set, rutinitas, dan history menjadi acuan hierarki tugas.
- Hasil pencarian skill UI/UX Pro Max: fitness/athletic typography, hierarki aksi, touch spacing, reduced motion. Rekomendasi awal claymorphism/pink tidak sesuai brief ini dan tidak diterapkan. Tampilan tidak menyalin layout atau aset referensi.

## Warna

| Peran | Warna |
| --- | --- |
| Latar | `#f8f5ef` |
| Permukaan | `#fffdf9` |
| Teks utama | `#342b25` |
| Teks pendukung | `#77695d` |
| Aksi terracotta | `#ad4d31` |
| Peach | `#f1dfce` |
| Olive | `#61714e` |
| Latar olive | `#e9eddf` |

Utility warna slate lama dipetakan ke warna hangat untuk menjaga semua layar konsisten. Utility `text-white` lama menjadi teks utama; kontrol berwarna menetapkan foreground terang secara eksplisit. Komponen baru mengutamakan token semantic `background`, `foreground`, `card`, dan `primary`.

## Kalender dan gerakan

- Data berasal dari sesi selesai milik pengguna. Tanggal dipilih dan tanggal dengan history adalah dua keadaan yang berbeda.
- Cap muncul 420 ms, check digambar 360 ms, stagger maksimal 210 ms. Efek berjalan sekali saat tanda muncul atau bulan dimuat, tanpa loop.
- Pindah bulan 200 ms; detail sesi 180 ms. Animasi hanya memakai transform, opacity, dan stroke; ukuran sel tetap.
- Kolom tujuh hari memakai `minmax(0, 1fr)`, tombol `width: 100%`, tinggi tetap, dan jarak 8px. Focus ring berada di dalam sel.
- `prefers-reduced-motion` meniadakan perpindahan dan jeda animasi; status serta check tetap terlihat.

## Mode gelap

Permintaan lanjutan pengguna: dark mode dengan karakter hangat yang sama. Latar charcoal cokelat `#1c1713`, kartu `#261f1a`, teks cream `#f5eadd`, aksen peach `#e4a17d`, dan olive lembut. Kalender tetap membedakan tanda latihan, hari ini, pilihan, dan fokus tanpa mengubah ukuran sel. Grafik memakai token tema untuk axis, seri, dan tooltip.

Tombol bulan/matahari berukuran 44px tersedia di landing, autentikasi, header aplikasi, dan ruang latihan. Tema awal mengikuti perangkat; pilihan manual tersimpan secara lokal dan tersinkron antar tab. Skrip awal memasang tema sebelum konten ditampilkan. Perubahan preferensi perangkat diikuti selama belum ada pilihan manual.

## Kartu berbagi latihan

Editor kartu mengikuti palet jurnal GymBro: Oat, Clay, Olive, Night, serta PNG transparan untuk ditempel di foto. Tiga rasio ekspor: Post 1080×1350, Story 1080×1920, dan persegi 1080×1080. Preview menggunakan SVG yang sama dengan ekspor PNG agar komposisinya konsisten. Tema kartu dipilih terpisah dari tema aplikasi.

Hierarki kartu: nama sesi, durasi/volume/set, lalu gerakan atau fokus otot. Bodyweight tetap berkontribusi pada jumlah set dan repetisi; radar/heatmap menggambarkan distribusi set, bukan kekuatan atau diagnosis otot. Nama bisa disembunyikan; email dan catatan pribadi tidak dicetak. Judul di editor tidak mengubah data latihan. Kartu transparan memakai teks putih dengan petunjuk untuk ditempel di foto gelap.

Dialog native mendukung Escape dan pemulihan fokus, footer aksi selalu terlihat, sementara isi editor dapat digulir. Berbagi file memakai share sheet perangkat jika tersedia; unduh PNG dan salin caption tersedia sebagai jalur lain. PNG disiapkan sebelum tombol bagikan ditekan agar pemanggilan share tetap berada dalam interaksi pengguna.

## Figur otot 3D

Heatmap dan Gabungan memakai model anatomi 3D sungguhan, dengan permukaan netral matte dan warna otot mengikuti jumlah set sesi. Preview menyediakan kontrol sudut yang bisa dipakai lewat drag atau keyboard, tampilan depan/belakang, serta putar/jeda. Putaran bersifat pilihan pengguna dan berhenti saat reduced motion aktif atau tab disembunyikan. PNG memakai pose setelah dijeda.

Model dan renderer hanya dimuat saat layout tersebut dipilih. Kegagalan WebGL memakai ilustrasi 2D dengan keterangan yang jelas. Sesuai permintaan pengguna, gambar kartu dan kontrol editor bersih dari teks kredit dan penjelasan tambahan yang disebutkan pengguna. Kredit model tersedia di caption serta file lisensi; rincian sumber dan penyiapan ada di `docs/anatomy-3d.md`.

Halaman Progres memakai model anatomi yang sama di tab Kelompok otot, dengan intensitas mengikuti volume latihan. Angka volume dan repetisi tetap terbaca di bawah model. Penampil Progres tidak membuat snapshot PNG saat diputar.

## Pembuka dashboard

Pengguna menolak banner motivasi pada Home. Pembuka dashboard sekarang langsung berada di latar halaman, memakai DM Sans, sapaan singkat, sesi terakhir dari data nyata, dan aksi Mulai latihan/Rutinitas. Tidak memakai judul serif miring, slogan, paragraf motivasi, panel berwarna besar, atau ilustrasi beban. Desktop menempatkan aksi di kanan; mobile meletakkannya di bawah sapaan agar statistik cepat terlihat. Data kosong, loading, dan gagal dimuat mendapat teks singkat yang sesuai.

## Teks dan berat badan

Pengguna meminta lebih sedikit kata pengantar. Kalender memakai judul, tanggal, status, dan aksi langsung; tanpa pesan motivasi, penjelasan hari istirahat, atau label Catatan harian. Panel promosi rutinitas di Home dihapus. Riwayat memakai judul Riwayat latihan dan menampilkan lima sesi sebelum diperluas.

Tracking berat badan berada dalam tab terpisah di Progres. Form hanya berisi tanggal, kg, dan simpan/perbarui. Grafik dan selisih berat memakai warna netral/warna tema tanpa menyimpulkan naik/turun sebagai baik atau buruk. Riwayat awal lima baris, dengan edit dan hapus. Tidak ada BMI, target kesehatan, atau saran medis dalam fitur ini.

## Interaksi

Navigasi mobile berisi lima tujuan yang konsisten. Pembuatan rutinitas dan mulai latihan tampil sebagai aksi halaman, bukan memenuhi header HP. Form memakai label jelas dan batas input yang terbaca. Dialog native menahan fokus, mendukung Escape, dan mengembalikan fokus saat ditutup. Toast berada di atas navigasi mobile. Demo landing diberi label data contoh dan tidak disimpan.
