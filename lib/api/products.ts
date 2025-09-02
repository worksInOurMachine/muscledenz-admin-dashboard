// Mock Strapi SDK functions - replace with actual Strapi SDK calls
export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

// Mock data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Protein Powder",
    description: "High-quality whey protein powder for muscle building and recovery",
    price: 49.99,
    stock: 25,
    category: "supplements",
    images: ["/protein-powder-assortment.png"],
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Resistance Bands Set",
    description: "Complete set of resistance bands for strength training",
    price: 29.99,
    stock: 15,
    category: "equipment",
    images: ["/resistance-bands-exercise.png"],
    status: "active",
    createdAt: "2024-01-14T09:00:00Z",
    updatedAt: "2024-01-14T09:00:00Z",
  },
  {
    id: "3",
    name: "Gym Water Bottle",
    description: "Insulated water bottle with gym logo",
    price: 19.99,
    stock: 50,
    category: "accessories",
    images: ["/reusable-water-bottle.png"],
    status: "active",
    createdAt: "2024-01-13T08:00:00Z",
    updatedAt: "2024-01-13T08:00:00Z",
  },
  {
    id: "4",
    name: "Pre-Workout Energy",
    description: "Energy boost supplement for intense workouts",
    price: 34.99,
    stock: 0,
    category: "supplements",
    images: ["/pre-workout-supplement.png"],
    status: "inactive",
    createdAt: "2024-01-12T07:00:00Z",
    updatedAt: "2024-01-12T07:00:00Z",
  },
]

export async function getProducts(): Promise<Product[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockProducts
}

export async function getProduct(id: string): Promise<Product | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockProducts.find((product) => product.id === id) || null
}

export async function createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  const newProduct: Product = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockProducts.unshift(newProduct)
  return newProduct
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  const index = mockProducts.findIndex((product) => product.id === id)
  if (index === -1) throw new Error("Product not found")

  mockProducts[index] = {
    ...mockProducts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  return mockProducts[index]
}

export async function deleteProduct(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const index = mockProducts.findIndex((product) => product.id === id)
  if (index === -1) throw new Error("Product not found")
  mockProducts.splice(index, 1)
}
