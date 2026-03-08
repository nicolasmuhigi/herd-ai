import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/jwt";
import {
  analyzeCattleImage as analyzeCattleImageLocal,
  type PredictionResult,
} from "@/lib/model-inference";
import fs from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

const DB_DISEASE_TYPES = new Set([
  "HEALTHY",
  "FOOT_AND_MOUTH",
  "LUMPY_SKIN",
  "ANTHRAX",
]);

function toDbDiseaseType(detectedDisease: string): string {
  if (DB_DISEASE_TYPES.has(detectedDisease)) {
    return detectedDisease;
  }

  // Database enum currently has no MASTITIS value; store as ANTHRAX-compatible
  // bucket while keeping exact detected disease in detectedDisease field.
  if (detectedDisease === "MASTITIS") {
    return "ANTHRAX";
  }

  return "HEALTHY";
}

const MODEL_API_URLS = (
  process.env.MODEL_API_URLS ||
  process.env.MODEL_API_URL ||
  "http://127.0.0.1:7860/predict,http://127.0.0.1:8010/predict"
)
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

type ModelPredictions = PredictionResult;

async function analyzeCattleImage(
  imageBuffer: Buffer,
  requestOrigin?: string
): Promise<ModelPredictions> {
  const apiErrors: string[] = [];
  const isProductionRuntime = process.env.NODE_ENV === "production" || Boolean(process.env.RENDER);

  for (const apiUrl of MODEL_API_URLS) {
    try {
      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: "image/jpeg" });
      formData.append("file", blob, "image.jpg");

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        apiErrors.push(
          `${apiUrl} -> ${response.status} ${response.statusText} ${errorText}`.trim()
        );
        continue;
      }

      const result = (await response.json()) as {
        success?: boolean;
        predictions?: ModelPredictions;
      };

      if (!result.success || !result.predictions) {
        apiErrors.push(`${apiUrl} -> invalid response payload`);
        continue;
      }

      return result.predictions;
    } catch (error) {
      apiErrors.push(
        `${apiUrl} -> ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  if (isProductionRuntime) {
    const apiMessage = apiErrors.length > 0 ? apiErrors.join(" | ") : "No API endpoints configured";
    throw new Error(
      `Failed to analyze image: model API unavailable (${apiMessage}). Set MODEL_API_URL to your backend predict endpoint, e.g. https://livestock-backend.onrender.com/predict`
    );
  }

  try {
    console.warn(
      "Model API unavailable. Falling back to local inference runtime.",
      apiErrors
    );
    return await analyzeCattleImageLocal(imageBuffer, requestOrigin);
  } catch (error) {
    const localMessage = error instanceof Error ? error.message : "Unknown error";
    const apiMessage = apiErrors.length > 0 ? apiErrors.join(" | ") : "No API endpoints configured";
    throw new Error(
      `Failed to analyze image: model API unavailable (${apiMessage}). Local fallback failed: ${localMessage}`
    );
  }
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "public", "uploads");

async function ensureUploadsDir() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.error("Error creating uploads directory:", error);
  }
}

function buildUploadFileName(originalName: string): string {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${Date.now()}_${safeName}`;
}

async function saveImageBuffer(options: {
  filename: string;
  imageBuffer: Buffer;
  contentType: string;
}): Promise<string> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (blobToken) {
    const blob = await put(`uploads/${options.filename}`, options.imageBuffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: options.contentType,
      token: blobToken,
    });

    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not configured. Add it in Vercel Environment Variables for production uploads."
    );
  }

  await ensureUploadsDir();
  const filepath = path.join(uploadsDir, options.filename);
  await fs.writeFile(filepath, options.imageBuffer);
  return `/uploads/${options.filename}`;
}



function parseCoordinate(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pickDistrict(address?: Record<string, string | undefined>): string | null {
  if (!address) return null;
  const candidate =
    address.city_district ||
    address.state_district ||
    address.county ||
    address.municipality ||
    address.city ||
    address.town;

  if (!candidate) return null;
  const normalized = candidate.trim();
  return normalized.length > 0 ? normalized : null;
}

function formatAddressFromParts(address?: Record<string, string | undefined>): string {
  if (!address) return "Address not available";

  const parts = [
    address.road,
    address.neighbourhood,
    address.suburb,
    address.city_district,
    address.city || address.town || address.village,
    address.state,
  ]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  if (parts.length === 0) {
    return "Address not available";
  }

  return parts.join(", ");
}

async function resolveDistrictFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const reverseUrl =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
    const response = await fetch(reverseUrl, {
      headers: {
        "User-Agent": "HerdAI/1.0 (district-resolution)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      address?: Record<string, string | undefined>;
    };
    return pickDistrict(payload.address);
  } catch {
    return null;
  }
}

async function resolveAddressFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const reverseUrl =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const response = await fetch(reverseUrl, {
      headers: {
        "User-Agent": "HerdAI/1.0 (address-resolution)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return "Address not available";
    }

    const payload = (await response.json()) as {
      display_name?: string;
      address?: Record<string, string | undefined>;
    };

    const fromParts = formatAddressFromParts(payload.address);
    if (fromParts !== "Address not available") {
      return fromParts;
    }

    const displayName = payload.display_name?.trim();
    return displayName && displayName.length > 0 ? displayName : "Address not available";
  } catch {
    return "Address not available";
  }
}



async function findNearestVeterinaryClinic(options: {
  latitude: number | null;
  longitude: number | null;
}) {
  if (options.latitude === null || options.longitude === null) {
    return null;
  }

  try {
    // Approximate bbox from point (±0.045 degrees ≈ 5km)
    const latMin = options.latitude - 0.045;
    const latMax = options.latitude + 0.045;
    const lonMin = options.longitude - 0.045;
    const lonMax = options.longitude + 0.045;

    // Overpass API query for veterinary clinics
    const query = `[out:json];
(
  node["amenity"="veterinary"](${latMin},${lonMin},${latMax},${lonMax});
  way["amenity"="veterinary"](${latMin},${lonMin},${latMax},${lonMax});
);
out body geom;`;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: {
        "Content-Type": "application/osm3s",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      elements?: Array<{
        id: number;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: Record<string, string>;
      }>;
    };

    if (!data.elements || data.elements.length === 0) {
      return null;
    }

    // Parse and extract clinic details
    const clinics = data.elements
      .map((el) => ({
        name: el.tags?.name || "Veterinary Clinic",
        address:
          el.tags?.["addr:full"] ||
          `${el.tags?.["addr:street"] || ""} ${el.tags?.["addr:housenumber"] || ""}`
            .trim(),
        phone: el.tags?.phone || el.tags?.["contact:phone"] || null,
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon,
      }))
      .filter(
        (clinic): clinic is {
          name: string;
          address: string;
          phone: string | null;
          lat: number;
          lon: number;
        } => clinic.lat !== undefined && clinic.lon !== undefined
      );

    if (clinics.length === 0) {
      return null;
    }

    // Sort by distance and return nearest
    clinics.sort(
      (a, b) =>
        haversineKm(options.latitude, options.longitude, a.lat, a.lon) -
        haversineKm(options.latitude, options.longitude, b.lat, b.lon)
    );

    const nearest = clinics[0];
    const nearestAddress = nearest.address.trim().length
      ? nearest.address
      : await resolveAddressFromCoordinates(nearest.lat, nearest.lon);

    return {
      name: nearest.name,
      address: nearestAddress,
      phone: nearest.phone,
      distanceKm: Number(
        haversineKm(options.latitude, options.longitude, nearest.lat, nearest.lon).toFixed(1)
      ),
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = getTokenFromRequest(req) || req.cookies.get("authToken")?.value;
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

    // Parse form data
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    const latitude = parseCoordinate(formData.get("latitude"));
    const longitude = parseCoordinate(formData.get("longitude"));

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Validate image type
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image." },
        { status: 400 }
      );
    }

    // Read image buffer
    const buffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    // Save image and run model inference concurrently
    const filename = buildUploadFileName(imageFile.name);
    const [predictions, imageUrl] = await Promise.all([
      analyzeCattleImage(imageBuffer, req.nextUrl.origin),
      saveImageBuffer({
        filename,
        imageBuffer,
        contentType: imageFile.type || "application/octet-stream",
      }),
    ]);

    const dbDiseaseType = toDbDiseaseType(predictions.detectedDisease);

    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        district: true,
        latitude: true,
        longitude: true,
      },
    });

    // Parallelize district and clinic lookups instead of sequential
    const [resolvedDistrict, nearestClinic] = await Promise.all([
      latitude !== null && longitude !== null
        ? resolveDistrictFromCoordinates(latitude, longitude)
        : Promise.resolve(null),
      findNearestVeterinaryClinic({
        latitude: latitude ?? currentUser?.latitude ?? null,
        longitude: longitude ?? currentUser?.longitude ?? null,
      }),
    ]);

    const effectiveDistrict = resolvedDistrict || currentUser?.district || null;
    const effectiveLatitude = latitude ?? currentUser?.latitude ?? null;
    const effectiveLongitude = longitude ?? currentUser?.longitude ?? null;

    if (resolvedDistrict || latitude !== null || longitude !== null) {
      await prisma.user.update({
        where: { id: payload.userId },
        data: {
          district: resolvedDistrict || currentUser?.district || undefined,
          latitude: latitude ?? currentUser?.latitude ?? undefined,
          longitude: longitude ?? currentUser?.longitude ?? undefined,
        },
      });
    }

    // Save analysis to database
    const analysis = await prisma.analysis.create({
      data: {
        userId: payload.userId,
        imageUrl,
        uploadDistrict: effectiveDistrict,
        uploadLatitude: effectiveLatitude,
        uploadLongitude: effectiveLongitude,
        predictions: dbDiseaseType as any,
        confidence: predictions.confidence,
        healthy: predictions.healthy,
        footAndMouth: predictions.footAndMouth,
        lumpySkin: predictions.lumpySkin,
        anthrax: predictions.anthrax,
        detectedDisease: predictions.detectedDisease,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        imageUrl: analysis.imageUrl,
        predictions: {
          healthy: predictions.healthy,
          footAndMouth: predictions.footAndMouth,
          lumpySkin: predictions.lumpySkin,
          anthrax: predictions.anthrax,
        },
        classLabels: predictions.classLabels,
        classScores: predictions.classScores,
        detectedDisease: predictions.detectedDisease,
        confidence: predictions.confidence,
        uploadDistrict: analysis.uploadDistrict,
        uploadLatitude: analysis.uploadLatitude,
        uploadLongitude: analysis.uploadLongitude,
        nearestClinic,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to analyze image. Please try again.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
