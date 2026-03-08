import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  district: z.string().trim().min(2).max(120).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["USER", "VET"]).default("USER"),
}).superRefine((data, ctx) => {
  if (data.role === "VET" && (!data.district || data.district.trim().length < 2)) {
    ctx.addIssue({
      path: ["district"],
      code: z.ZodIssueCode.custom,
      message: "District is required for veterinarians",
    });
  }
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const appointmentSchema = z.object({
  appointmentDate: z.date().refine(
    (date) => date > new Date(),
    {
      message: "Appointment date must be in the future",
    }
  ),
  reason: z.string().min(1).optional().nullable(),
  vetId: z.string().min(1, "Vet ID is required").optional(),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  disease: z
    .enum(["HEALTHY", "FOOT_AND_MOUTH", "LUMPY_SKIN", "ANTHRAX", "MASTITIS"])
    .optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      })
    )
    .max(12)
    .optional(),
  responseMode: z.enum(["concise", "detailed"]).optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
