import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import authOptions from "@/app/api/auth/[...nextauth]/options";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  if (session.user.role !== "admin") {
    redirect("/admin/unauthorized");
  }

  return (
    <div>
      <h1>Dashboard Admin</h1>

      <ul>
        <li>
          <a href="/admin/products">Gestion Produits</a>
        </li>
      </ul>
    </div>
  );
}
