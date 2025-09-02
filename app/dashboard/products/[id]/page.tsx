"use client"

import { use, useMemo } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getProduct } from "@/lib/api/products"
import { ArrowLeft, Edit, Package, DollarSign, Calendar, IndianRupee } from "lucide-react"
import { useStrapi } from "@/lib/strapiSDK/useStrapi"
import { renderImage } from "@/lib/renderImage"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params)
  const { data, error, isLoading }:any = useStrapi('products',{
    populate: "*",
    filters: { documentId: id },
  })

  const product = useMemo(() => {
    if (data && data.data && data.data.length > 0) {
      return data.data[0]
    }
    return null
  }, [data])

  // console.log(product)


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading product...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Product not found</p>
      </div>
    )
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const }
    if (stock < 10) return { label: "Low Stock", variant: "secondary" as const }
    return { label: "In Stock", variant: "default" as const }
  }

  const stockStatus = getStockStatus(product.stock)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground">Product details and information</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/products/${product.documentId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product Images */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {product?.images?.map((image:any, index:number) => (
                  <img
                    key={index}
                    src={image.url ? renderImage(image.url) : '/placeholder.png'}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-64 object-cover rounded-md"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Price:</span>
                  <span className="text-2xl font-bold text-primary">₹{Number(product?.price)?.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Stock:</span>
                  <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                  <span className="text-muted-foreground">({product.stock} units)</span>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="font-semibold">Category:</span>
                  <Badge variant="outline" className="ml-2 capitalize">
                    {product?.category?.name || 'Uncategorized'}
                  </Badge>
                </div>
                <div>
                  <span className="font-semibold">Discount (%) : </span>
                  <span className="text-muted-foreground ml-2">{product.discount || 0}%</span>                  
                </div>
                {/* <div>
                  <span className="font-semibold">Status:</span>
                  <Badge variant={product.status === "active" ? "default" : "secondary"} className="ml-2">
                    {product.status}
                  </Badge>
                </div> */}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">Created:</span>
                <span className="text-muted-foreground">{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">Last Updated:</span>
                <span className="text-muted-foreground">{new Date(product.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
