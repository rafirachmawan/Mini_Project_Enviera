"use client";
import { useEffect, useState } from "react";

type Booking = {
  id: string;
  inviteeName: string;
  inviteeEmail: string;
  startAtUtc: string;
  endAtUtc: string;
};

export default function BookingManagement({
  params,
}: {
  params: { organizerId: string };
}) {
  const [rows, setRows] = useState<Booking[]>([]);
  const [newStart, setNewStart] = useState("");

  async function load() {
    const r = await fetch(`/api/organizer/${params.organizerId}/bookings`);
    const j = await r.json();
    if (j.ok) setRows(j.data);
  }
  useEffect(() => {
    load();
  }, []);

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));

  async function cancel(id: string) {
    await fetch(`/api/organizer/${params.organizerId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: id }),
    });
    load();
  }
  async function resched(id: string) {
    if (!newStart) return alert("Isi ISO UTC baru (yyyy-mm-ddTHH:MM:SSZ)");
    const r = await fetch(`/api/organizer/${params.organizerId}/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: id, newStartAtUtc: newStart }),
    });
    const j = await r.json();
    if (!j.ok) alert(j.error);
    else load();
  }

  return (
    <main className="grid grid-3">
      <section className="card card-lg" style={{ gridColumn: "1 / span 2" }}>
        <div className="card-inner">
          <h2 className="section-title">Upcoming Bookings</h2>
          <div className="grid mt-3">
            {rows.length === 0 && <div className="subtle">Kosong.</div>}
            {rows.map((b) => (
              <div key={b.id} className="slot">
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {b.inviteeName}{" "}
                    <span className="subtle">({b.inviteeEmail})</span>
                  </div>
                  <div className="subtle">
                    {fmt(b.startAtUtc)} → {fmt(b.endAtUtc)}
                  </div>
                </div>
                <div className="row">
                  <input
                    className="input"
                    style={{ width: 260 }}
                    placeholder="new start (UTC ISO)"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                  />
                  <button
                    onClick={() => resched(b.id)}
                    className="btn btn-warning"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => cancel(b.id)}
                    className="btn btn-danger"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="card">
        <div className="card-inner">
          <h3 className="section-title">Tips</h3>
          <ul className="mt-2" style={{ paddingLeft: 16 }}>
            <li>Transaksi reschedule: lepas lama, pesan baru.</li>
            <li>
              Gunakan format <span className="kbd">YYYY-MM-DDTHH:mm:ssZ</span>.
            </li>
          </ul>
        </div>
      </aside>
    </main>
  );
}
