import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const id = req.url.split("/").pop();
  return NextResponse.json({ success: true, id, message: "Orders route active" });
}

