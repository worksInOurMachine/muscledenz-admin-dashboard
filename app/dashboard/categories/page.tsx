"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getCategories, deleteCategory } from "@/lib/api/categories"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, FolderOpen, Package } from "lucide-react"
import { toast } from "sonner"
import { useStrapi } from "@/lib/strapiSDK/useStrapi"
import { strapi } from "@/lib/strapiSDK/strapi"

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { data, error, isLoading, mutate } = useStrapi('categories',{
    sort: ["createdAt:desc"],
    populate:'thumbnail'
  })
  const categories:any = data?.data || []

  const filteredCategories = categories?.filter((category:any) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      await strapi.delete("categories", id)
      mutate()
      toast.success("Category deleted successfully")
    } catch (error) {
      toast.error("Failed to delete category")
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Failed to load categories</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Organize your products into categories</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories?.filter((c:any) => c.status === "active").length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Products</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories?.filter((c:any) => c.productCount > 0).length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empty Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories?.filter((c:any) => c.productCount === 0).length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
          <CardDescription>View and manage all product categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading categories...</div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCategories?.map((category:any) => (
                <Card key={category.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Category Image */}
                      <div className="relative">
                        <img
                          src={category?.thumbnail?.url || "/placeholder.svg"}
                          alt={category?.name}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/categories/${category.documentId}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/categories/${category.documentId}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(category.documentId, category.name)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Category Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          {/* <Badge variant={category.status === "active" ? "default" : "secondary"}>
                            {category.status}
                          </Badge> */}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                        {/* <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Products:</span>
                          <Badge variant="outline">{category.productCount}</Badge>
                        </div> */}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                          <Link href={`/dashboard/categories/${category.documentId}`}>
                            <Eye className="mr-2 h-3 w-3" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                          <Link href={`/dashboard/categories/${category.documentId}/edit`}>
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
