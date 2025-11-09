import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlots } from "@/lib/slots";

function daysBetweenInclusive(startISO: string, endISO: string): number {
  const start = new Date(`${startISO}T00:00:00Z`).getTime();
  const end = new Date(`${endISO}T00:00:00Z`).getTime();
  if (end < start) return 0;
  return Math.floor((end - start) / 86400000) + 1;
}

export async function GET(
  _: Request,
  { params }: { params: { organizerId: string } }
) {
  try {
    const org = await prisma.organizer.findUnique({
      where: { id: params.organizerId },
      include: { settings: true },
    });
    if (!org || !org.settings)
      return NextResponse.json(
        { ok: false, error: "not found" },
        { status: 404 }
      );

    const s = org.settings;
    const working = JSON.parse(s.workingHoursJson) as Record<number, string[]>;
    const blackout = JSON.parse(s.blackoutDatesJson || "[]") as string[];

    const existing = await prisma.booking.findMany({
      where: { organizerId: org.id, status: "CONFIRMED" },
      select: { startAtUtc: true, endAtUtc: true },
    });

    const now = new Date();

    // CAST supaya aman saat types lama
    const ws = (s as any).windowStartLocal as string | null | undefined;
    const we = (s as any).windowEndLocal as string | null | undefined;
    const hasWindow = !!(ws && we);

    const days = hasWindow
      ? Math.min(Math.max(daysBetweenInclusive(ws!, we!), 0), 120)
      : 14;

    if (hasWindow && days === 0) {
      return NextResponse.json({
        ok: true,
        data: { timeZone: org.timeZone, slots: [] },
      });
    }

    const slots = generateSlots(
      now,
      org.timeZone,
      working,
      s.meetingDurationMin,
      s.bufferBeforeMin,
      s.bufferAfterMin,
      s.minimumNoticeMin,
      blackout,
      existing.map((b) => ({ startAtUtc: b.startAtUtc, endAtUtc: b.endAtUtc })),
      days,
      hasWindow ? ws! : undefined
    ).map((s) => ({
      startUtc: s.startUtc.toISOString(),
      endUtc: s.endUtc.toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      data: { timeZone: org.timeZone, slots },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
