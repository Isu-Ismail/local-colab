import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Function to UPDATE a user's role
export async function PATCH(req: NextRequest, context: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get the userId from the context object
    const { userId } = context.params;
    const { role } = await req.json();

    if (!['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: "Invalid role specified." }, { status: 400 });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}

// Function to DELETE a user
export async function DELETE(req: NextRequest, context: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminUser = await prisma.user.findUnique({ where: { email: session.user.email! } });
  
  // Get the userId from the context object
  const { userId } = context.params;
  
  // Critical safety check: Prevent an admin from deleting their own account
  if (adminUser?.id === userId) {
    return NextResponse.json({ error: "Admins cannot delete their own account." }, { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}