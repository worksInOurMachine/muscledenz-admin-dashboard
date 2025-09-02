"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Package, ShoppingCart, TrendingUp, Activity, Dumbbell, Calendar, Target } from "lucide-react"

export default function DashboardPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role

  const stats = [
    {
      title: "Total Members",
      value: "2,847",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Products",
      value: "156",
      change: "+3%",
      icon: Package,
      color: "text-green-600",
    },
    {
      title: "Orders Today",
      value: "23",
      change: "+8%",
      icon: ShoppingCart,
      color: "text-orange-600",
    },
    {
      title: "Revenue",
      value: "$12,847",
      change: "+15%",
      icon: TrendingUp,
      color: "text-primary",
    },
  ]

  const recentActivities = [
    { action: "New member registration", user: "John Doe", time: "2 minutes ago" },
    { action: "Product order placed", user: "Jane Smith", time: "5 minutes ago" },
    { action: "Membership renewed", user: "Mike Johnson", time: "10 minutes ago" },
    { action: "Equipment maintenance", user: "System", time: "1 hour ago" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name}! Here's what's happening at your gym today.
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {userRole === "admin" ? "Administrator" : "Staff Member"}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <a href="/dashboard/products">
                <Package className="mr-2 h-4 w-4" />
                Add New Product
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <a href="/dashboard/users">
                <Users className="mr-2 h-4 w-4" />
                Manage Members
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <a href="/dashboard/orders">
                <ShoppingCart className="mr-2 h-4 w-4" />
                View Orders
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gym Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Gym Status
            </CardTitle>
            <CardDescription>Current facility information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Current Capacity</span>
              <Badge variant="secondary">78/120</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Equipment Status</span>
              <Badge className="bg-green-100 text-green-800">All Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Staff on Duty</span>
              <Badge variant="outline">5 Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Next Maintenance</span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Tomorrow
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
