import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    // 1. Get the form data from the request
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // 2. Get the file content as a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Define the path and create the user's upload directory
    const userUploadDir = path.join(process.cwd(), 'uploads', user.id);
    await fs.mkdir(userUploadDir, { recursive: true });
    const filePath = path.join(userUploadDir, file.name);

    // 4. Write the file to the disk
    await fs.writeFile(filePath, buffer);
    
    console.log(`File uploaded for user ${user.id}: ${file.name}`);
    return NextResponse.json({ message: "File uploaded successfully", filename: file.name });

  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}