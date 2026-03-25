import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { executeLottery } from "@/lib/lottery";
import { Registrant, PointsEntry, LotteryConfig } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      registrants,
      pointsTable,
      excludedNames,
      config,
    }: {
      registrants: Registrant[];
      pointsTable: PointsEntry[];
      excludedNames: string[];
      config: LotteryConfig;
    } = body;

    if (!registrants || !Array.isArray(registrants) || registrants.length === 0) {
      return NextResponse.json({ error: "報名資料為空" }, { status: 400 });
    }

    if (!pointsTable || !Array.isArray(pointsTable)) {
      return NextResponse.json({ error: "積分表資料為空" }, { status: 400 });
    }

    if (!config || config.totalQuota <= 0) {
      return NextResponse.json({ error: "名額設定無效" }, { status: 400 });
    }

    const output = executeLottery(registrants, pointsTable, excludedNames || [], config);

    // Try to save to database (gracefully skip if DB is unavailable)
    let runId: string | null = null;
    try {
      const run = await prisma.lotteryRun.create({
        data: {
          courseName: config.courseName || "未命名課程",
          year: config.year || "",
          semester: config.semester || "",
          totalQuota: config.totalQuota,
          volunteerSlots: config.volunteerSlots,
          waitlistSlots: config.waitlistSlots,
          totalRegistrants: output.stats.totalRegistrants,
          excludedCount: output.stats.excludedCount,
          directAdmitCount: output.stats.directAdmitCount,
          exemptionCount: output.stats.exemptionCount,
          results: {
            create: output.results.map((r) => ({
              name: r.name,
              phone: r.phone,
              gender: r.gender,
              emergencyName: r.emergencyName,
              emergencyPhone: r.emergencyPhone,
              age: r.age,
              education: r.education,
              admissionType: r.admissionType,
              order: r.order,
            })),
          },
        },
        include: { results: true },
      });
      runId = run.id;
    } catch (dbError) {
      console.warn("Database unavailable, skipping history save:", dbError);
    }

    return NextResponse.json({
      runId,
      results: output.results,
      updatedPoints: output.updatedPoints,
      stats: output.stats,
    });
  } catch (error) {
    console.error("Lottery execution error:", error);
    return NextResponse.json(
      { error: "執行抽籤時發生錯誤" },
      { status: 500 }
    );
  }
}
