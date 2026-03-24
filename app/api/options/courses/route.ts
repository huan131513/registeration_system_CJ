import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULTS = [
  "樂齡體適能",
  "歡唱人生",
  "花編結療癒手作",
  "科技運用-手機初階班",
];

export async function GET() {
  try {
    let records = await prisma.courseOption.findMany({ orderBy: { value: "asc" } });

    if (records.length === 0) {
      await prisma.courseOption.createMany({
        data: DEFAULTS.map((value) => ({ value })),
        skipDuplicates: true,
      });
      records = await prisma.courseOption.findMany({ orderBy: { value: "asc" } });
    }

    return NextResponse.json({ courses: records.map((r) => r.value) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { value } = await req.json();
    if (!value || typeof value !== "string") {
      return NextResponse.json({ error: "Invalid value" }, { status: 400 });
    }

    const existing = await prisma.courseOption.findUnique({ where: { value } });
    if (existing) {
      return NextResponse.json({ error: "已存在" }, { status: 409 });
    }

    await prisma.courseOption.create({ data: { value } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save course" }, { status: 500 });
  }
}
