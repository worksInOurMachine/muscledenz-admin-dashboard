"use client";

import { useStrapi } from "@/lib/strapiSDK/useStrapi";
import { strapi } from "@/lib/strapiSDK/strapi";
import { usePagination } from "@/lib/pagination/usePagination";
import { renderImage } from "@/lib/renderImage";
import { Pagination } from "@/lib/pagination/Pagination";
import { toast } from "sonner";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { page, pageSize, setPage } = usePagination({ page: 1, pageSize: 20 });

  const {
    data: products,
    error,
    isLoading,
    mutate,
  } = useStrapi("products", {
    populate: "*",
    sort: ["createdAt:desc"],
    pagination: { page, pageSize },
    filters: {
      ...(search ? { name: { $containsi: search } } : {}),
      ...(category ? { category: { name: { $eq: category } } } : {}),
    },
  });

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
    if (stock === 0)
      return { label: "Out of Stock", variant: "destructive" as const };
    if (stock < 10)
      return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const analytics = useMemo(() => {
    if (!allProducts?.data)
      return { total: 0, active: 0, lowStock: 0, outOfStock: 0 };
    const total = allProducts.data.length;
    const lowStock = allProducts.data.filter(
      (p: any) => p.stock > 0 && p.stock < 10
    ).length;
    const outOfStock = allProducts.data.filter(
      (p: any) => p.stock === 0
    ).length;
    return { total, lowStock, outOfStock };
  }, [allProducts]);

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        Failed to load products
      </div>
    );

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your gym products and inventory
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
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
        {/* Placeholder for a 4th Card to maintain grid layout, or remove md:grid-cols-4 if only 3 are needed. Keeping it simple here. */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>Search and filter products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8 w-full"
              />
            </div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="border rounded-md px-3 py-2 text-sm bg-background h-10 w-full sm:w-auto min-w-[150px] focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="">All Categories</option>
              {categories?.data?.map((cat: any) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                Loading products...
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Product</TableHead>
                      {/* Removed hidden sm:table-cell for Category header */}
                      <TableHead className="min-w-[100px]">Category</TableHead>
                      <TableHead className="min-w-[100px]">Price</TableHead>
                      <TableHead className="min-w-[120px]">Stock</TableHead>
                      <TableHead className="text-right w-[80px]">
                        Actions
                      </TableHead>
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
                                src={
                                  renderImage(product.thumbnail?.url) ||
                                  "/placeholder.svg"
                                }
                                alt={product.name}
                                className="h-10 w-10 rounded-md object-cover flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-medium text-sm sm:text-base truncate max-w-[200px]">
                                  {product.name}
                                </div>
                                <div className="text-xs text-muted-foreground truncate max-w-xs">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          {/* Removed hidden sm:table-cell for Category cell */}
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {product.category?.name ?? "Uncategorized"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            ₹{product.price}
                          </TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant}>
                              {stockStatus.label}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {product.stock} units
                            </div>
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
                                  <Link
                                    href={`/dashboard/products/${product.documentId}`}
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/dashboard/products/${product.documentId}/edit`}
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDelete(
                                      product.documentId,
                                      product.name
                                    )
                                  }
                                  className="text-destructive"
                                >
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
              </>
            )}
          </div>
          <div className="mt-4">
            <Pagination
              meta={products?.meta?.pagination}
              page={page}
              setPage={setPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
