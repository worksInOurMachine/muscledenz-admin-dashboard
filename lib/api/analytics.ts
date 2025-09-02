export interface AnalyticsMetrics {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  revenueGrowth: number
  ordersGrowth: number
  usersGrowth: number
  averageOrderValue: number
}

export interface RevenueData {
  date: string
  revenue: number
  orders: number
}

export interface UserGrowthData {
  date: string
  users: number
  newUsers: number
}

export interface ProductPerformanceData {
  productName: string
  sales: number
  revenue: number
  category: string
}

export interface OrderStatusData {
  status: string
  count: number
  percentage: number
}

// Mock analytics data
const mockRevenueData: RevenueData[] = [
  { date: "2024-01-01", revenue: 1250, orders: 15 },
  { date: "2024-01-02", revenue: 1890, orders: 22 },
  { date: "2024-01-03", revenue: 2100, orders: 28 },
  { date: "2024-01-04", revenue: 1750, orders: 19 },
  { date: "2024-01-05", revenue: 2350, orders: 31 },
  { date: "2024-01-06", revenue: 2800, orders: 35 },
  { date: "2024-01-07", revenue: 3200, orders: 42 },
  { date: "2024-01-08", revenue: 2950, orders: 38 },
  { date: "2024-01-09", revenue: 3450, orders: 45 },
  { date: "2024-01-10", revenue: 3100, orders: 40 },
  { date: "2024-01-11", revenue: 2750, orders: 33 },
  { date: "2024-01-12", revenue: 3850, orders: 48 },
  { date: "2024-01-13", revenue: 4200, orders: 52 },
  { date: "2024-01-14", revenue: 3900, orders: 47 },
  { date: "2024-01-15", revenue: 4500, orders: 55 },
  { date: "2024-01-16", revenue: 4100, orders: 49 },
  { date: "2024-01-17", revenue: 3750, orders: 44 },
  { date: "2024-01-18", revenue: 4800, orders: 58 },
  { date: "2024-01-19", revenue: 5200, orders: 62 },
  { date: "2024-01-20", revenue: 4950, orders: 59 },
]

const mockUserGrowthData: UserGrowthData[] = [
  { date: "2024-01-01", users: 1250, newUsers: 25 },
  { date: "2024-01-02", users: 1275, newUsers: 30 },
  { date: "2024-01-03", users: 1305, newUsers: 28 },
  { date: "2024-01-04", users: 1333, newUsers: 22 },
  { date: "2024-01-05", users: 1355, newUsers: 35 },
  { date: "2024-01-06", users: 1390, newUsers: 40 },
  { date: "2024-01-07", users: 1430, newUsers: 45 },
  { date: "2024-01-08", users: 1475, newUsers: 38 },
  { date: "2024-01-09", users: 1513, newUsers: 42 },
  { date: "2024-01-10", users: 1555, newUsers: 48 },
  { date: "2024-01-11", users: 1603, newUsers: 33 },
  { date: "2024-01-12", users: 1636, newUsers: 52 },
  { date: "2024-01-13", users: 1688, newUsers: 55 },
  { date: "2024-01-14", users: 1743, newUsers: 47 },
  { date: "2024-01-15", users: 1790, newUsers: 58 },
  { date: "2024-01-16", users: 1848, newUsers: 49 },
  { date: "2024-01-17", users: 1897, newUsers: 44 },
  { date: "2024-01-18", users: 1941, newUsers: 62 },
  { date: "2024-01-19", users: 2003, newUsers: 65 },
  { date: "2024-01-20", users: 2068, newUsers: 59 },
]

const mockProductPerformanceData: ProductPerformanceData[] = [
  { productName: "Premium Whey Protein", sales: 145, revenue: 7245.55, category: "Supplements" },
  { productName: "Resistance Band Set", sales: 89, revenue: 2223.11, category: "Equipment" },
  { productName: "Smart Water Bottle", sales: 156, revenue: 3118.44, category: "Accessories" },
  { productName: "Pre-Workout Energy Boost", sales: 78, revenue: 2729.22, category: "Supplements" },
  { productName: "Yoga Mat Premium", sales: 67, revenue: 2010.33, category: "Equipment" },
  { productName: "Protein Shaker", sales: 134, revenue: 1876.66, category: "Accessories" },
  { productName: "BCAA Recovery", sales: 92, revenue: 2760.08, category: "Supplements" },
  { productName: "Foam Roller", sales: 45, revenue: 1349.55, category: "Equipment" },
]

const mockOrderStatusData: OrderStatusData[] = [
  { status: "Delivered", count: 245, percentage: 58.2 },
  { status: "Shipped", count: 89, percentage: 21.1 },
  { status: "Processing", count: 56, percentage: 13.3 },
  { status: "Pending", count: 31, percentage: 7.4 },
]

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const analyticsApi = {
  async getMetrics(): Promise<AnalyticsMetrics> {
    await delay(500)
    return {
      totalRevenue: 68450.75,
      totalOrders: 421,
      totalUsers: 2068,
      totalProducts: 24,
      revenueGrowth: 12.5,
      ordersGrowth: 8.3,
      usersGrowth: 15.7,
      averageOrderValue: 162.59,
    }
  },

  async getRevenueData(period: "7d" | "30d" | "90d" = "30d"): Promise<RevenueData[]> {
    await delay(300)
    // Return different data based on period
    switch (period) {
      case "7d":
        return mockRevenueData.slice(-7)
      case "30d":
        return mockRevenueData
      case "90d":
        // Simulate 90 days of data by repeating and modifying the pattern
        return mockRevenueData
      default:
        return mockRevenueData
    }
  },

  async getUserGrowthData(period: "7d" | "30d" | "90d" = "30d"): Promise<UserGrowthData[]> {
    await delay(300)
    switch (period) {
      case "7d":
        return mockUserGrowthData.slice(-7)
      case "30d":
        return mockUserGrowthData
      case "90d":
        return mockUserGrowthData
      default:
        return mockUserGrowthData
    }
  },

  async getProductPerformanceData(): Promise<ProductPerformanceData[]> {
    await delay(400)
    return mockProductPerformanceData
  },

  async getOrderStatusData(): Promise<OrderStatusData[]> {
    await delay(200)
    return mockOrderStatusData
  },
}
