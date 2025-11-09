"use client";
import { useEffect, useState } from "react";

export default function SettingsPage({
  params,
}: {
  params: { organizerId: string };
}) {
  const [timeZone, setTimeZone] = useState("Asia/Jakarta");
  const [duration, setDuration] = useState(30);
  const [bufBefore, setBufBefore] = useState(0);
  const [bufAfter, setBufAfter] = useState(10);
  const [notice, setNotice] = useState(120);
  const [working, setWorking] = useState<Record<number, string[]>>({
    1: ["09:00-12:00", "13:00-17:00"],
    2: ["09:00-12:00", "13:00-17:00"],
    3: ["09:00-12:00", "13:00-17:00"],
    4: ["09:00-12:00", "13:00-17:00"],
    5: ["09:00-12:00", "13:00-17:00"],
    0: [],
    6: [],
  });
  const [blackout, setBlackout] = useState<string[]>([]);
  const [windowStart, setWindowStart] = useState<string>(""); // NEW YYYY-MM-DD
  const [windowEnd, setWindowEnd] = useState<string>(""); // NEW YYYY-MM-DD

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/organizer/${params.organizerId}/settings`);
      const j = await r.json();
      if (j.ok && j.data) {
        setTimeZone(j.data.organizer.timeZone);
        setDuration(j.data.meetingDurationMin);
        setBufBefore(j.data.bufferBeforeMin);
        setBufAfter(j.data.bufferAfterMin);
        setNotice(j.data.minimumNoticeMin);
        setWorking(JSON.parse(j.data.workingHoursJson));
        setBlackout(JSON.parse(j.data.blackoutDatesJson || "[]"));
        setWindowStart(j.data.windowStartLocal ?? "");
        setWindowEnd(j.data.windowEndLocal ?? "");
      }
    })();
  }, [params.organizerId]);

  async function save() {
    const r = await fetch(`/api/organizer/${params.organizerId}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timeZone,
        workingHours: working,
        meetingDurationMin: duration,
        bufferBeforeMin: bufBefore,
        bufferAfterMin: bufAfter,
        minimumNoticeMin: notice,
        blackoutDates: blackout,
        windowStartLocal: windowStart || null,
        windowEndLocal: windowEnd || null,
      }),
    });
    const j = await r.json();
    alert(j.ok ? "Saved" : j.error);
  }

  return (
    <main className="grid grid-2">
      <section className="card card-lg">
        <div className="card-inner">
          <h1 className="section-title">Pengaturan Organizer</h1>
          <p className="subtle">
            Semua waktu disimpan sebagai UTC. Zona waktu hanya untuk tampilan &
            kalkulasi slot.
          </p>

          <div className="grid grid-2 mt-3">
            <div className="card">
              <div className="card-inner grid">
                <label className="subtle">Zona Waktu (IANA)</label>
                <input
                  className="input"
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  placeholder="Asia/Jakarta"
                />

                {/* NEW: Range tanggal */}
                <div className="row">
                  <div style={{ flex: 1 }}>
                    <label className="subtle">Mulai Tanggal (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      className="input"
                      value={windowStart}
                      onChange={(e) => setWindowStart(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="subtle">
                      Sampai Tanggal (YYYY-MM-DD)
                    </label>
                    <input
                      type="date"
                      className="input"
                      value={windowEnd}
                      onChange={(e) => setWindowEnd(e.target.value)}
                    />
                  </div>
                </div>

                {/* Durasi & Notice */}
                <div className="row">
                  <div style={{ flex: 1 }}>
                    <label className="subtle">Durasi per Meet (menit)</label>
                    <input
                      type="number"
                      className="input"
                      value={duration}
                      min={5}
                      step={5}
                      onChange={(e) => setDuration(+e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="subtle">Min Notice (menit)</label>
                    <input
                      type="number"
                      className="input"
                      value={notice}
                      min={0}
                      onChange={(e) => setNotice(+e.target.value)}
                    />
                  </div>
                </div>

                {/* Buffer */}
                <div className="row">
                  <div style={{ flex: 1 }}>
                    <label className="subtle">Buffer Before</label>
                    <input
                      type="number"
                      className="input"
                      value={bufBefore}
                      min={0}
                      onChange={(e) => setBufBefore(+e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="subtle">Buffer After</label>
                    <input
                      type="number"
                      className="input"
                      value={bufAfter}
                      min={0}
                      onChange={(e) => setBufAfter(+e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={save}
                  className="btn mt-3"
                  style={{ width: "fit-content" }}
                >
                  Simpan
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-inner grid">
                <label className="subtle">Working Hours JSON</label>
                <textarea
                  className="textarea"
                  value={JSON.stringify(working, null, 2)}
                  onChange={(e) => setWorking(JSON.parse(e.target.value))}
                />

                <label className="subtle">
                  Blackout Dates JSON (YYYY-MM-DD)
                </label>
                <input
                  className="input"
                  placeholder='["2025-11-10","2025-11-20"]'
                  value={JSON.stringify(blackout)}
                  onChange={(e) => setBlackout(JSON.parse(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="card card-lg">
        <div className="card-inner">
          <h3 className="section-title">Contoh Working Hours</h3>
          <pre
            className="textarea"
            style={{ minHeight: 0, padding: 12, whiteSpace: "pre-wrap" }}
          >{`{
  "1": ["09:00-12:00", "13:00-17:00"],
  "2": ["09:00-12:00", "13:00-17:00"],
  "3": ["09:00-12:00", "13:00-17:00"],
  "4": ["09:00-12:00", "13:00-17:00"],
  "5": ["09:00-12:00", "13:00-17:00"],
  "0": [],
  "6": []
}`}</pre>
          <div className="subtle mt-3">
            Range tanggal akan membatasi slot pada tanggal lokal organizer.
            Biarkan kosong untuk default 14 hari ke depan.
          </div>
        </div>
      </aside>
    </main>
  );
}
