"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useStrapi } from "@/lib/strapiSDK/useStrapi"
import { strapi } from "@/lib/strapiSDK/strapi"

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params)
  const router = useRouter()

  // fetch product
  const { data, error, isLoading }: any = useStrapi("products", {
    populate: ["images", "category"],
    filters: { documentId: id },
  })
  const product = data?.data?.[0] || null

  console.log(product)

  // fetch categories dynamically
  const { data: catData }: any = useStrapi("categories", {})
  const categories = catData?.data || []

  const [loading, setLoading] = useState(false)
  const [existingImages, setExistingImages] = useState<any[]>([]) // strapi image objects
  const [newImages, setNewImages] = useState<File[]>([]) // new files user adds
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    discount:''
    // status: "active" as "active" | "inactive",
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "",
        category: product.category?.id?.toString() || "",
        // status: product.status || "active",
        discount:product.discount
      })
      setExistingImages(product.images || []) // full objects
    }
  }, [product])

  const handleImageRemove = (index: number, isNew: boolean) => {
    if (isNew) {
      setNewImages(newImages.filter((_, i) => i !== index))
    } else {
      setExistingImages(existingImages.filter((_, i) => i !== index))
    }
  }

  const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages([...newImages, ...Array.from(e.target.files)])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let uploadedImageIds: number[] = []
      if (newImages.length > 0) {
        const uploads = await Promise.all(
          newImages.map(async (file) => {
            const formData = new FormData()
            formData.append("files", file)
            const res = await strapi.axios.post('/upload',formData,{
              headers:{
            "Content-Type": "multipart/form-data",
          }
            })
            return res.data
          })
        )

        uploadedImageIds = uploads.flat().map((img: any) => img.id) || []

      }

      const finalImageIds = [
        ...existingImages.map((img: any) => img.id), 
        ...uploadedImageIds,
      ]

      await strapi.update("products",id, {
          name: formData.name,
          description: formData.description,
          price: Number.parseFloat(formData.price),
          stock: Number.parseInt(formData.stock),
          category: formData.category ? parseInt(formData.category) : null,
          // status: formData.status,
          discount:Number(formData.discount),
          images: finalImageIds,
      })

      toast.success("✅ Product updated successfully")
      router.push(`/dashboard/products/${id}`)
    } catch (error) {
      console.error(error)
      toast.error("❌ Failed to update product")
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/products/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>
      </div>

      <form key={product.id} onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Update basic details about your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="stock">Discount(%)</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Update images to showcase your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-3">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleImageRemove(index, false)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New images preview */}
                {newImages.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-3">
                    {newImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleImageRemove(index, true)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* File input */}
                <Input type="file" multiple accept="image/*" onChange={handleNewImageSelect} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Settings</CardTitle>
                <CardDescription>Configure product options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Updating..." : "Update Product"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full bg-transparent" asChild>
                    <Link href={`/dashboard/products/${id}`}>Cancel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
