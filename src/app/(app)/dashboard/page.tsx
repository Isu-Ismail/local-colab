import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DashboardClient from "./DashboardClient"; // Import the interactive component

export default async function DashboardPage() {
  // 1. Get the session on the server
  const session = await getServerSession(authOptions);

  // 2. If no session exists, redirect to the login page
  if (!session) {
    redirect("/"); // Or '/login' if you have a separate login route
  }

  // 3. If the user is logged in, render the main dashboard client component
  return <DashboardClient />;
}