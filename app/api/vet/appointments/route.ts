import { normalizeImageUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/jwt";
import { sendEmail } from "@/lib/email";

// GET: Get all appointments for the logged-in vet
export async function GET(req: NextRequest) {
  try {
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

    // Get vet user to verify role
    const vet = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!vet || vet.role !== "VET") {
      return NextResponse.json(
        { error: "Only veterinarians can access this endpoint" },
        { status: 403 }
      );
    }

    // Get all appointments for this vet with linked analysis
    const appointments = await prisma.appointment.findMany({
      where: { vetId: payload.userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        analysis: true,
      },
      orderBy: { appointmentDate: "desc" },
    });

    // Backfill analysis for older appointments that were created before analysisId existed.
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(process.cwd(), 'uploads');


    const appointmentsWithDiagnostics = await Promise.all(
      appointments.map(async (appointment) => {
        let analysis = appointment.analysis;
        if (!analysis) {
          analysis = await prisma.analysis.findFirst({
            where: { userId: appointment.userId },
            orderBy: { createdAt: "desc" },
          });
        }


        let imageUrl = normalizeImageUrl(analysis?.imageUrl);

        let imageExists = false;
        if (imageUrl && imageUrl.startsWith('/uploads/')) {
          const filePath = path.join(uploadsDir, imageUrl.replace(/^\/uploads\//, ''));
          try {
            imageExists = fs.existsSync(filePath);
          } catch (e) {
            imageExists = false;
          }
        }

        return {
          ...appointment,
          analysis: analysis
            ? {
                ...analysis,
                imageUrl, // normalized
                imageDiagnostics: {
                  imageUrl,
                  imageExists,
                },
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      appointments: appointmentsWithDiagnostics,
    });
  } catch (error) {
    console.error("Failed to fetch vet appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// PATCH: Approve or update an appointment
export async function PATCH(req: NextRequest) {
  try {
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

    // Get vet user to verify role
    const vet = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!vet || vet.role !== "VET") {
      return NextResponse.json(
        { error: "Only veterinarians can access this endpoint" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { appointmentId, status } = body;

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: "appointmentId and status are required" },
        { status: 400 }
      );
    }

    if (!["CONFIRMED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be CONFIRMED or CANCELLED" },
        { status: 400 }
      );
    }

    // Get appointment and verify it belongs to this vet
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (appointment.vetId !== payload.userId) {
      return NextResponse.json(
        { error: "You can only manage your own appointments" },
        { status: 403 }
      );
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    // Send confirmation email if approved
    if (status === "CONFIRMED") {
      try {
        const confirmationEmail = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Appointment Confirmed!</h2>
            <p>Your appointment has been confirmed by the veterinarian.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
              <p><strong>Veterinarian:</strong> ${vet.name}</p>
              <p><strong>Date:</strong> ${appointment.appointmentDate.toLocaleString()}</p>
              ${appointment.reason ? `<p><strong>Reason:</strong> ${appointment.reason}</p>` : ""}
            </div>
            
            <p style="margin-top: 20px;">
              Please arrive 10-15 minutes before your scheduled appointment time.
            </p>
            
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
              If you need to reschedule or cancel, please contact us as soon as possible.
            </p>
          </div>
        `;

        await sendEmail({
          to: appointment.user.email,
          subject: "Your Appointment Has Been Confirmed",
          html: confirmationEmail,
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      message: `Appointment ${status.toLowerCase()}`,
    });
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}
