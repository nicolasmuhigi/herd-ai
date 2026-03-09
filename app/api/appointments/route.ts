import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/jwt";
import { appointmentSchema } from "@/lib/validations";
import { sendEmail, generateAppointmentEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
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

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validationResult = appointmentSchema.safeParse({
      appointmentDate: new Date(body.appointmentDate),
      reason: body.reason,
      vetId: body.vetId,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { appointmentDate, reason, vetId } = validationResult.data;
    const analysisId = body.analysisId; // Get analysisId from body

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId: payload.userId,
        appointmentDate,
        reason: reason || null,
        vetId: vetId || null,
        analysisId: analysisId || null,
        status: "PENDING",
      },
    });

    let emailNotificationSent = false;
    let emailErrorMessage = null;

    // Send email notification to vet if email provided
    if (vetId) {
      try {
        const vet = await prisma.user.findUnique({
          where: { id: vetId },
        });

        if (vet?.email) {
          const emailContent = generateAppointmentEmail(
            vet.email,
            user.name,
            user.email,
            appointmentDate,
            reason || ""
          );

          // Use Promise.race to add a timeout wrapper
          const emailPromise = sendEmail({
            to: vet.email,
            subject: `New Appointment Booking from ${user.name}`,
            html: emailContent,
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Email timeout")), 15000)
          );

          await Promise.race([emailPromise, timeoutPromise]);
          emailNotificationSent = true;
        }
      } catch (emailError) {
        console.error("Failed to send vet notification email:", emailError);
        emailErrorMessage = emailError instanceof Error ? emailError.message : String(emailError);
        // Don't fail the appointment creation if email fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        appointment: {
          id: appointment.id,
          appointmentDate: appointment.appointmentDate,
          reason: appointment.reason,
          status: appointment.status,
          createdAt: appointment.createdAt,
        },
        emailNotificationSent,
        emailErrorMessage,
        message: vetId ? "Appointment request sent to veterinarian" : "Appointment created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Appointment creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create appointment: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// GET appointments for current user
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

    // Get appointments for user
    const appointments = await prisma.appointment.findMany({
      where: { userId: payload.userId },
      orderBy: { appointmentDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
