"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard({ stats, chartData }) {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* 🔢 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          title="Chiffre d'affaires"
          value={`${stats.totalRevenue.toLocaleString()} Ar`}
        />
        <Card title="Commandes" value={stats.ordersCount} />
        <Card title="Clients" value={stats.customersCount} />
        <Card title="Commandes aujourd’hui" value={stats.todayOrders} />
      </div>

      {/* 📊 Graphique global */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-4">📊 Vue globale</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
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
