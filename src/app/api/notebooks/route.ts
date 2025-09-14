import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const notebooks = await prisma.notebook.findMany({
      where: { author: { email: session.user.email } },
      select: { id: true, title: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(notebooks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notebooks" }, { status: 500 });
  }
}