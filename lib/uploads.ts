import { FileType } from "@prisma/client";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { isNetlifyRuntime, storeFileInNetlifyBlob } from "@/lib/netlify-persistence";

const folderMap: Record<FileType, string> = {
  CV: "cv",
  LOGO: "logo",
  COVER_LETTER: "cover",
  PROFILE_PHOTO: "profile",
};

export async function storeUpload(file: File, ownerId: string, type: FileType) {
  if (!file || file.size === 0) return null;

  const ext = path.extname(file.name) || "";
  const storedName = `${Date.now()}-${randomUUID()}${ext}`;
  const folder = folderMap[type];
  const relativePath = `/uploads/${folder}/${storedName}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  const arrayBuffer = await file.arrayBuffer();

  if (isNetlifyRuntime()) {
    await storeFileInNetlifyBlob(`${folder}/${storedName}`, arrayBuffer);
  } else {
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, storedName);
    const bytes = Buffer.from(arrayBuffer);
    await writeFile(filePath, bytes);
  }

  return db.uploadedFile.create({
    data: {
      ownerId,
      type,
      originalName: file.name,
      storedName,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      path: isNetlifyRuntime() ? `/api/uploads/${folder}/${storedName}` : relativePath,
    },
  });
}
