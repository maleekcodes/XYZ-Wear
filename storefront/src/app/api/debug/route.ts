import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    virtualTryOnApiKey: process.env.VIRTUAL_TRYON_API_KEY || "NOT_SET",
  })
}
