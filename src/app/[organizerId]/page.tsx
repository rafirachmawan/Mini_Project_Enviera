"use client";

import { useEffect, useMemo, useState } from "react";

type Slot = { startUtc: string; endUtc: string };

export default function PublicBooking({
  params,
}: {
  params: { organizerId: string };
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [orgTz, setOrgTz] = useState<string>("UTC");
  const [selected, setSelected] = useState<string>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetch(`/api/public/${params.organizerId}/slots`);
      const j = await r.json();
      if (j.ok) {
        setOrgTz(j.data.timeZone);
        setSlots(j.data.slots);
      } else {
        setMsg(j.error ?? "Gagal memuat slot");
      }
      setLoading(false);
    })();
  }, [params.organizerId]);

  // Format helper
  const fmtLocalDate = (iso: string) =>
    new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(
      new Date(iso)
    );
  const fmtLocalTime = (iso: string) =>
    new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(
      new Date(iso)
    );
  const fmtLocalDateTime = (iso: string) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));

  // Group slots by local date label
  const grouped = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const label = fmtLocalDate(s.startUtc);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(s);
    }
    return Array.from(map.entries());
  }, [slots]);

  async function book() {
    if (!selected || !name || !email) return;
    setMsg(undefined);
    const r = await fetch(`/api/public/${params.organizerId}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inviteeName: name,
        inviteeEmail: email,
        startAtUtc: selected,
      }),
    });
    const j = await r.json();
    setMsg(
      j.ok ? "Berhasil! (simulasi konfirmasi)" : j.error || "Gagal memesan"
    );
  }

  const selectedPreview = selected
    ? `${fmtLocalDateTime(selected)}`
    : "— belum dipilih —";
  const canConfirm = Boolean(selected && name && email);

  return (
    <div className="grid grid-2">
      {/* KIRI: Daftar Slot */}
      <section className="card card-lg">
        <div className="card-inner">
          <h2 className="section-title">Pilih Slot</h2>
          <div className="subtle">Organizer TZ: {orgTz}</div>

          {loading && <div className="mt-3 subtle">Memuat slot…</div>}
          {!loading && slots.length === 0 && (
            <div className="mt-3 subtle">Tidak ada slot tersedia.</div>
          )}

          {!loading && slots.length > 0 && (
            <div className="slot-list mt-3">
              {grouped.map(([label, list]) => (
                <div key={label}>
                  <div className="slot-date">{label}</div>
                  <div className="slot-list">
                    {list.map((s) => (
                      <button
                        key={s.startUtc}
                        onClick={() => setSelected(s.startUtc)}
                        className={`slot-btn ${
                          selected === s.startUtc ? "selected" : ""
                        }`}
                        aria-pressed={selected === s.startUtc}
                      >
                        <div className="slot-line">
                          <span className="slot-time">
                            {fmtLocalTime(s.startUtc)}
                          </span>
                          <span className="slot-arrow">→</span>
                          <span className="slot-time">
                            {fmtLocalTime(s.endUtc)}
                          </span>
                        </div>
                        <div className="slot-iso subtle">
                          {fmtLocalDateTime(s.startUtc)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* KANAN: Detail Invitee */}
      <aside className="card card-lg">
        <div className="card-inner">
          <h3 className="section-title">Detail Invitee</h3>

          <div className="subtle">Slot terpilih</div>
          <div className="slot-preview">{selectedPreview}</div>

          <div className="mt-3 grid">
            <input
              className="input"
              placeholder="Nama"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button onClick={book} disabled={!canConfirm} className="btn">
              Konfirmasi
            </button>

            {msg && <div className="subtle">{msg}</div>}
          </div>
        </div>
      </aside>
    </div>
  );
}
