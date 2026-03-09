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

const HF_FALLBACK_PREDICT_URL =
  "https://nickmuhigi-livestock-disease-detector.hf.space/predict";

function buildModelApiUrls(): string[] {
  const configured = (process.env.MODEL_API_URLS || process.env.MODEL_API_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  if (configured.length > 0) {
    // Keep user-configured endpoints first, then add a known-good hosted fallback.
    return Array.from(new Set([...configured, HF_FALLBACK_PREDICT_URL]));
  }

  return [
    "http://127.0.0.1:7860/predict",
    "http://127.0.0.1:8010/predict",
    HF_FALLBACK_PREDICT_URL,
  ];
}

const MODEL_API_URLS = buildModelApiUrls();

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
        prediction?: string;
        confidence?: number;
        probabilities?: Record<string, number>;
      };

      if (result.success && result.predictions) {
        return result.predictions;
      }

      // Support direct HF Space response shape: { success, prediction, confidence, probabilities }
      if (result.success && result.probabilities && result.prediction) {
        const classScores = result.probabilities;
        return {
          healthy: classScores.HEALTHY ?? 0,
          footAndMouth: classScores.FOOT_AND_MOUTH ?? 0,
          lumpySkin: classScores.LUMPY_SKIN ?? 0,
          anthrax: classScores.ANTHRAX ?? classScores.MASTITIS ?? 0,
          classLabels: Object.keys(classScores),
          classScores,
          detectedDisease: result.prediction,
          confidence: Number(result.confidence ?? 0),
        };
      }

      apiErrors.push(`${apiUrl} -> invalid response payload`);
      continue;
    } catch (error) {
      apiErrors.push(
        `${apiUrl} -> ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  if (isProductionRuntime) {
    const apiMessage = apiErrors.length > 0 ? apiErrors.join(" | ") : "No API endpoints configured";
    const endpointHint =
      MODEL_API_URLS.length > 0
        ? MODEL_API_URLS.join(", ")
        : "https://<your-backend>.onrender.com/predict";
    throw new Error(
      `Failed to analyze image: model API unavailable (${apiMessage}). Check MODEL_API_URL(S). Current endpoints: ${endpointHint}`
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

// Rwanda's districts and their approximate center coordinates
const RWANDA_DISTRICTS = [
  { name: "Bugesera", lat: -2.024, lon: 30.604 },
  { name: "Gatsibo", lat: -1.943, lon: 30.755 },
  { name: "Kayonza", lat: -2.109, lon: 30.949 },
  { name: "Kirehe", lat: -2.282, lon: 31.197 },
  { name: "Ngoma", lat: -2.442, lon: 30.673 },
  { name: "Kigali City", lat: -1.950, lon: 30.060 },
  { name: "Muhanga", lat: -2.024, lon: 30.604 },
  { name: "Nyarugenge", lat: -1.960, lon: 30.045 },
  { name: "Kamonyi", lat: -1.898, lon: 29.998 },
  { name: "Kicukiro", lat: -1.946, lon: 30.062 },
  { name: "Gasabo", lat: -1.940, lon: 30.138 },
  { name: "Rulindo", lat: -1.449, lon: 29.569 },
  { name: "Musanze", lat: -1.477, lon: 29.649 },
  { name: "Gicumbi", lat: -1.631, lon: 29.953 },
  { name: "Gakenke", lat: -1.782, lon: 30.039 },
  { name: "Burera", lat: -1.551, lon: 29.793 },
  { name: "Nyabihu", lat: -1.831, lon: 29.461 },
  { name: "Rubavu", lat: -1.485, lon: 29.268 },
  { name: "Rusizi", lat: -2.496, lon: 29.015 },
  { name: "Rustenyi", lat: -1.621, lon: 29.282 },
  { name: "Karongi", lat: -2.061, lon: 29.255 },
  { name: "Rutsiro", lat: -2.229, lon: 29.387 },
  { name: "Huye", lat: -2.605, lon: 29.746 },
  { name: "Nyanza", lat: -2.508, lon: 29.819 },
  { name: "Nyamagabe", lat: -2.703, lon: 29.674 },
  { name: "Nyaruguru", lat: -2.929, lon: 29.236 },
];

function findNearestRwandaDistrict(latitude: number, longitude: number): string | null {
  if (RWANDA_DISTRICTS.length === 0) return null;
  
  let nearest = RWANDA_DISTRICTS[0];
  let minDistance = haversineKm(latitude, longitude, nearest.lat, nearest.lon);
  
  for (const district of RWANDA_DISTRICTS.slice(1)) {
    const distance = haversineKm(latitude, longitude, district.lat, district.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = district;
    }
  }
  
  // Only use if within ~80 km (reasonable Rwanda extent with buffer)
  return minDistance < 80 ? nearest.name : null;
}

const RWANDA_DISTRICT_NAMES = new Set(
  RWANDA_DISTRICTS.map((d) => d.name.toUpperCase())
);

function isCoordinateLabel(value?: string | null): boolean {
  if (!value) return false;
  return /^\s*near\s+-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\s*$/i.test(value.trim());
}

function normalizeRwandaDistrictName(raw?: string | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || isCoordinateLabel(value)) return null;

  const upper = value.toUpperCase();
  for (const districtName of RWANDA_DISTRICT_NAMES) {
    if (upper.includes(districtName)) {
      const matched = RWANDA_DISTRICTS.find((d) => d.name.toUpperCase() === districtName);
      return matched?.name ?? null;
    }
  }

  // Handle common Kinyarwanda pattern: "Akarere ka Gasabo"
  const kinyarwandaMatch = value.match(/akarere\s+ka\s+([a-z\-]+)/i);
  if (kinyarwandaMatch?.[1]) {
    const candidate = kinyarwandaMatch[1].trim().toUpperCase();
    const matched = RWANDA_DISTRICTS.find((d) => d.name.toUpperCase() === candidate);
    if (matched) return matched.name;
  }

  return null;
}

function pickDistrict(address?: Record<string, string | undefined>): string | null {
  if (!address) return null;
  // For Rwanda: prioritize state (province), then city_district, then county, etc.
  // Rwanda's top-level administrative divisions are provinces/states
  const candidate =
    address.state ||
    address.city_district ||
    address.state_district ||
    address.county ||
    address.municipality ||
    address.city ||
    address.town ||
    address.administrative;

  return normalizeRwandaDistrictName(candidate);
}

function formatAddressFromParts(address?: Record<string, string | undefined>): string {
  if (!address) return "Address not available";

  // For Rwanda, prioritize: road + city (clean format like "KN 5 Rd, Kigali")
  const parts = [
    address.road,
    address.city || address.town || address.municipality,
  ]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  if (parts.length === 0) {
    return "Address not available";
  }

  return parts.join(", ");
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function buildCoordinateLabel(latitude: number, longitude: number): string {
  return `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

async function resolveDistrictFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const reverseUrl =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
    const response = await fetchWithTimeout(reverseUrl, {
      headers: {
        "User-Agent": "HerdAI/1.0 (district-resolution)",
      },
      cache: "no-store",
    }, 10000);

    if (!response.ok) {
      console.log(`✗ Nominatim returned HTTP ${response.status}, falling back to geographic lookup`);
      return findNearestRwandaDistrict(latitude, longitude);
    }

    const payload = (await response.json()) as {
      address?: Record<string, string | undefined>;
    };
    
    const district = pickDistrict(payload.address);
    if (district) {
      console.log(`✓ Resolved district from Nominatim: ${district} (address keys: ${Object.keys(payload.address || {}).join(", ")})`);
      return district;
    }

    const clinicLikeDistrict =
      normalizeRwandaDistrictName(payload.address?.county) ||
      normalizeRwandaDistrictName(payload.address?.city_district) ||
      normalizeRwandaDistrictName(payload.address?.state_district);
    if (clinicLikeDistrict) {
      return clinicLikeDistrict;
    }
    
    // Nominatim didn't have a district field, try geographic fallback
    console.log(`✗ Nominatim had no district field, falling back to geographic lookup`);
    return findNearestRwandaDistrict(latitude, longitude);
  } catch (error) {
    console.error(`✗ Failed to resolve district from Nominatim (${error}), using geographic lookup`, error);
    return findNearestRwandaDistrict(latitude, longitude);
  }
}

async function resolveAddressFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const reverseUrl =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const response = await fetchWithTimeout(reverseUrl, {
      headers: {
        "User-Agent": "HerdAI/1.0 (address-resolution)",
      },
      cache: "no-store",
    }, 15000);

    if (!response.ok) {
      console.log(`✗ Address resolution HTTP ${response.status}`);
      return "Address not available";
    }

    const payload = (await response.json()) as {
      display_name?: string;
      address?: Record<string, string | undefined>;
    };

    // Try structured address first (road + city format)
    const fromParts = formatAddressFromParts(payload.address);
    if (fromParts !== "Address not available") {
      console.log(`✓ Resolved clinic address: ${fromParts}`);
      return fromParts;
    }

    // Fallback to display_name, but clean it up
    const displayName = payload.display_name?.trim();
    if (displayName && displayName.length > 0) {
      // Take first 2-3 parts of display_name (usually road, area, city)
      const parts = displayName.split(",").map((p) => p.trim()).slice(0, 3);
      const cleaned = parts.join(", ");
      console.log(`✓ Using display_name for clinic: ${cleaned}`);
      return cleaned;
    }

    console.log(`✗ No usable address found from Nominatim`);
    return "Address not available";
  } catch (error) {
    console.error(`✗ Failed to resolve address:`, error);
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
    // Expanded bbox from point (±0.15 degrees ≈ 15-17km) for better coverage
    const latMin = options.latitude - 0.15;
    const latMax = options.latitude + 0.15;
    const lonMin = options.longitude - 0.15;
    const lonMax = options.longitude + 0.15;

    // Overpass API query for veterinary clinics
    const query = `[out:json][timeout:20];
(
  node["amenity"="veterinary"](${latMin},${lonMin},${latMax},${lonMax});
  way["amenity"="veterinary"](${latMin},${lonMin},${latMax},${lonMax});
);
out body geom;`;

    console.log(`🔍 Searching for veterinary clinics near (${options.latitude}, ${options.longitude})`);

    const response = await fetchWithTimeout("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: {
        "Content-Type": "application/osm3s",
      },
    }, 12000);

    if (!response.ok) {
      console.log(`✗ Overpass API returned HTTP ${response.status}`);
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
      console.log(`✗ No veterinary clinics found within ~15km radius`);
      return null;
    }

    console.log(`✓ Found ${data.elements.length} veterinary clinic(s) nearby`);

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
    
    // Try to get a good address in order of preference
    let clinicAddress = nearest.address.trim();
    
    // If no address from OSM tags, try reverse geocoding
    if (!clinicAddress) {
      clinicAddress = await resolveAddressFromCoordinates(nearest.lat, nearest.lon);
    }
    
    // If still no good address, build district-based fallback
    if (!clinicAddress || clinicAddress === "Address not available") {
      const nearbyDistrict = findNearestRwandaDistrict(nearest.lat, nearest.lon);
      if (nearbyDistrict) {
        clinicAddress = `${nearbyDistrict} District`;
      } else {
        clinicAddress = buildCoordinateLabel(nearest.lat, nearest.lon);
      }
    }

    return {
      name: nearest.name,
      address: clinicAddress,
      phone: nearest.phone,
      distanceKm: Number(
        haversineKm(options.latitude, options.longitude, nearest.lat, nearest.lon).toFixed(1)
      ),
    };
  } catch (error) {
    console.error(`✗ Failed to find veterinary clinic:`, error);
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

    const effectiveLatitude = latitude ?? currentUser?.latitude ?? null;
    const effectiveLongitude = longitude ?? currentUser?.longitude ?? null;
    const persistedDistrict = normalizeRwandaDistrictName(currentUser?.district);
    const inferredDistrictFromCoordinates =
      effectiveLatitude !== null && effectiveLongitude !== null
        ? findNearestRwandaDistrict(effectiveLatitude, effectiveLongitude)
        : null;
    const coordinateDistrict =
      effectiveLatitude !== null && effectiveLongitude !== null
        ? buildCoordinateLabel(effectiveLatitude, effectiveLongitude)
        : null;
    const effectiveDistrict =
      normalizeRwandaDistrictName(resolvedDistrict) ||
      persistedDistrict ||
      inferredDistrictFromCoordinates ||
      coordinateDistrict;

    if (resolvedDistrict || latitude !== null || longitude !== null) {
      await prisma.user.update({
        where: { id: payload.userId },
        data: {
          district:
            normalizeRwandaDistrictName(resolvedDistrict) ||
            persistedDistrict ||
            inferredDistrictFromCoordinates ||
            undefined,
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
