import { addMinutes, isBefore } from "date-fns";

export type WorkingHours = Record<number, string[]>;
export type BookingLike = { startAtUtc: Date; endAtUtc: Date };

type Slot = { startUtc: Date; endUtc: Date };

export function isBlackout(
  dateLocalISO: string,
  blackoutDates: string[]
): boolean {
  return blackoutDates.includes(dateLocalISO);
}

// Konversi pasangan (YYYY-MM-DD + HH:mm) di zona waktu organizer → Date UTC
export function parseLocalTimeToUtc(
  dateLocalISO: string,
  hhmm: string,
  timeZone: string
): Date {
  const [H, M] = hhmm.split(":").map(Number);
  const tmp = new Date(
    `${dateLocalISO}T${String(H).padStart(2, "0")}:${String(M).padStart(
      2,
      "0"
    )}:00Z`
  );
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = fmt.formatToParts(tmp);
  const y = Number(parts.find((p) => p.type === "year")!.value);
  const mo = Number(parts.find((p) => p.type === "month")!.value) - 1;
  const da = Number(parts.find((p) => p.type === "day")!.value);
  const ho = Number(parts.find((p) => p.type === "hour")!.value);
  const mi = Number(parts.find((p) => p.type === "minute")!.value);
  const se = Number(parts.find((p) => p.type === "second")!.value);
  return new Date(Date.UTC(y, mo, da, ho, mi, se));
}

function overlapsWithBuffer(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
  bufferBeforeMin: number,
  bufferAfterMin: number
): boolean {
  const aStartBuf = addMinutes(aStart, -bufferBeforeMin);
  const aEndBuf = addMinutes(aEnd, bufferAfterMin);
  const bStartBuf = addMinutes(bStart, -bufferBeforeMin);
  const bEndBuf = addMinutes(bEnd, bufferAfterMin);
  return aStartBuf < bEndBuf && bStartBuf < aEndBuf;
}

function formatLocalISO(d: Date, timeZone: string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d); // YYYY-MM-DD di TZ tsb
}

/**
 * Generate slot dalam rentang hari tertentu.
 * @param startLocalISO opsional anchor YYYY-MM-DD (lokal organizer). Default: hari ini lokal.
 */
export function generateSlots(
  nowUtc: Date,
  timeZone: string,
  workingHours: WorkingHours,
  durationMin: number,
  bufferBeforeMin: number,
  bufferAfterMin: number,
  minimumNoticeMin: number,
  blackoutDates: string[],
  existingBookings: BookingLike[],
  days = 14,
  startLocalISO?: string
): Slot[] {
  const slots: Slot[] = [];
  const earliest = addMinutes(nowUtc, minimumNoticeMin);

  let anchorLocalISO = startLocalISO ?? formatLocalISO(nowUtc, timeZone);

  for (let i = 0; i < days; i++) {
    const anchorDate = new Date(`${anchorLocalISO}T00:00:00Z`);
    const dayUtc = new Date(anchorDate.getTime() + i * 86400000);

    const localISO = formatLocalISO(dayUtc, timeZone);
    const weekday = new Date(localISO).getUTCDay();

    if (isBlackout(localISO, blackoutDates)) continue;

    const ranges = workingHours[weekday] ?? [];
    for (const range of ranges) {
      const [startHHMM, endHHMM] = range.split("-");
      let cursor = parseLocalTimeToUtc(localISO, startHHMM, timeZone);
      const endUtc = parseLocalTimeToUtc(localISO, endHHMM, timeZone);

      while (addMinutes(cursor, durationMin) <= endUtc) {
        const startUtc = cursor;
        const endSlot = addMinutes(startUtc, durationMin);

        if (isBefore(startUtc, earliest)) {
          cursor = addMinutes(cursor, durationMin);
          continue;
        }

        const conflict = existingBookings.some((b) =>
          overlapsWithBuffer(
            startUtc,
            endSlot,
            b.startAtUtc,
            b.endAtUtc,
            bufferBeforeMin,
            bufferAfterMin
          )
        );
        if (!conflict) slots.push({ startUtc, endUtc: endSlot });

        cursor = addMinutes(cursor, durationMin);
      }
    }
  }
  return slots;
}
