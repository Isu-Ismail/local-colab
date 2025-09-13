import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  // 1. Secure the endpoint: Only allow admins to access it
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { email, password } = await req.json();

    // 2. Basic validation
    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Invalid input. Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // 3. Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists." }, { status: 409 });
    }

    // 4. Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Create the new user with a default "USER" role
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'USER', // New users are always created with the 'USER' role
      },
    });

    // Don't send the password back in the response
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}