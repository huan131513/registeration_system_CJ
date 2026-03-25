import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const run = await prisma.lotteryRun.findUnique({
      where: { id },
      include: { results: { orderBy: { order: "asc" } } },
    });

    if (!run) {
      return NextResponse.json({ error: "找不到該筆紀錄" }, { status: 404 });
    }

    return NextResponse.json({ run });
  } catch (error) {
    console.error("History detail error:", error);
    return NextResponse.json(
      { error: "讀取紀錄詳情時發生錯誤" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.lotteryRun.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("History delete error:", error);
    return NextResponse.json(
      { error: "刪除紀錄時發生錯誤" },
      { status: 500 }
    );
  }
}
