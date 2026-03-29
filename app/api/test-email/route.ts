import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    await sendEmail({
      to: process.env.EMAIL_USER!,
      subject: "Test Email from Herd AI Platform",
      html: "<b>This is a test email sent by the platform (API route).</b>"
    });
    return NextResponse.json({ success: true, message: "Test email sent successfully" });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || e.toString() }, { status: 500 });
  }
}
