import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: { organizerId: string } }
) {
  const now = new Date();
  const rows = await prisma.booking.findMany({
    where: {
      organizerId: params.organizerId,
      status: "CONFIRMED",
      endAtUtc: { gt: now },
    },
    orderBy: { startAtUtc: "asc" },
  });
  return NextResponse.json({ ok: true, data: rows });
}
