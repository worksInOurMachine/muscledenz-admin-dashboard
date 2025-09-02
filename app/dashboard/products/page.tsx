"use client";

import { useStrapi } from "@/lib/strapiSDK/useStrapi";
import { strapi } from "@/lib/strapiSDK/strapi";
import { usePagination } from "@/lib/pagination/usePagination";
import { renderImage } from "@/lib/renderImage";
import { Pagination } from "@/lib/pagination/Pagination";
import { toast } from "sonner";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { page, pageSize, setPage } = usePagination({ page: 1, pageSize: 20 });

  // Paginated products for table
  const { data: products, error, isLoading, mutate } = useStrapi("products", {
    populate: "*",
    sort: ["createdAt:desc"],
    pagination: { page, pageSize },
    filters: {
      ...(search ? { name: { $containsi: search } } : {}),
      ...(category ? { category: { name: { $eq: category } } } : {}),
    },
  });

  // Categories for filter
  const { data: categories } = useStrapi("categories", { sort: ["name:asc"] });

  const { data: allProducts } = useStrapi("products", {
  pagination: { page: 1, pageSize: 999999 },
  fields: ["stock"],
});

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await strapi.delete("products", id);
      mutate();
      toast.success("Product deleted successfully");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (stock < 10) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  // Analytics using allProducts
  const analytics = useMemo(() => {
    if (!allProducts?.data) return { total: 0, active: 0, lowStock: 0, outOfStock: 0 };
    const total = allProducts.data.length;
    // const active = allProducts.data.filter((p: any) => p.status === "active").length;
    const lowStock = allProducts.data.filter((p: any) => p.stock > 0 && p.stock < 10).length;
    const outOfStock = allProducts.data.filter((p: any) => p.stock === 0).length;
    return { total, lowStock, outOfStock };
  }, [allProducts]);

  if (error) return <div className="flex items-center justify-center h-64 text-destructive">Failed to load products</div>;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your gym products and inventory</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total}</div>
          </CardContent>
        </Card>
       
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.outOfStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>Search and filter products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-8"
              />
            </div>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="border rounded-md px-2 py-1"
            >
              <option value="">All Categories</option>
              {categories?.data?.map((cat: any) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">Loading products...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.data?.map((product: any) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <TableRow key={product.documentId}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img
                              src={renderImage(product.thumbnail?.url) || "/placeholder.svg"}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">{product.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {product.category?.name ?? "Uncategorized"}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{product.price}</TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                          <div className="text-sm text-muted-foreground mt-1">{product.stock} units</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/products/${product.documentId}`}>
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/products/${product.documentId}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(product.documentId, product.name)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Pagination meta={products?.meta?.pagination} page={page} setPage={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
