"use client"

import type React from "react"
import { useState } from "react"
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

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([]) // store as File objects
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    discount:""
    // status: "active" as "active" | "inactive",
  })

  const { data: catData }: any = useStrapi("categories",{})

  const categories = catData?.data

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)])
    }
  }

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)


    
    try {
      let uploadedImages: number[] = []
      if (images.length > 0) {
        const formDataUpload = new FormData()
        images.forEach((file) => {
          formDataUpload.append("files", file)
        })

        const uploadRes:any = await strapi.axios.post("/upload",formDataUpload, {
          headers:{
            "Content-Type": "multipart/form-data",
          }
        })

        uploadedImages = uploadRes?.data?.map((f: any) => f.id) 
      }

      await strapi.create("products", {
          name: formData.name,
          description: formData.description,
          price: Number.parseFloat(formData.price),
          stock: Number.parseInt(formData.stock),
          category: {connect:[formData.category]}, // make sure this matches your Strapi relation field
          // status: formData.status,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
          discount:parseInt(formData.discount) || 0,
      })

      toast.success("✅ Product created successfully")
      router.push("/dashboard/products")
    } catch (error) {
      console.error(error)
      toast.error("❌ Failed to create product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product for your gym store</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Basic details about your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your product"
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
                      placeholder="0.00"
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
                      placeholder="0"
                      required
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="stock">Discount %</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="0"
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
                <CardDescription>Upload images to showcase your product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input type="file" accept="image/*"  onChange={handleImageAdd} />
                  {images.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-3">
                      {images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleImageRemove(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
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
                      <SelectValue placeholder="Select status" />
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
                    {loading ? "Creating..." : "Create Product"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/dashboard/products">Cancel</Link>
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
