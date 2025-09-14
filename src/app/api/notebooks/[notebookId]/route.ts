import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET handler to fetch a single notebook (FIXED)
export async function GET(req: NextRequest, context: { params: { notebookId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { notebookId } = context.params; // Correctly get notebookId from context
    const notebook = await prisma.notebook.findFirst({
      where: {
        id: notebookId,
        author: { email: session.user.email },
      },
    });

    if (!notebook) {
      return NextResponse.json({ error: "Notebook not found" }, { status: 404 });
    }
    return NextResponse.json(notebook);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notebook" }, { status: 500 });
  }
}

// PUT handler to update a notebook (FIXED)
export async function PUT(req: NextRequest, context: { params: { notebookId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { notebookId } = context.params; // Correctly get notebookId from context
    const { title, content } = await req.json();

    const user = await prisma.user.findUnique({ where: { email: session.user.email }});
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // New: Check for duplicate titles when renaming
    const existingNotebook = await prisma.notebook.findFirst({
        where: {
            title: title,
            authorId: user.id,
            id: { not: notebookId } // Exclude the current notebook from the check
        }
    });

    if (existingNotebook) {
        return NextResponse.json({ error: `Another notebook with the title "${title}" already exists.` }, { status: 409 });
    }

    const notebook = await prisma.notebook.updateMany({
      where: {
        id: notebookId,
        authorId: user.id, // Stronger security check
      },
      data: { title, content },
    });

    if (notebook.count === 0) {
      return NextResponse.json({ error: "Notebook not found or you don't have permission to edit it." }, { status: 404 });
    }
    return NextResponse.json({ message: "Notebook updated successfully." });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update notebook" }, { status: 500 });
  }
}