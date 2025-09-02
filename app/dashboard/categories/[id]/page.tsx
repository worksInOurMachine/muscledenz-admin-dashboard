"use client"

import { use } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getCategory } from "@/lib/api/categories"
import { ArrowLeft, Edit, Package, Calendar, Hash } from "lucide-react"
import { useStrapi } from "@/lib/strapiSDK/useStrapi"

interface CategoryPageProps {
  params: Promise<{ id: string }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { id } = use(params)
  const { data, error, isLoading } = useStrapi('categories',{
    populate: "*",
    filters: { documentId: id },
  })

  const category:any = data?.data[0] || null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading category...</div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Category not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/categories">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
            <p className="text-muted-foreground">Category details and information</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/categories/${category.documentId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Category
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Category Thumbnail */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Category Thumbnail</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={category.thumbnail?.url || "/placeholder.svg"}
                alt={category.name}
                className="w-full h-64 object-cover rounded-md"
              />
            </CardContent>
          </Card>
        </div>

        {/* Category Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
              {/* <Separator /> */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Slug:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{category.slug}</code>
                </div> */}
                {/* <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Products:</span>
                  <Badge variant="outline">{category.productCount} items</Badge>
                </div> */}
              </div>
              <Separator />
              {/* <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <Badge variant={category.status === "active" ? "default" : "secondary"}>{category.status}</Badge>
              </div> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">Created:</span>
                <span className="text-muted-foreground">{new Date(category.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">Last Updated:</span>
                <span className="text-muted-foreground">{new Date(category.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <Link href={`/dashboard/products?category=${category.documentId}`}>
                  <Package className="mr-2 h-4 w-4" />
                  View Products in this Category
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <Link href="/dashboard/products/new">
                  <Package className="mr-2 h-4 w-4" />
                  Add Product to this Category
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
