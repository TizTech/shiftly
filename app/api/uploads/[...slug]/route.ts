import { NextResponse } from "next/server";
import { getFileFromBlob, isBlobRuntime } from "@/lib/netlify-persistence";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const key = slug.join("/");

  if (!key) {
    return new NextResponse("Missing upload key", { status: 400 });
  }

  if (!isBlobRuntime()) {
    return new NextResponse("Not used in local mode", { status: 404 });
  }

  const file = await getFileFromBlob(key);
  if (!file) {
    return new NextResponse("File not found", { status: 404 });
  }

  return new NextResponse(Buffer.from(file), {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
