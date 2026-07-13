import { NextResponse } from "next/server";

// Serves admin-uploaded product images stored in Netlify Blobs
// (the deployed filesystem is read-only, so uploads can't land in /public).
export async function GET(req, { params }) {
  const article = String(params.article || "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!article) return new NextResponse("not found", { status: 404 });
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore({ name: "images", consistency: "strong" });
    const res = await store.getWithMetadata(article, { type: "arrayBuffer" });
    if (!res || !res.data) return new NextResponse("not found", { status: 404 });
    return new NextResponse(res.data, {
      headers: {
        "Content-Type": res.metadata?.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
}
