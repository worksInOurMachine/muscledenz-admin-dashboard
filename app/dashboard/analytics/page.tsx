"use client"

import { useState } from "react"
import useSWR from "swr"
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { analyticsApi } from "@/lib/api/analytics"

export default function AnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState<"7d" | "30d" | "90d">("30d")

  const {
    data: metrics,
    error: metricsError,
    isLoading: metricsLoading,
  } = useSWR("analytics-metrics", analyticsApi.getMetrics)
  const {
    data: revenueData,
    error: revenueError,
    isLoading: revenueLoading,
  } = useSWR(`revenue-data-${timePeriod}`, () => analyticsApi.getRevenueData(timePeriod))
  const {
    data: userGrowthData,
    error: userGrowthError,
    isLoading: userGrowthLoading,
  } = useSWR(`user-growth-${timePeriod}`, () => analyticsApi.getUserGrowthData(timePeriod))
  const {
    data: productPerformanceData,
    error: productError,
    isLoading: productLoading,
  } = useSWR("product-performance", analyticsApi.getProductPerformanceData)
  const {
    data: orderStatusData,
    error: orderStatusError,
    isLoading: orderStatusLoading,
  } = useSWR("order-status", analyticsApi.getOrderStatusData)

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`
  const formatNumber = (value: number) => value.toLocaleString()

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-400" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-400" />
    )
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-400" : "text-red-400"
  }

  // Chart colors
  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"]

  if (metricsError || revenueError || userGrowthError || productError || orderStatusError) {
    return <div className="text-red-400">Failed to load analytics data</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-2">Track your gym's performance and growth</p>
        </div>
        <Select value={timePeriod} onValueChange={(value: "7d" | "30d" | "90d") => setTimePeriod(value)}>
          <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-neon-green" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="h-8 w-24 bg-gray-700 rounded animate-pulse" />
            ) : (
              <>
                <div className="text-2xl font-bold text-white">{formatCurrency(metrics?.totalRevenue || 0)}</div>
                <div className={`flex items-center text-xs ${getGrowthColor(metrics?.revenueGrowth || 0)}`}>
                  {getGrowthIcon(metrics?.revenueGrowth || 0)}
                  <span className="ml-1">+{metrics?.revenueGrowth}% from last month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="h-8 w-16 bg-gray-700 rounded animate-pulse" />
            ) : (
              <>
                <div className="text-2xl font-bold text-white">{formatNumber(metrics?.totalOrders || 0)}</div>
                <div className={`flex items-center text-xs ${getGrowthColor(metrics?.ordersGrowth || 0)}`}>
                  {getGrowthIcon(metrics?.ordersGrowth || 0)}
                  <span className="ml-1">+{metrics?.ordersGrowth}% from last month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="h-8 w-20 bg-gray-700 rounded animate-pulse" />
            ) : (
              <>
                <div className="text-2xl font-bold text-white">{formatNumber(metrics?.totalUsers || 0)}</div>
                <div className={`flex items-center text-xs ${getGrowthColor(metrics?.usersGrowth || 0)}`}>
                  {getGrowthIcon(metrics?.usersGrowth || 0)}
                  <span className="ml-1">+{metrics?.usersGrowth}% from last month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Avg Order Value</CardTitle>
            <Package className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="h-8 w-20 bg-gray-700 rounded animate-pulse" />
            ) : (
              <>
                <div className="text-2xl font-bold text-white">{formatCurrency(metrics?.averageOrderValue || 0)}</div>
                <div className="text-xs text-gray-400">Per order average</div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="h-64 bg-gray-700 rounded animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#ffffff",
                    }}
                    formatter={(value: number) => [`$${value}`, "Revenue"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {userGrowthLoading ? (
              <div className="h-64 bg-gray-700 rounded animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#ffffff",
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Product Performance Chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {productLoading ? (
              <div className="h-64 bg-gray-700 rounded animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productPerformanceData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <YAxis
                    type="category"
                    dataKey="productName"
                    stroke="#9ca3af"
                    fontSize={10}
                    width={120}
                    tickFormatter={(value) => (value.length > 15 ? `${value.substring(0, 15)}...` : value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#ffffff",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Order Status Chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {orderStatusLoading ? (
              <div className="h-64 bg-gray-700 rounded animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ status, percentage }) => `${status} (${percentage}%)`}
                  >
                    {orderStatusData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#ffffff",
                    }}
                    formatter={(value: number, name) => [`${value} orders`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
