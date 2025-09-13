import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
// Import the new, named authOptions export
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  // Use the imported authOptions to get the session
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { title, content } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newNotebook = await prisma.notebook.create({
      data: {
        title: title,
        content: content,
        authorId: user.id,
      },
    });

    return NextResponse.json(newNotebook);
  } catch (error) {
    console.error("Failed to save notebook:", error);
    return NextResponse.json({ error: "Failed to save notebook" }, { status: 500 });
  }
}