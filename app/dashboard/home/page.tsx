"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { strapi } from "@/lib/strapiSDK/strapi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { UploadCloud, X, Star, Loader2, RefreshCw } from "lucide-react";

// --- Types ---
interface Review {
  name: string;
  description: string;
  stars: number;
}

interface ImageFile {
  id: number;
  url: string;
  name: string;
}

interface HomePageData {
  top_banners: ImageFile[];
  about_images: ImageFile[];
  reviews: Review[];
}

// --- Custom Components for better UI ---

// 1. Image Drop/Upload Area
const ImageUploadArea = ({
  uploading,
  handleFileUpload,
  field,
}: {
  uploading: boolean;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => Promise<void>;
  field: string;
}) => {
  const uploadId = `file-upload-${field}`;
  return (
    <label
      htmlFor={uploadId}
      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <input
        id={uploadId}
        type="file"
        multiple
        onChange={(e) => handleFileUpload(e, field)}
        disabled={uploading}
        className="hidden"
        accept="image/*"
      />
      {uploading ? (
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      ) : (
        <UploadCloud className="w-8 h-8 text-gray-400" />
      )}
      <p className="mt-2 text-sm text-gray-600">
        {uploading ? "Uploading..." : "Click to upload or drag and drop images"}
      </p>
      <p className="text-xs text-gray-500">Supports multiple files</p>
    </label>
  );
};

// 2. Image Gallery with Delete
const ImageGallery = ({
  images,
  handleDeleteImage,
  field,
}: {
  images: ImageFile[];
  handleDeleteImage: (field: string, id: number) => void;
  field: string;
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((img) => (
        <div
          key={img.id}
          className="relative group border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <img
            src={img.url}
            alt={img.name || "Uploaded image"}
            className="h-32 w-full object-cover"
          />
          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
            <Button
              size="icon"
              variant="destructive"
              className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 rounded-full h-8 w-8"
              onClick={() => handleDeleteImage(field, img.id)}
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

// 3. Star Rating Input
const StarRatingInput = ({
  value,
  onChange,
  maxStars = 5,
}: {
  value: number;
  onChange: (stars: number) => void;
  maxStars?: number;
}) => {
  return (
    <div className="flex space-x-1">
      {[...Array(maxStars)].map((_, i) => {
        const ratingValue = i + 1;
        return (
          <Star
            key={i}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              ratingValue <= value
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }`}
            onClick={() => onChange(ratingValue)}
          />
        );
      })}
    </div>
  );
};

// --- Main Component ---
export default function HomePageEditor() {
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("banners");

  // Review Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState<Review>({
    name: "",
    description: "",
    stars: 0,
  });

  // Fetch data (READ)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Assuming 'home-page' is a Single Type in Strapi
      const res: any = await strapi.find("home-page", { populate: "*" });
      // Normalize data structure for internal state
      setData({
        top_banners:
          res.data.top_banners?.map((item: any) => ({
            id: item.id,
            ...item,
          })) || [],
        about_images:
          res.data.about_images?.map((item: any) => ({
            id: item.id,
            ...item,
          })) || [],
        reviews: res.data.reviews || [],
      });
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("❌ Failed to fetch home page data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Upload files (CREATE)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    // Clear the input value so the same file can be uploaded again if needed
    e.target.value = "";

    try {
      const res = await strapi.axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const uploadedFiles: ImageFile[] = res.data.map((f: any) => ({
        id: f.id,
        url: f.url,
        name: f.name,
      }));

      setData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          [field]: [
            ...(prev[field as keyof HomePageData] || []),
            ...uploadedFiles,
          ],
        };
      });
      toast.success(
        `🖼️ ${uploadedFiles.length} file(s) uploaded successfully!`
      );
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("❌ File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // DELETE image from local state
  const handleDeleteImage = (field: string, id: number) => {
    setData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: (prev[field as keyof HomePageData] as ImageFile[]).filter(
          (img) => img.id !== id
        ),
      };
    });
    toast.info(
      "Image removed locally. Click 'Update' to save changes to Strapi."
    );
  };

  // UPDATE all sections (partial save)
  const handleSectionSave = async (
    section: "banners" | "about" | "reviews"
  ) => {
    if (!data) return;

    try {
      const payload: any = {};

      // Determine the payload based on the section
      if (section === "banners") {
        // Collect only the IDs of the images to link to the single type entry
        payload.top_banners = data.top_banners.map((img) => img.id);
      } else if (section === "about") {
        if (data.about_images.length !== 4) {
          toast.error(
            "Please upload exactly 4 images for the About section ❌"
          );
          return;
        }
        payload.about_images = data.about_images.map((img) => img.id);
      } else if (section === "reviews") {
        // Prepare the clean reviews array for the component field
        payload.reviews = data.reviews.map((r) => ({
          name: r.name,
          description: r.description,
          stars: r.stars,
        }));
      }

      await strapi.axios.put("home-page", { data: payload });
      toast.success(`✅ ${section} section updated successfully!`);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(`❌ Failed to update ${section}.`);
    }
  };

  // CRUD for reviews
  const openReviewDialog = (index: number | null = null) => {
    setEditIndex(index);
    setReviewForm(
      index !== null
        ? data!.reviews[index]
        : { name: "", description: "", stars: 0 }
    );
    setIsDialogOpen(true);
  };

  const saveReview = () => {
    if (!data) return;

    // Basic validation
    if (!reviewForm.name || !reviewForm.description || reviewForm.stars === 0) {
      toast.error("Please fill out all fields and set a star rating.");
      return;
    }

    const updated = [...(data.reviews || [])];
    if (editIndex !== null) updated[editIndex] = reviewForm;
    else updated.push(reviewForm);

    setData({ ...data, reviews: updated });
    setIsDialogOpen(false);
    toast.info(
      "Review saved locally. Click 'Update All' to save changes to Strapi."
    );
  };

  const deleteReview = (index: number) => {
    if (!data) return;
    setData({
      ...data,
      reviews: data.reviews.filter((_: any, i: number) => i !== index),
    });
    toast.info(
      "Review deleted locally. Click 'Update All' to save changes to Strapi."
    );
  };

  // Memoize data for rendering
  const bannerImages = useMemo(() => data?.top_banners || [], [data]);
  const aboutImages = useMemo(() => data?.about_images || [], [data]);
  const reviewsData = useMemo(() => data?.reviews || [], [data]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="ml-3 text-lg text-gray-600">
          Loading home page content...
        </p>
      </div>
    );

  if (!data)
    return (
      <p className="text-center p-12 text-2xl text-red-500">
        Error: Could not load data. Check Strapi API connection.
      </p>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 text-gray-800">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-4xl font-extrabold text-black flex items-center">
          <RefreshCw
            className="w-6 h-6 mr-3 text-black cursor-pointer hover:text-gray-500 transition-colors"
            onClick={fetchData}
            title="Refresh Data"
          />
          Home Page Editor
        </h1>
        <p className="text-gray-500 mt-1">
          Manage banners, about images, and customer reviews.
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white p-1 rounded-xl shadow-lg border mb-6 sticky top-0 z-10">
          <TabsTrigger value="banners">
            Top Banners ({bannerImages.length})
          </TabsTrigger>
          <TabsTrigger value="about">
            About Images ({aboutImages.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({reviewsData.length})
          </TabsTrigger>
        </TabsList>

        {/* --- BANNERS --- */}
        <TabsContent value="banners">
          <Card className="shadow-xl border-t-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-semibold">
                Top Banners Management
              </CardTitle>
              <Button
                onClick={() => handleSectionSave("banners")}
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Save Banners"
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageGallery
                images={bannerImages}
                handleDeleteImage={handleDeleteImage}
                field="top_banners"
              />
              <ImageUploadArea
                uploading={uploading}
                handleFileUpload={handleFileUpload}
                field="top_banners"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ABOUT --- */}
        <TabsContent value="about">
          <Card className="shadow-xl border-t-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-semibold">
                About Section Images
              </CardTitle>
              <Button
                onClick={() => handleSectionSave("about")}
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Save About Images"
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageGallery
                images={aboutImages}
                handleDeleteImage={handleDeleteImage}
                field="about_images"
              />
              <ImageUploadArea
                uploading={uploading}
                handleFileUpload={handleFileUpload}
                field="about_images"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- REVIEWS --- */}
        <TabsContent value="reviews">
          <Card className="shadow-xl border-t-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-semibold">
                Customer Reviews
              </CardTitle>
              <div className="space-x-2">
                <Button
                  onClick={() => openReviewDialog()}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  + Add New Review
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Stars</TableHead>
                    <TableHead className="text-right w-[150px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewsData.length ? (
                    reviewsData.map((rev, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {rev.name}
                        </TableCell>
                        <TableCell className="truncate max-w-sm text-gray-600">
                          {rev.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-0.5">
                            {[...Array(5)].map((_, j) => (
                              <Star
                                key={j}
                                className={`w-4 h-4 ${
                                  j < rev.stars
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReviewDialog(i)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteReview(i)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-gray-500 py-6"
                      >
                        No reviews found. Click '+ Add New Review' to create
                        one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSectionSave("reviews")}
                  className="bg-green-600 hover:bg-green-700 transition-colors"
                >
                  Update All Reviews
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- REVIEW MODAL --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editIndex !== null ? "Edit Customer Review" : "Add New Review"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Reviewer Name"
              value={reviewForm.name}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, name: e.target.value })
              }
            />
            <Textarea
              placeholder="Review Description"
              value={reviewForm.description}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, description: e.target.value })
              }
              rows={5}
            />
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium">Star Rating:</label>
              <StarRatingInput
                value={reviewForm.stars}
                onChange={(stars) => setReviewForm({ ...reviewForm, stars })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveReview}>
              {editIndex !== null ? "Update Review" : "Create Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Note: Ensure you have installed the required dependencies:
// npm install lucide-react sonner
// and that your shadcn/ui components (Button, Card, Input, etc.) are correctly configured.
