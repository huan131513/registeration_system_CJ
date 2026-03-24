import { NextRequest, NextResponse } from "next/server";
import { parseRegistration } from "@/lib/parseRegistration";
import { parsePoints } from "@/lib/parsePoints";
import { parseAttendance } from "@/lib/parseAttendance";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json({ error: "未提供檔案" }, { status: 400 });
    }

    if (!type || !["registration", "points", "attendance"].includes(type)) {
      return NextResponse.json({ error: "無效的檔案類型" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();

    switch (type) {
      case "registration": {
        const result = parseRegistration(buffer);
        if (result.error) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ data: result.data, count: result.data.length });
      }
      case "points": {
        const result = parsePoints(buffer);
        if (result.error) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ data: result.data, count: result.data.length });
      }
      case "attendance": {
        const result = parseAttendance(buffer);
        if (result.error) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ names: result.names, count: result.names.length });
      }
      default:
        return NextResponse.json({ error: "未知的檔案類型" }, { status: 400 });
    }
  } catch {
    return NextResponse.json(
      { error: "伺服器處理檔案時發生錯誤" },
      { status: 500 }
    );
  }
}
