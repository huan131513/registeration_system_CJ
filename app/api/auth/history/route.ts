import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const correct = process.env.HISTORY_PASSWORD;

  if (!correct) {
    return NextResponse.json({ error: "未設定密碼" }, { status: 500 });
  }

  if (password !== correct) {
    return NextResponse.json({ error: "密碼錯誤" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
