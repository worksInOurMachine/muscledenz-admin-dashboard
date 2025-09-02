export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "staff" | "customer"
  avatar?: string
  phone?: string
  joinDate: string
  lastActive: string
  status: "active" | "inactive" | "suspended"
  membershipType?: string
  totalOrders?: number
}

// Mock users data
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Admin",
    email: "john@fitnessgym.com",
    role: "admin",
    avatar: "/admin-avatar.png",
    phone: "+1 (555) 123-4567",
    joinDate: "2023-01-15",
    lastActive: "2024-01-20",
    status: "active",
    totalOrders: 0,
  },
  {
    id: "2",
    name: "Sarah Staff",
    email: "sarah@fitnessgym.com",
    role: "staff",
    avatar: "/diverse-staff-avatars.png",
    phone: "+1 (555) 234-5678",
    joinDate: "2023-03-20",
    lastActive: "2024-01-19",
    status: "active",
    totalOrders: 0,
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@email.com",
    role: "member",
    avatar: "/member-avatar.png",
    phone: "+1 (555) 345-6789",
    joinDate: "2023-06-10",
    lastActive: "2024-01-18",
    status: "active",
    membershipType: "Premium",
    totalOrders: 12,
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    role: "member",
    avatar: "/female-member-avatar.png",
    phone: "+1 (555) 456-7890",
    joinDate: "2023-08-22",
    lastActive: "2024-01-17",
    status: "active",
    membershipType: "Basic",
    totalOrders: 5,
  },
  {
    id: "5",
    name: "David Wilson",
    email: "david.wilson@email.com",
    role: "member",
    avatar: "/male-member-avatar.png",
    phone: "+1 (555) 567-8901",
    joinDate: "2023-11-05",
    lastActive: "2024-01-10",
    status: "inactive",
    membershipType: "Premium",
    totalOrders: 8,
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const usersApi = {
  async getUsers(): Promise<User[]> {
    await delay(500)
    return mockUsers
  },

  async getUserById(id: string): Promise<User | null> {
    await delay(300)
    return mockUsers.find((user) => user.id === id) || null
  },

  async createUser(userData: Omit<User, "id" | "joinDate" | "lastActive">): Promise<User> {
    await delay(800)
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      joinDate: new Date().toISOString().split("T")[0],
      lastActive: new Date().toISOString().split("T")[0],
    }
    mockUsers.push(newUser)
    return newUser
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    await delay(800)
    const index = mockUsers.findIndex((user) => user.id === id)
    if (index === -1) throw new Error("User not found")

    mockUsers[index] = { ...mockUsers[index], ...userData }
    return mockUsers[index]
  },

  async deleteUser(id: string): Promise<void> {
    await delay(500)
    const index = mockUsers.findIndex((user) => user.id === id)
    if (index === -1) throw new Error("User not found")
    mockUsers.splice(index, 1)
  },

  async updateUserStatus(id: string, status: User["status"]): Promise<User> {
    await delay(300)
    const index = mockUsers.findIndex((user) => user.id === id)
    if (index === -1) throw new Error("User not found")

    mockUsers[index].status = status
    return mockUsers[index]
  },
}
