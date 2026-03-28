export async function DELETE(req: NextRequest) {
  try {
    // Verify authentication
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Delete all analyses
    await prisma.analysis.deleteMany({});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete analyses:", error);
    return NextResponse.json(
      { error: "Failed to delete analyses" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/jwt";
import { normalizeImageUrl } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Fetch all analyses, most recent first, with user info
    const analysesRaw = await prisma.analysis.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            district: true,
          },
        },
      },
    });

    // Normalize imageUrl for each analysis
    const analyses = analysesRaw.map((analysis) => ({
      ...analysis,
      imageUrl: normalizeImageUrl(analysis.imageUrl),
    }));

    return NextResponse.json({
      success: true,
      analyses,
    });
  } catch (error) {
    console.error("Failed to fetch analyses:", error);
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    );
  }
}
