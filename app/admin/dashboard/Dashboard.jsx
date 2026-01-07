"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Dashboard({ stats }) {
  return (
    <div className="space-y-6">
      {/* 🔢 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Chiffre d'affaires" value={`${stats.revenue} €`} />
        <Card title="Commandes" value={stats.orders} />
        <Card title="Utilisateurs" value={stats.users} />
        <Card title="Produits" value={stats.products} />
      </div>

      {/* 📈 Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Ventes par mois</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.salesByMonth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Commandes par mois</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.ordersByMonth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}
