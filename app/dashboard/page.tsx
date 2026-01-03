import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  console.log("SESSION 👉", session);

  if (!session) redirect("/login");

  if (session.user.role === "admin") {
    return <h1>Dashboard ADMIN ✅</h1>;
  }

  return <h1>Dashboard USER</h1>;
}
