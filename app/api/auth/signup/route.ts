import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { signUpSchema } from "@/lib/validations";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validationResult = signUpSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(", ");
      return NextResponse.json(
        { error: errorMessages || "Validation failed" },
        { status: 400 }
      );
    }

    const { email, name, district, password, role } = validationResult.data;
    const normalizedDistrict = role === "VET" ? district?.trim() ?? null : null;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        district: normalizedDistrict,
        password: hashedPassword,
        role: role as "USER" | "VET",
      },
    });

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          district: user.district,
        },
      },
      { status: 201 }
    );

    response.cookies.set("authToken", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
