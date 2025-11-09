import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Body = { bookingId: string; newStartAtUtc: string };

export async function POST(
  req: Request,
  { params }: { params: { organizerId: string } }
) {
  const body = (await req.json()) as Body;
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
  const newStart = new Date(body.newStartAtUtc);
  const newEnd = new Date(newStart.getTime() + s.meetingDurationMin * 60000);

  const earliest = new Date(Date.now() + s.minimumNoticeMin * 60000);
  if (newStart < earliest)
    return NextResponse.json(
      { ok: false, error: "Minimum notice not met" },
      { status: 400 }
    );

  try {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: body.bookingId },
        data: { status: "CANCELED" },
      });
      await tx.booking.create({
        data: {
          organizerId: org.id,
          inviteeName: "(rescheduled)",
          inviteeEmail: "",
          startAtUtc: newStart,
          endAtUtc: newEnd,
          status: "CONFIRMED",
        },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.code === "P2002")
      return NextResponse.json(
        { ok: false, error: "New slot already taken" },
        { status: 409 }
      );
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
