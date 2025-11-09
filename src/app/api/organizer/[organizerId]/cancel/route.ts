import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { bookingId } = (await req.json()) as { bookingId: string };
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELED" },
  });
  return NextResponse.json({ ok: true });
}
