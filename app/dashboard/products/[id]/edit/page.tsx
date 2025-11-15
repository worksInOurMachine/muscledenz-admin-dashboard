"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useStrapi } from "@/lib/strapiSDK/useStrapi";
import { strapi } from "@/lib/strapiSDK/strapi";
import { useForm, Controller } from "react-hook-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Fetch product
  const { data, error, isLoading }: any = useStrapi("products", {
    populate: ["images", "category", "thumbnail"],
    filters: { documentId: id },
  });
  const product = data?.data?.[0] || null;

  // Fetch categories
  const { data: catData }: any = useStrapi("categories", {});
  const categories = catData?.data || [];

  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingThumbnail, setExistingThumbnail] = useState<any | null>(null);
  const [newThumbnail, setNewThumbnail] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: "",
      collectionType: "",
      discount: "",
      category: "",
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name ?? "",
        description: product.description ?? "",
        price: product.price ? String(product.price) : "",
        stock: product.stock ? String(product.stock) : "",
        discount: product.discount ? String(product.discount) : "",
        collectionType: product.collectionType
          ? String(product.collectionType)
          : "",
        category: product.category?.id ? String(product.category.id) : "",
      });
      setExistingImages(product.images ?? []);
      setExistingThumbnail(product.thumbnail ?? null);
    }
  }, [product, reset]);

  const handleImageRemove = (index: number, isNew: boolean) => {
    if (isNew) {
      setNewImages(newImages.filter((_, i) => i !== index));
    } else {
      setExistingImages(existingImages.filter((_, i) => i !== index));
    }
  };

  const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages([...newImages, ...Array.from(e.target.files)]);
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewThumbnail(e.target.files[0]);
    }
  };

  const removeThumbnail = () => {
    setExistingThumbnail(null);
    setNewThumbnail(null);
  };

  const onSubmit = async (formData: any) => {
    // ✅ Extra validation for images & thumbnail
    if (!existingThumbnail && !newThumbnail) {
      toast.error("Thumbnail is required");
      return;
    }

    if (existingImages.length + newImages.length === 0) {
      toast.error("At least one product image is required");
      return;
    }

    setLoading(true);
    try {
      let uploadedImageIds: number[] = [];
      let uploadedThumbnailId: number | null = null;

      // Upload new images
      if (newImages.length > 0) {
        const uploads = await Promise.all(
          newImages.map(async (file) => {
            const fd = new FormData();
            fd.append("files", file);
            const res = await strapi.axios.post("/upload", fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
          })
        );
        uploadedImageIds = uploads.flat().map((img: any) => img.id) || [];
      }

      // Upload thumbnail if changed
      if (newThumbnail) {
        const fd = new FormData();
        fd.append("files", newThumbnail);
        const res = await strapi.axios.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedThumbnailId = res.data?.[0]?.id ?? null;
      }

      const finalImageIds = [
        ...existingImages.map((img: any) => img.id),
        ...uploadedImageIds,
      ];

      const finalThumbnailId =
        uploadedThumbnailId !== null
          ? uploadedThumbnailId
          : existingThumbnail?.id ?? null;

      await strapi.update("products", id, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        discount: Number(formData.discount),
        category: formData.category ? parseInt(formData.category, 10) : null,
        images: finalImageIds,
        thumbnail: finalThumbnailId,
        collectionType: formData.collectionType || "",
      });

      toast.success("✅ Product updated successfully");
      router.push(`/dashboard/products/${id}`);
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Product not found</p>
      </div>
    );
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>
                  Update basic details about your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    {...register("description", {
                      required: "Description is required",
                    })}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register("price", { required: "Price is required" })}
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm">
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      {...register("stock", { required: "Stock is required" })}
                    />
                    {errors.stock && (
                      <p className="text-red-500 text-sm">
                        {errors.stock.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%) *</Label>
                    <Input
                      id="discount"
                      type="number"
                      {...register("discount", {
                        required: "Discount is required",
                      })}
                    />
                    {errors.discount && (
                      <p className="text-red-500 text-sm">
                        {errors.discount.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Thumbnail */}
            <Card>
              <CardHeader>
                <CardTitle>Product Thumbnail *</CardTitle>
                <CardDescription>
                  Upload a single thumbnail image for your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {existingThumbnail && !newThumbnail && (
                  <div className="relative group w-40">
                    <img
                      src={existingThumbnail.url || "/placeholder.svg"}
                      alt="Thumbnail"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={removeThumbnail}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {newThumbnail && (
                  <div className="relative group w-40">
                    <img
                      src={URL.createObjectURL(newThumbnail)}
                      alt="New Thumbnail"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={removeThumbnail}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailSelect}
                />
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images *</CardTitle>
                <CardDescription>
                  Upload multiple images to showcase your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleNewImageSelect}
                />
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
                  <Label htmlFor="category">Category *</Label>
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: "Category is required" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-red-500 text-sm">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collectionType">CollectionType *</Label>
                  <Controller
                    name="collectionType"
                    control={control}
                    rules={{ required: "Collection Type is required" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Collection Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "popular",
                            "just-launched",
                            "ayurveda",
                            "trending",
                            "cosmetics-and-skincare",
                            "protein-supplements",
                            "sports-wears",
                          ].map((c: any) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.collectionType && (
                    <p className="text-red-500 text-sm">
                      {errors.collectionType.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Updating..." : "Update Product"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    asChild
                  >
                    <Link href={`/dashboard/products/${id}`}>Cancel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
