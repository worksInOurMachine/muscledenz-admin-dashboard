  "use client"

  import type React from "react"
  import { useState } from "react"
  import { useRouter } from "next/navigation"
  import { Button } from "@/components/ui/button"
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { Textarea } from "@/components/ui/textarea"
  import { ArrowLeft, Upload, X } from "lucide-react"
  import { toast } from "sonner"
  import Link from "next/link"
  import { strapi } from "@/lib/strapiSDK/strapi"

  export default function NewCategoryPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [thumbnail, setThumbnail] = useState<any>("")
    const [formData, setFormData] = useState({
      name: "",
      description: "",
    })

 const handleThumbnailAdd = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setThumbnail(file)
  };

  input.click();
};

    const handleThumbnailRemove = () => {
      setThumbnail("")
    }

    const handleNameChange = (name: string) => {
      setFormData({
        ...formData,
        name,
      })
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)

      try {
        // ✅ Strapi SDK create

        let imageId;
        const uploadData = new FormData()
        if (thumbnail) {
          uploadData.append("files", thumbnail)
          const res = await strapi.axios.post("/upload", uploadData,{
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          imageId = res.data[0].id
        }

        await strapi.create("categories", {
            name: formData.name,
            description: formData.description,
            thumbnail: imageId || "",
        })

        toast.success("Category created successfully")
        router.push("/dashboard/categories")
      } catch (error) {
        console.error(error)
        toast.error("Failed to create category")
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/categories">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Category</h1>
            <p className="text-muted-foreground">Create a new product category</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Information</CardTitle>
                  <CardDescription>Basic details about your category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe this category"
                      rows={4}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Category Thumbnail */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Thumbnail</CardTitle>
                  <CardDescription>Add a thumbnail image for this category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!thumbnail ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleThumbnailAdd}
                        className="w-full h-48 border-dashed bg-transparent"
                      >
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-lg font-medium">Click to add thumbnail</p>
                          <p className="text-sm text-muted-foreground">Recommended size: 300x200px</p>
                        </div>
                      </Button>
                    ) : (
                      <div className="relative">
                        <img
                          src={thumbnail ? URL.createObjectURL(thumbnail) : "/placeholder.svg"}
                          alt="Category thumbnail"
                          className="w-full h-48 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={handleThumbnailRemove}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating..." : "Create Category"}
                    </Button>
                    <Button type="button" variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/dashboard/categories">Cancel</Link>
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
