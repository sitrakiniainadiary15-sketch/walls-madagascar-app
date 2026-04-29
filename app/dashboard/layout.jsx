import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import "./dashboard.css";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/login");

  if (session.user.role === "admin") redirect("/admin");

  return (
    <main className="db-layout">
      {children}
    </main>
  );
}
