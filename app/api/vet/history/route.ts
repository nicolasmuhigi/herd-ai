import { normalizeImageUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/jwt";

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

    // Get vet appointments where status is CONFIRMED or CANCELLED (past appointments)
    const appointments = await prisma.appointment.findMany({
      where: {
        vetId: payload.userId,
        status: {
          in: ["CONFIRMED", "CANCELLED"],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { appointmentDate: "desc" },
    });

    // For each appointment, get the linked analysis (by analysisId),
    // or fall back to latest analysis for the user if missing.
    const appointmentsWithAnalysis = await Promise.all(
      appointments.map(async (apt) => {
        let analysis = null;
        if (apt.analysisId) {
          analysis = await prisma.analysis.findUnique({
            where: { id: apt.analysisId },
          });
        }
        if (!analysis) {
          analysis = await prisma.analysis.findFirst({
            where: { userId: apt.user.id },
            orderBy: { createdAt: "desc" },
          });
        }

        let imageUrl = normalizeImageUrl(analysis?.imageUrl);
        return {
          ...apt,
          analysis: analysis
            ? {
                ...analysis,
                imageUrl,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      appointments: appointmentsWithAnalysis,
    });
  } catch (error) {
    console.error("Failed to fetch appointment history:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment history" },
      { status: 500 }
    );
  }
}

// PATCH to update appointment outcome and resolution status
export async function PATCH(req: NextRequest) {
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

    const body = await req.json();
    const { appointmentId, outcome, resolutionStatus } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Verify the appointment belongs to this vet
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        vetId: payload.userId,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Update the appointment
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        outcome: outcome || appointment.outcome,
        resolutionStatus: resolutionStatus || appointment.resolutionStatus,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      appointment: updated,
    });
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// DELETE to delete an appointment record
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

    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get("appointmentId");

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Verify the appointment belongs to this vet
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        vetId: payload.userId,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Delete the appointment
    await prisma.appointment.delete({
      where: { id: appointmentId },
    });

    return NextResponse.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
