import { NextRequest, NextResponse } from "next/server";
import { generateResultXlsx, generatePointsXlsx } from "@/lib/exportXlsx";
import { LotteryResultItem, PointsEntry } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      results,
      courseName,
      exportType,
      updatedPoints,
      pointsFileName,
    }: {
      results?: LotteryResultItem[];
      courseName?: string;
      exportType?: "results" | "points";
      updatedPoints?: PointsEntry[];
      pointsFileName?: string;
    } = body;

    if (exportType === "points") {
      if (!updatedPoints || !Array.isArray(updatedPoints) || updatedPoints.length === 0) {
        return NextResponse.json({ error: "無積分資料可匯出" }, { status: 400 });
      }

      const buffer = generatePointsXlsx(updatedPoints);
      const uint8 = new Uint8Array(buffer);
      const fileName = pointsFileName || "更新後積分表";

      return new NextResponse(uint8, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}.xlsx"`,
        },
      });
    }

    // Default: export results
    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: "無結果資料可匯出" }, { status: 400 });
    }

    const buffer = generateResultXlsx(results, courseName || "抽籤結果");
    const uint8 = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(courseName || "抽籤結果")}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "匯出 Excel 時發生錯誤" },
      { status: 500 }
    );
  }
}
