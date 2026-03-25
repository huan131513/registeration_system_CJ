import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const labels = await prisma.folderLabel.findMany();
    const map: Record<string, string> = {};
    for (const l of labels) map[l.key] = l.label;
    return NextResponse.json({ labels: map });
  } catch (error) {
    console.error("Folder labels GET error:", error);
    return NextResponse.json({ error: "讀取失敗" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { key, label } = await request.json();
    if (!key || !label) {
      return NextResponse.json({ error: "缺少欄位" }, { status: 400 });
    }
    await prisma.folderLabel.upsert({
      where: { key },
      update: { label },
      create: { key, label },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Folder labels PUT error:", error);
    return NextResponse.json({ error: "儲存失敗" }, { status: 500 });
  }
}
