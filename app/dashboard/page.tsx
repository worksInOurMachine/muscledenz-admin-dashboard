"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Users,
  ShoppingBag,
  DollarSign,
  Calendar,
  BarChart as BarChartIcon,
} from "lucide-react"; // Added icons
import { strapi } from "@/lib/strapiSDK/strapi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";
import { useSidebar } from "@/components/ui/sidebar";

// --- Custom Components & Data Structure ---

interface StatCardProps {
  title: string;
  metric: number | string;
  icon: React.ElementType;
  iconColor: string;
  subText?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  metric,
  icon: Icon,
  iconColor,
  subText,
}) => (
  <Card
    className="hover:shadow-xl transition-shadow duration-300 border-l-4"
    style={{ borderColor: iconColor }}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">
        {title}
      </CardTitle>
      <Icon className={`h-4 w-4 ${iconColor}`} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{metric}</div>
      {subText && (
        <p className="text-xs text-muted-foreground mt-1">{subText}</p>
      )}
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-md">
        <p className="text-sm font-semibold">{label}</p>
        {payload.map((item: any) => (
          <p
            key={item.dataKey}
            className="text-sm"
            style={{ color: item.color }}
          >
            {`${item.name}: ${item.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- Main Component ---

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isMobile, setOpen } = useSidebar();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await strapi.axios.get("/analytics/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    if (!isMobile) setOpen(true);
    else setOpen(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <p className="text-red-500 text-lg font-medium">
          Failed to load analytics
        </p>
      </div>
    );
  }

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]; // Emerald, Blue, Yellow, Red, Violet

  // Monthly revenue data (Orders + Subscriptions)
  const monthlyRevenue = Object.keys({
    ...data.orders.revenueByMonth,
    ...data.subscriptions.revenueByMonth,
  })
    .sort((a, b) => {
      // Basic alphabetical sort for months, can be improved for proper time sequence if needed
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    })
    .map((month) => ({
      month,
      Orders: data.orders.revenueByMonth[month] || 0, // Renamed for professional Legend
      Subscriptions: data.subscriptions.revenueByMonth[month] || 0,
    }));

  // Top products data
  const topProducts = Object.entries(data.orders.topProducts || {}).map(
    ([name, count]) => ({ name, count: Number(count) })
  );

  const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Dashboard Overview
      </h1>

      {/* --- 1. Metric Cards (KPIs) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TOTAL REVENUE */}
        <StatCard
          title="Total Revenue"
          metric={formatCurrency(data.totals.combinedRevenue)}
          icon={DollarSign}
          iconColor="text-emerald-500"
          subText={
            <>
              Orders:{" "}
              <span className="font-semibold">
                {formatCurrency(data.orders.revenue)}
              </span>{" "}
              | Subs:{" "}
              <span className="font-semibold">
                {formatCurrency(data.subscriptions.revenue)}
              </span>
            </>
          }
        />

        {/* TOTAL USERS */}
        <StatCard
          title="Total Users"
          metric={data.users.total.toLocaleString()}
          icon={Users}
          iconColor="text-blue-500"
          subText={
            <>
              New last 30d:{" "}
              <span className="font-semibold">
                {data.users.newUsers.last30Days}
              </span>
            </>
          }
        />

        {/* ACTIVE SUBSCRIPTIONS */}
        <StatCard
          title="Active Subscriptions"
          metric={data.subscriptions.active.toLocaleString()}
          icon={Calendar}
          iconColor="text-purple-500"
          subText={
            <>
              Total:{" "}
              <span className="font-semibold">{data.subscriptions.total}</span>{" "}
              | Expired:{" "}
              <span className="font-semibold">
                {data.subscriptions.expired}
              </span>
            </>
          }
        />

        {/* TOTAL ORDERS */}
        <StatCard
          title="Total Orders"
          metric={data.orders.total.toLocaleString()}
          icon={ShoppingBag}
          iconColor="text-yellow-500"
          subText={`Avg Order Value: ₹${Math.round(
            data.orders.avgOrderValue
          ).toLocaleString()}`}
        />
      </div>

      {/* --------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* --- 2. Monthly Revenue Trends Chart --- */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-indigo-500" />
              Monthly Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyRevenue}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: "10px" }}
                />
                <Line
                  type="monotone"
                  dataKey="Orders"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Subscriptions"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* --- 3. Top Products Bar Chart --- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Top Products Sold
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Units Sold"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-base text-gray-500">
                  No product sales data available.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- 4. Product Category Distribution Pie Chart --- */}
      <Card className="col-span-1 xl:col-span-3">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Product Category Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={Object.entries(data.products.byCategory).map(
                  ([name, value]) => ({ name, value: Number(value) })
                )}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                fill="#8884d8"
                labelLine={false}
                label={({ name, percent = 0 }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {Object.keys(data.products.byCategory).map((_, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{ paddingTop: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
