"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { strapi } from "@/lib/strapiSDK/strapi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await strapi.axios.get("/analytics/dashboard")
        setData(res.data)
      } catch (err) {
        console.error("Failed to fetch dashboard data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <p className="text-red-500 text-lg font-medium">
          Failed to load analytics
        </p>
      </div>
    )
  }

  const COLORS = ["#4ade80", "#60a5fa", "#facc15", "#f87171", "#a78bfa"]

  // Monthly revenue data (Orders + Subscriptions)
  const monthlyRevenue = Object.keys({
    ...data.orders.revenueByMonth,
    ...data.subscriptions.revenueByMonth,
  }).map((month) => ({
    month,
    orders: data.orders.revenueByMonth[month] || 0,
    subscriptions: data.subscriptions.revenueByMonth[month] || 0,
  }))

  // Top products data
  const topProducts = Object.entries(data.orders.topProducts || {}).map(
    ([name, count]) => ({ name, count })
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 p-6">
      {/* USERS */}
      <Card className="hover:shadow-lg transition-all duration-200 border-t-4 border-blue-500">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Total: <span className="font-semibold">{data.users.total}</span></p>
          <p className="text-green-600">Active: {data.users.active}</p>
          <p className="text-red-600">Blocked: {data.users.blocked}</p>
          <div className="mt-2 text-xs text-gray-500">
            <p>Today: {data.users.newUsers.today}</p>
            <p>Last 7d: {data.users.newUsers.last7Days}</p>
            <p>Last 30d: {data.users.newUsers.last30Days}</p>
          </div>
        </CardContent>
      </Card>

      {/* PRODUCTS */}
      <Card className="hover:shadow-lg transition-all duration-200 border-t-4 border-green-500">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm">Total: <span className="font-semibold">{data.products.total}</span></p>
          <p className="mb-4 text-sm">Stock: {data.products.stock}</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={Object.entries(data.products.byCategory).map(([name, value]) => ({ name, value }))}
                dataKey="value"
                nameKey="name"
                outerRadius={65}
                label
              >
                {COLORS.map((color, idx) => (
                  <Cell key={idx} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ORDERS */}
      <Card className="hover:shadow-lg transition-all duration-200 border-t-4 border-yellow-500">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Total: {data.orders.total}</p>
          <p>Revenue: <span className="font-semibold text-green-600">₹{data.orders.revenue}</span></p>
          <p>Avg Order: ₹{Math.round(data.orders.avgOrderValue)}</p>
        </CardContent>
      </Card>

      {/* SUBSCRIPTIONS */}
      <Card className="hover:shadow-lg transition-all duration-200 border-t-4 border-purple-500">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Total: {data.subscriptions.total}</p>
          <p className="text-green-600">Active: {data.subscriptions.active}</p>
          <p className="text-red-600">Expired: {data.subscriptions.expired}</p>
          <p>Revenue: <span className="font-semibold text-green-600">₹{data.subscriptions.revenue}</span></p>
        </CardContent>
      </Card>

      {/* COMBINED REVENUE */}
      <Card className="hover:shadow-lg transition-all duration-200 border-t-4 border-indigo-500 col-span-1 md:col-span-2 xl:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-700">
            ₹{data.totals.combinedRevenue}
          </p>
        </CardContent>
      </Card>

      {/* CHARTS SECTION */}
      <div className="col-span-1 md:col-span-2 xl:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Revenue Trends */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyRevenue}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#60a5fa" strokeWidth={2} />
                <Line type="monotone" dataKey="subscriptions" stroke="#4ade80" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topProducts}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#facc15" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">No product sales data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
