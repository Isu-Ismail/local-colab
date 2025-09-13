import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import AdminDashboardClient from "./AdminDashboardClient"; // Import the client component

const prisma = new PrismaClient();

export default async function AdminPage() {
  // 1. Securely check the session on the server
  const session = await getServerSession(authOptions);

  // 2. Redirect if the user is not an admin
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // 3. Fetch data on the server
  const allUsers = await prisma.user.findMany();

  // 4. Render the client component and pass the data to it
  return <AdminDashboardClient users={allUsers} />;
}