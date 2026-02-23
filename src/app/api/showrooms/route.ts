import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    const showrooms = await prisma.showroom.findMany({
      where: { isActive: true },
    });

    return NextResponse.json({ data: showrooms }, { status: 200 });
  } catch (error) {
    console.error("List showrooms error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
