export default function OrganizerDashboard() {
  return (
    <main className="grid" style={{ gap: 16 }}>
      {/* HERO */}
      <section className="card card-lg">
        <div className="card-inner">
          <h1
            className="section-title"
            style={{ fontSize: 26, marginBottom: 10 }}
          >
            Jadwalkan Pertemuan dengan Mudah
          </h1>
          <p
            className="subtle"
            style={{ maxWidth: 960, lineHeight: 1.6, margin: 0 }}
          >
            Engine slot 14 hari ke depan dengan minimum notice, buffer
            before/after, blackout dates, dan anti double booking (unique index
            + transaksi). Semua waktu disimpan dalam UTC; UI menyesuaikan zona
            waktu pengguna.
          </p>
        </div>
      </section>

      {/* KONTEN 2 KOLOM */}
      <div className="grid grid-2">
        <section className="card">
          <div className="card-inner">
            <h2 className="section-title">Cara Pakai </h2>
            <ol
              className="mt-2"
              style={{ paddingLeft: 16, lineHeight: 1.8, margin: 0 }}
            >
              <li>
                Buka <span className="kbd">/organizer/ORG1/settings</span> lalu
                klik <b>Simpan</b> untuk membuat organizer + pengaturan.
              </li>
              <li>
                Bagikan link publik <span className="kbd">/ORG1</span> kepada
                invitee untuk memesan slot.
              </li>
              <li>
                Kelola pemesanan di{" "}
                <span className="kbd">/organizer/ORG1/bookings</span>{" "}
                (reschedule &amp; cancel).
              </li>
            </ol>
          </div>
        </section>

        <section className="card">
          <div className="card-inner">
            <h2 className="section-title">Fitur</h2>
            <ul
              className="mt-2"
              style={{ paddingLeft: 16, lineHeight: 1.8, margin: 0 }}
            >
              <li>Minimum notice, buffer before/after</li>
              <li>Blackout dates per tanggal lokal organizer</li>
              <li>Anti double booking (unique index + transaksi)</li>
              <li>Penyimpanan server-side (Prisma/SQLite)</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
