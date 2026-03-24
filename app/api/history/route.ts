import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const runs = await prisma.lotteryRun.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { results: true } },
      },
    });

    return NextResponse.json({ runs });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      { error: "讀取歷史紀錄時發生錯誤" },
      { status: 500 }
    );
  }
}
