import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";
import "./dashboard.css";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Si admin, rediriger vers dashboard admin
  if (session.user.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="dashboard-layout">
      <Sidebar user={session.user} />
      
      <main className="dashboard-content">
        <div className="dashboard-container">
          {children}
        </div>
      </main>
    </div>
  );
}
