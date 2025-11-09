import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// optional (kalau types Prisma kamu sudah update, boleh dipakai)
// import type { Prisma } from "@prisma/client";

export async function GET(
  _: Request,
  { params }: { params: { organizerId: string } }
) {
  const data = await prisma.settings.findUnique({
    where: { organizerId: params.organizerId },
    include: { organizer: true },
  });
  return NextResponse.json({ ok: true, data });
}

export async function POST(
  req: Request,
  { params }: { params: { organizerId: string } }
) {
  const body = (await req.json()) as {
    timeZone: string;
    workingHours: Record<number, string[]>;
    meetingDurationMin: number;
    bufferBeforeMin: number;
    bufferAfterMin: number;
    minimumNoticeMin: number;
    blackoutDates?: string[];
    windowStartLocal?: string | null; // NEW
    windowEndLocal?: string | null; // NEW
  };

  // validasi sederhana
  if (
    body.windowStartLocal &&
    !/^\d{4}-\d{2}-\d{2}$/.test(body.windowStartLocal)
  ) {
    return NextResponse.json(
      { ok: false, error: "windowStartLocal invalid" },
      { status: 400 }
    );
  }
  if (body.windowEndLocal && !/^\d{4}-\d{2}-\d{2}$/.test(body.windowEndLocal)) {
    return NextResponse.json(
      { ok: false, error: "windowEndLocal invalid" },
      { status: 400 }
    );
  }

  const data = await prisma.$transaction(async (tx) => {
    await tx.organizer.upsert({
      where: { id: params.organizerId },
      update: { timeZone: body.timeZone },
      create: {
        id: params.organizerId,
        email: `${params.organizerId}@demo.test`,
        displayName: "Demo Organizer",
        timeZone: body.timeZone,
      },
    });

    // CAST supaya compile meski types Prisma Client lama (hapus cast jika types sudah update)
    return tx.settings.upsert({
      where: { organizerId: params.organizerId },
      update: {
        workingHoursJson: JSON.stringify(body.workingHours),
        meetingDurationMin: body.meetingDurationMin,
        bufferBeforeMin: body.bufferBeforeMin,
        bufferAfterMin: body.bufferAfterMin,
        minimumNoticeMin: body.minimumNoticeMin,
        blackoutDatesJson: JSON.stringify(body.blackoutDates ?? []),
        windowStartLocal: body.windowStartLocal ?? null,
        windowEndLocal: body.windowEndLocal ?? null,
      } as any,
      create: {
        organizerId: params.organizerId,
        workingHoursJson: JSON.stringify(body.workingHours),
        meetingDurationMin: body.meetingDurationMin,
        bufferBeforeMin: body.bufferBeforeMin,
        bufferAfterMin: body.bufferAfterMin,
        minimumNoticeMin: body.minimumNoticeMin,
        blackoutDatesJson: JSON.stringify(body.blackoutDates ?? []),
        windowStartLocal: body.windowStartLocal ?? null,
        windowEndLocal: body.windowEndLocal ?? null,
      } as any,
    });
  });

  return NextResponse.json({ ok: true, data });
}
