"use client";

import { useState, useEffect } from "react";
import { strapi } from "@/lib/strapiSDK/strapi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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

export default function HomePageEditor() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("banners");

  // Review Modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    description: "",
    stars: 0,
  });

  // Fetch data (READ)
  const fetchData = async () => {
    try {
      const res = await strapi.find("home-page", { populate: "*" });
      setData(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Upload files (CREATE)
  const handleFileUpload = async (e: any, field: string) => {
    const files = e.target.files;
    if (!files.length) return;
    setUploading(true);
    const formData = new FormData();
    for (let f of files) formData.append("files", f);
    try {
      const res = await strapi.axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const imageId = res.data;
      const uploaded = imageId.map((f: any) => f);
      setData((prev: any) => ({
        ...prev,
        [field]: [...(prev[field] || []), ...uploaded],
      }));
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  // DELETE image
  const handleDeleteImage = (field: string, id: number) => {
    setData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((img: any) => img.id !== id),
    }));
  };

  // UPDATE all sections (partial save)
  const handleSectionSave = async (section: string) => {
    try {
      const payload: any = {};
      if (section === "banners")
        payload.top_banners = data.top_banners.map((img: any) => img.id);
      if (section === "about")
        payload.about_images = data.about_images.map((img: any) => img.id);
      if (section === "reviews")
        payload.reviews =
          data.reviews?.map((r: any) => {
            return {
              name: r.name,
              description: r.description,
              stars: r.stars,
            };
          }) || [];

      await strapi.axios.put("home-page", { data: payload });
      toast.success(`✅ ${section} updated successfully!`);
    } catch (err) {
      console.error("Update failed:", err);
      alert("❌ Update failed");
    }
  };

  // CRUD for reviews
  const openReviewDialog = (index: number | null = null) => {
    setEditIndex(index);
    setReviewForm(
      index !== null
        ? data.reviews[index]
        : { name: "", description: "", stars: 0 }
    );
    setIsDialogOpen(true);
  };

  const saveReview = () => {
    const updated = [...(data.reviews || [])];
    if (editIndex !== null) updated[editIndex] = reviewForm;
    else updated.push(reviewForm);
    setData({ ...data, reviews: updated });
    setIsDialogOpen(false);
  };

  const deleteReview = (index: number) => {
    setData({
      ...data,
      reviews: data.reviews.filter((_: any, i: number) => i !== index),
    });
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (!data) return <p className="text-center text-red-500">No data found</p>;

  return (
    <div className="max-w-6xl mx-auto p-8 text-gray-900">
      <h1 className="text-3xl font-semibold mb-6">🏠 Home Page Editor</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 mb-6 rounded-lg border">
          <TabsTrigger value="banners">Top Banners</TabsTrigger>
          <TabsTrigger value="about">About Images</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* --- BANNERS --- */}
        <TabsContent value="banners">
          <Card className="p-6 space-y-6 shadow">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium">Top Banners</h2>
              <div className="space-x-2">
                <Button onClick={fetchData} variant="outline">
                  Refresh
                </Button>
                <Button
                  onClick={() => handleSectionSave("banners")}
                  disabled={uploading}
                >
                  Update
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {data.top_banners?.map((img: any) => (
                <div
                  key={img.id}
                  className="relative border rounded-lg overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="h-32 w-full object-cover"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => handleDeleteImage("top_banners", img.id)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>

            <Input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e, "top_banners")}
            />
          </Card>
        </TabsContent>

        {/* --- ABOUT --- */}
        <TabsContent value="about">
          <Card className="p-6 space-y-6 shadow">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium">About Images</h2>
              <div className="space-x-2">
                <Button onClick={fetchData} variant="outline">
                  Refresh
                </Button>
                <Button
                  onClick={() => handleSectionSave("about")}
                  disabled={uploading}
                >
                  Update
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {data.about_images?.map((img: any) => (
                <div
                  key={img.id}
                  className="relative border rounded-lg overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="h-32 w-full object-cover"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => handleDeleteImage("about_images", img.id)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>

            <Input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e, "about_images")}
            />
          </Card>
        </TabsContent>

        {/* --- REVIEWS --- */}
        <TabsContent value="reviews">
          <Card className="p-6 space-y-6 shadow">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium">Reviews</h2>
              <div className="space-x-2">
                <Button variant="outline" onClick={fetchData}>
                  Refresh
                </Button>
                <Button onClick={() => openReviewDialog()}>+ Create</Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Stars</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.reviews?.length ? (
                  data.reviews.map((rev: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{rev.name}</TableCell>
                      <TableCell className="truncate max-w-xs">
                        {rev.description}
                      </TableCell>
                      <TableCell>{rev.stars}</TableCell>
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
                      className="text-center text-gray-500"
                    >
                      No reviews found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex justify-end">
              <Button onClick={() => handleSectionSave("reviews")}>
                Update All
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- REVIEW MODAL --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editIndex !== null ? "Edit Review" : "Add Review"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
            />
            <Input
              type="number"
              min="1"
              max="5"
              placeholder="Stars (1–5)"
              value={reviewForm.stars}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, stars: Number(e.target.value) })
              }
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveReview}>
              {editIndex !== null ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
