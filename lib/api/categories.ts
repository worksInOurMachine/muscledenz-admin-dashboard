// Mock Strapi SDK functions for categories - replace with actual Strapi SDK calls
export interface Category {
  id: string
  name: string
  description: string
  thumbnail: string
  slug: string
  productCount: number
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

// Mock data
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Supplements",
    description: "Protein powders, vitamins, and nutritional supplements for optimal performance",
    thumbnail: "/supplements-category.png",
    slug: "supplements",
    productCount: 2,
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Equipment",
    description: "Gym equipment, weights, and training accessories",
    thumbnail: "/gym-equipment-category.png",
    slug: "equipment",
    productCount: 1,
    status: "active",
    createdAt: "2024-01-14T09:00:00Z",
    updatedAt: "2024-01-14T09:00:00Z",
  },
  {
    id: "3",
    name: "Accessories",
    description: "Water bottles, towels, and other gym accessories",
    thumbnail: "/gym-accessories-category.png",
    slug: "accessories",
    productCount: 1,
    status: "active",
    createdAt: "2024-01-13T08:00:00Z",
    updatedAt: "2024-01-13T08:00:00Z",
  },
  {
    id: "4",
    name: "Apparel",
    description: "Workout clothes, shoes, and athletic wear",
    thumbnail: "/athletic-apparel-category.png",
    slug: "apparel",
    productCount: 0,
    status: "active",
    createdAt: "2024-01-12T07:00:00Z",
    updatedAt: "2024-01-12T07:00:00Z",
  },
  {
    id: "5",
    name: "Nutrition",
    description: "Healthy snacks, meal replacements, and nutrition bars",
    thumbnail: "/nutrition-category.png",
    slug: "nutrition",
    productCount: 0,
    status: "inactive",
    createdAt: "2024-01-11T06:00:00Z",
    updatedAt: "2024-01-11T06:00:00Z",
  },
]

export async function getCategories(): Promise<Category[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockCategories
}

export async function getCategory(id: string): Promise<Category | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockCategories.find((category) => category.id === id) || null
}

export async function createCategory(
  data: Omit<Category, "id" | "createdAt" | "updatedAt" | "productCount">,
): Promise<Category> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  const newCategory: Category = {
    ...data,
    id: Date.now().toString(),
    productCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockCategories.unshift(newCategory)
  return newCategory
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  const index = mockCategories.findIndex((category) => category.id === id)
  if (index === -1) throw new Error("Category not found")

  mockCategories[index] = {
    ...mockCategories[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  return mockCategories[index]
}

export async function deleteCategory(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const index = mockCategories.findIndex((category) => category.id === id)
  if (index === -1) throw new Error("Category not found")
  mockCategories.splice(index, 1)
}
