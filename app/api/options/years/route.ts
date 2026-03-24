import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULTS = ["114", "115", "116"];

export async function GET() {
  try {
    let records = await prisma.yearOption.findMany({ orderBy: { value: "asc" } });

    if (records.length === 0) {
      await prisma.yearOption.createMany({
        data: DEFAULTS.map((value) => ({ value })),
        skipDuplicates: true,
      });
      records = await prisma.yearOption.findMany({ orderBy: { value: "asc" } });
    }

    return NextResponse.json({ years: records.map((r) => r.value) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch years" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { value } = await req.json();
    if (!value || typeof value !== "string") {
      return NextResponse.json({ error: "Invalid value" }, { status: 400 });
    }
    await prisma.yearOption.deleteMany({ where: { value } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete year" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { value } = await req.json();
    if (!value || typeof value !== "string") {
      return NextResponse.json({ error: "Invalid value" }, { status: 400 });
    }

    const existing = await prisma.yearOption.findUnique({ where: { value } });
    if (existing) {
      return NextResponse.json({ error: "已存在" }, { status: 409 });
    }

    await prisma.yearOption.create({ data: { value } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save year" }, { status: 500 });
  }
}
