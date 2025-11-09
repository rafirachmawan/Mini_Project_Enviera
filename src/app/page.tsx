export default function Home() {
  return (
    <div className="grid">
      {/* HERO: Hanya penjelasan, tanpa tombol */}
      <section className="card card-lg">
        <div className="card-inner">
          <h1
            className="section-title"
            style={{ fontSize: 28, marginBottom: 8 }}
          >
            Jadwalkan Pertemuan dengan Mudah
          </h1>
          <p className="subtle" style={{ maxWidth: 840, lineHeight: 1.6 }}>
            Engine slot 14 hari ke depan dengan minimum notice, buffer
            before/after, blackout dates, dan anti double booking (unique index
            + transaksi). Semua waktu disimpan dalam UTC; UI menyesuaikan zona
            waktu pengguna.
          </p>
        </div>
      </section>

      {/* DUA KOLOM: Mulai Cepat & Fitur — tanpa tombol */}
      <section className="grid grid-2">
        <div className="card card-lg">
          <div className="card-inner">
            <h2 className="section-title">Mulai Cepat</h2>
            <ol className="mt-3" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
              <li className="mt-2">
                Buka <span className="kbd">/organizer/ORG1/settings</span> lalu
                klik <b>Simpan</b> untuk membuat organizer + pengaturan.
              </li>
              <li className="mt-2">
                Bagikan link publik <span className="kbd">/ORG1</span> kepada
                invitee untuk memesan slot.
              </li>
              <li className="mt-2">
                Kelola pemesanan di <span className="kbd">/organizer/ORG1</span>{" "}
                (reschedule & cancel).
              </li>
            </ol>
          </div>
        </div>

        <div className="card card-lg">
          <div className="card-inner">
            <h2 className="section-title">Fitur</h2>
            <ul className="mt-3" style={{ paddingLeft: 18, lineHeight: 1.8 }}>
              <li>Minimum notice, buffer before/after</li>
              <li>Blackout dates per tanggal lokal organizer</li>
              <li>Anti double booking (unique index + transaksi)</li>
              <li>Penyimpanan server-side (Prisma/SQLite)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
