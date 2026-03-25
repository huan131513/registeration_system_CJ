import { NextRequest, NextResponse } from "next/server";
import { generateAttendanceXlsx } from "@/lib/exportXlsx";

export async function POST(request: NextRequest) {
  try {
    const { year, semester, courseName, students, dates } = await request.json();

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "無學員資料" }, { status: 400 });
    }

    const buffer = generateAttendanceXlsx(
      year || "",
      semester || "",
      courseName || "課程",
      students,
      dates || []
    );

    const fileName = `${year}${semester}-${courseName || "點名單"}`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Attendance export error:", error);
    return NextResponse.json({ error: "匯出失敗" }, { status: 500 });
  }
}
