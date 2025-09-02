export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
  total: number
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  customerAvatar?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentMethod: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  orderDate: string
  updatedDate: string
  trackingNumber?: string
  notes?: string
}

// Mock orders data
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customerId: "3",
    customerName: "Mike Johnson",
    customerEmail: "mike.johnson@email.com",
    customerAvatar: "/member-avatar.png",
    items: [
      {
        id: "1",
        productId: "1",
        productName: "Premium Whey Protein",
        productImage: "/protein-powder-assortment.png",
        quantity: 2,
        price: 49.99,
        total: 99.98,
      },
      {
        id: "2",
        productId: "4",
        productName: "Pre-Workout Energy Boost",
        productImage: "/pre-workout-supplement.png",
        quantity: 1,
        price: 34.99,
        total: 34.99,
      },
    ],
    subtotal: 134.97,
    tax: 10.8,
    shipping: 9.99,
    total: 155.76,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    shippingAddress: {
      street: "123 Fitness St",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA",
    },
    orderDate: "2024-01-15",
    updatedDate: "2024-01-20",
    trackingNumber: "TRK123456789",
    notes: "Customer requested expedited shipping",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customerId: "4",
    customerName: "Emily Davis",
    customerEmail: "emily.davis@email.com",
    customerAvatar: "/female-member-avatar.png",
    items: [
      {
        id: "3",
        productId: "2",
        productName: "Resistance Band Set",
        productImage: "/resistance-bands-exercise.png",
        quantity: 1,
        price: 24.99,
        total: 24.99,
      },
      {
        id: "4",
        productId: "3",
        productName: "Smart Water Bottle",
        productImage: "/reusable-water-bottle.png",
        quantity: 2,
        price: 19.99,
        total: 39.98,
      },
    ],
    subtotal: 64.97,
    tax: 5.2,
    shipping: 7.99,
    total: 78.16,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "PayPal",
    shippingAddress: {
      street: "456 Wellness Ave",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "USA",
    },
    orderDate: "2024-01-18",
    updatedDate: "2024-01-19",
    trackingNumber: "TRK987654321",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customerId: "5",
    customerName: "David Wilson",
    customerEmail: "david.wilson@email.com",
    customerAvatar: "/male-member-avatar.png",
    items: [
      {
        id: "5",
        productId: "1",
        productName: "Premium Whey Protein",
        productImage: "/protein-powder-assortment.png",
        quantity: 1,
        price: 49.99,
        total: 49.99,
      },
    ],
    subtotal: 49.99,
    tax: 4.0,
    shipping: 5.99,
    total: 59.98,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    shippingAddress: {
      street: "789 Health Blvd",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    orderDate: "2024-01-19",
    updatedDate: "2024-01-19",
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    customerId: "3",
    customerName: "Mike Johnson",
    customerEmail: "mike.johnson@email.com",
    customerAvatar: "/member-avatar.png",
    items: [
      {
        id: "6",
        productId: "2",
        productName: "Resistance Band Set",
        productImage: "/resistance-bands-exercise.png",
        quantity: 3,
        price: 24.99,
        total: 74.97,
      },
    ],
    subtotal: 74.97,
    tax: 6.0,
    shipping: 8.99,
    total: 89.96,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "Credit Card",
    shippingAddress: {
      street: "123 Fitness St",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA",
    },
    orderDate: "2024-01-20",
    updatedDate: "2024-01-20",
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const ordersApi = {
  async getOrders(): Promise<Order[]> {
    await delay(500)
    return mockOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
  },

  async getOrderById(id: string): Promise<Order | null> {
    await delay(300)
    return mockOrders.find((order) => order.id === id) || null
  },

  async createOrder(orderData: Omit<Order, "id" | "orderNumber" | "orderDate" | "updatedDate">): Promise<Order> {
    await delay(800)
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(mockOrders.length + 1).padStart(3, "0")}`
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      orderNumber,
      orderDate: new Date().toISOString().split("T")[0],
      updatedDate: new Date().toISOString().split("T")[0],
    }
    mockOrders.push(newOrder)
    return newOrder
  },

  async updateOrder(id: string, orderData: Partial<Order>): Promise<Order> {
    await delay(800)
    const index = mockOrders.findIndex((order) => order.id === id)
    if (index === -1) throw new Error("Order not found")

    mockOrders[index] = {
      ...mockOrders[index],
      ...orderData,
      updatedDate: new Date().toISOString().split("T")[0],
    }
    return mockOrders[index]
  },

  async updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
    await delay(300)
    const index = mockOrders.findIndex((order) => order.id === id)
    if (index === -1) throw new Error("Order not found")

    mockOrders[index].status = status
    mockOrders[index].updatedDate = new Date().toISOString().split("T")[0]

    // Auto-update tracking number for shipped orders
    if (status === "shipped" && !mockOrders[index].trackingNumber) {
      mockOrders[index].trackingNumber = `TRK${Date.now()}`
    }

    return mockOrders[index]
  },

  async deleteOrder(id: string): Promise<void> {
    await delay(500)
    const index = mockOrders.findIndex((order) => order.id === id)
    if (index === -1) throw new Error("Order not found")
    mockOrders.splice(index, 1)
  },
}
