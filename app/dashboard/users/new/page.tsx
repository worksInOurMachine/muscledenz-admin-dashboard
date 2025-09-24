"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Camera, X, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { strapi } from "@/lib/strapiSDK/strapi";
import { toast } from "sonner";

// Simple Modal Component
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-gray-900 p-6 rounded-lg relative w-full max-w-md shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function NewUserPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    profile: null as File | null,
    isGymMember: true,
    type: "customer",
  });

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);

  // Start Camera
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Failed to access camera");
    }
  };

  // Capture Snapshot
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
        setFormData((prev) => ({ ...prev, profile: file }));

        // Stop camera stream after capture
        const tracks = (video.srcObject as MediaStream)?.getTracks();
        tracks?.forEach((t) => t.stop());
        setStreaming(false);
        setIsCameraOpen(false);
      }
    }, "image/jpeg");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.profile) {
      toast.error("Please capture a profile picture");
      return;
    }

    setIsLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("files", formData.profile);

      const imageRes = await strapi.axios.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedImageId = imageRes?.data?.[0]?.id;

      const userRes = await strapi.axios.post("/auth/local/register", {
        username: formData.email,
        email: formData.email,
        password: "123123",
      });

      await strapi.axios.put(
        `/users/${userRes?.data?.user?.id}`,
        {
          firstname: formData.firstname,
          lastname: formData.lastname,
          identifier: formData.email,
          phone: formData.phone,
          type: "customer",
          isGymMember: true,
          profile: uploadedImageId,
        },
        { headers: { Authorization: `Bearer ${userRes?.data?.jwt}` } }
      );

      toast.success("User created successfully!");
      router.push("/dashboard/users");
    } catch (err: any) {
      console.error("User creation failed:", err);
      toast.error(err?.response?.data?.error?.message || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-8 px-4 lg:px-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add New User</h1>
            <p className="text-gray-400 mt-1">Create a new user account</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">First Name *</Label>
                  <Input
                    value={formData.firstname}
                    onChange={(e) => handleInputChange("firstname", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Last Name *</Label>
                  <Input
                    value={formData.lastname}
                    onChange={(e) => handleInputChange("lastname", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="+91 6265236906"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Profile Picture Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              {!formData.profile && (
                <Button onClick={startCamera} className="bg-gray-700 w-full flex justify-center items-center">
                  <Camera className="h-4 w-4 mr-2" /> Open Camera
                </Button>
              )}

              {formData.profile && (
                <img
                  src={URL.createObjectURL(formData.profile)}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover"
                />
              )}

              <canvas ref={canvasRef} className="hidden" />

              {formData.profile && (
                <Button
                  variant="destructive"
                  onClick={() => setFormData((prev) => ({ ...prev, profile: null }))}
                  className="bg-red-600 hover:bg-red-500 w-full flex justify-center items-center"
                >
                  <Trash className="h-4 w-4 mr-2" /> Remove Photo
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button type="submit" disabled={isLoading} className="w-full bg-neon-green flex justify-center items-center">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Creating..." : "Create User"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full border-gray-600"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Camera Modal */}
      <Modal open={isCameraOpen} onClose={() => setIsCameraOpen(false)}>
        <div className="flex flex-col items-center space-y-4">
          <video ref={videoRef} autoPlay playsInline className="rounded-md w-full max-w-xs h-auto" />
          <Button onClick={capturePhoto} className="bg-green-600 hover:bg-green-500 w-full">
            Capture Photo
          </Button>
        </div>
      </Modal>
    </div>
  );
}
