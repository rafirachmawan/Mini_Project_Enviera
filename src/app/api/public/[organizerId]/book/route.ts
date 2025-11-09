import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Body = { inviteeName: string; inviteeEmail: string; startAtUtc: string };

export async function POST(
  req: Request,
  { params }: { params: { organizerId: string } }
) {
  try {
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
    const startAt = new Date(body.startAtUtc);
    const endAt = new Date(startAt.getTime() + s.meetingDurationMin * 60000);

    // minimum notice
    const earliest = new Date(Date.now() + s.minimumNoticeMin * 60000);
    if (startAt < earliest)
      return NextResponse.json(
        { ok: false, error: "Minimum notice not met" },
        { status: 400 }
      );

    try {
      const created = await prisma.$transaction((tx) =>
        tx.booking.create({
          data: {
            organizerId: org.id,
            inviteeName: body.inviteeName,
            inviteeEmail: body.inviteeEmail,
            startAtUtc: startAt,
            endAtUtc: endAt,
            status: "CONFIRMED",
          },
        })
      );
      return NextResponse.json({ ok: true, data: created });
    } catch (e: any) {
      if (e.code === "P2002")
        return NextResponse.json(
          { ok: false, error: "Slot just got booked by someone else" },
          { status: 409 }
        );
      throw e;
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
