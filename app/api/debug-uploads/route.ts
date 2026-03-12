import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const uploadsDir = path.join(process.cwd(), "uploads");
  try {
    const files = await fs.readdir(uploadsDir);
    return NextResponse.json({ files });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
