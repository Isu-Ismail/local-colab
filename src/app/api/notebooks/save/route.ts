import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  // 1. Get the user's session to ensure they are authenticated
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { title, content } = await req.json();

    // 2. Find the user in the database based on their secure session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Check for a duplicate notebook title for THIS user
    const existingNotebook = await prisma.notebook.findFirst({
      where: {
        title: title,
        authorId: user.id,
      },
    });

    if (existingNotebook) {
      return NextResponse.json(
        { error: `A notebook with the title "${title}" already exists.` },
        { status: 409 } // 409 Conflict is the correct status code
      );
    }

    // 4. If no duplicate is found, create the new notebook
    const newNotebook = await prisma.notebook.create({
      data: {
        title: title,
        content: content,
        authorId: user.id,
      },
    });

    return NextResponse.json(newNotebook, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("Failed to save notebook:", error);
    return NextResponse.json({ error: "Failed to save notebook" }, { status: 500 });
  }
}