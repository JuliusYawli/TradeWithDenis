import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isAllowedAdminEmail } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { hasSupabaseEnv } from "@/lib/supabase-env";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const bucketName = "product-images";
const maxUploadBytes = 2_500_000;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

async function hasValidSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/png") return bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  if (file.type === "image/webp") return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return false;
}

async function requireAdmin() {
  if (!hasSupabaseEnv()) return false;

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  return Boolean(data.user && isAllowedAdminEmail(data.user.email));
}

async function ensurePublicBucket() {
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase.storage.getBucket(bucketName);

  if (!data) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: maxUploadBytes,
      allowedMimeTypes: Array.from(allowedTypes)
    });

    if (error) throw error;
  }

  return supabase;
}

export async function POST(request: Request) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Upload a JPG, PNG, or WebP image." }, { status: 400 });
  }

  if (!(await hasValidSignature(file))) {
    return NextResponse.json({ error: "The file content does not match a supported image format." }, { status: 400 });
  }

  if (file.size > maxUploadBytes) {
    return NextResponse.json({ error: "Image is too large. Try a smaller photo." }, { status: 400 });
  }

  try {
    const supabase = await ensurePublicBucket();
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;

    const { error } = await supabase.storage.from(bucketName).upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false
    });

    if (error) throw error;

    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    console.error("Product image upload failed", error);
    return NextResponse.json(
      { error: "Image upload failed. Please try again." },
      { status: 500 }
    );
  }
}
