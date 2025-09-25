"use client";

import { useState } from "react";
import { useStrapi } from "@/lib/strapiSDK/useStrapi";
import { strapi } from "@/lib/strapiSDK/strapi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Added Label component
import { Checkbox } from "@/components/ui/checkbox"; // Assuming you have a Checkbox component
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
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
  DollarSign,
} from "lucide-react";

// --- Types ---
type CouponForm = {
  title: string;
  code: string;
  discount: string; // Stored as string for input
  isExpired: boolean;
};

// Assuming the API returns this structure
type Coupon = {
  id: number;
  documentId: number;
  title: string;
  code: string;
  discount: number;
  isExpired: boolean;
  usageCount?: number;
};

// Total number of columns in the table for spanning the loading/empty rows
const TOTAL_COLUMNS = 6;

export default function CouponsPage() {
  const { data, mutate, isLoading } = useStrapi("coupons", { populate: "*" });
  const coupons: any[] = data?.data || [];

  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponForm>({
    title: "",
    code: "",
    discount: "",
    isExpired: false,
  });

  // Validation regex for coupon code (6 uppercase alphanumeric chars)
  const couponCodeRegex = /^[A-Z0-9]{6}$/;

  // Handle input change
  const handleChange = (key: keyof CouponForm, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Generate random coupon code
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code: result }));
  };

  // Open Add/Edit dialog
  const openDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        title: coupon.title,
        code: coupon.code,
        discount: coupon.discount.toString(), // Convert number to string for input
        isExpired: coupon.isExpired,
      });
    } else {
      setEditingCoupon(null);
      setFormData({ title: "", code: "", discount: "", isExpired: false });
    }
    setOpen(true);
  };

  // Create or Update Coupon
  const handleSubmit = async () => {
    if (!formData.title || !formData.code || !formData.discount) {
      toast.error("❌ All fields are required.");
      return;
    }

    if (!couponCodeRegex.test(formData.code)) {
      toast.error(
        "❌ Coupon code must be exactly 6 uppercase alphanumeric characters."
      );
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        discount: Number(formData.discount),
      };

      if (editingCoupon) {
        await strapi.update(
          "coupons",
          editingCoupon.documentId as any,
          payload
        );
        toast.success(`✅ Coupon ${editingCoupon.code} updated.`);
      } else {
        await strapi.create("coupons", payload);
        toast.success(`✅ Coupon ${formData.code} created.`);
      }
      setOpen(false);
      mutate();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save coupon.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Coupon
  const handleDelete = async (coupon: any) => {
    if (
      !confirm(
        `Are you sure you want to delete the coupon code '${coupon.code}'?`
      )
    )
      return;
    try {
      await strapi.delete("coupons", coupon.documentId);
      toast.success(`🗑️ Coupon ${coupon.code} deleted.`);
      mutate();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete coupon.");
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {" "}
      {/* Adjusted padding for mobile (p-4) and desktop (sm:p-8) */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 sm:mb-0 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" /> Discount Coupons
        </h1>
        <Button
          onClick={() => openDialog()}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Add Coupon
        </Button>
      </div>
      {/* Table Container (Made responsive) */}
      <div className="rounded-md border shadow-sm overflow-x-auto">
        {" "}
        {/* KEY: overflow-x-auto for horizontal scrolling */}
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Title</TableHead>
              <TableHead className="min-w-[100px]">Code</TableHead>
              <TableHead className="min-w-[100px]">Discount %</TableHead>
              <TableHead className="min-w-[100px]">Used</TableHead>
              <TableHead className="min-w-[100px]">Expired?</TableHead>
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={TOTAL_COLUMNS} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">
                    Loading coupons...
                  </p>
                </TableCell>
              </TableRow>
            ) : coupons.length > 0 ? (
              coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell className="font-mono text-sm bg-gray-50/50">
                    {c.code}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {c.discount}%
                  </TableCell>
                  <TableCell>{c.usageCount ?? 0}</TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${
                        c.isExpired ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {c.isExpired ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => openDialog(c)}
                      title="Edit Coupon"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(c)}
                      title="Delete Coupon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={TOTAL_COLUMNS}
                  className="h-24 text-center text-gray-500"
                >
                  No discount coupons have been created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Dialog (Modal) - Made Responsive */}
      <Dialog open={open} onOpenChange={setOpen}>
        {/* KEY: responsive sizing classes for mobile full screen */}
        <DialogContent className="sm:max-w-[425px] data-[state=open]:h-full sm:data-[state=open]:h-auto data-[state=open]:max-w-full sm:data-[state=open]:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="space-y-1">
              <Label htmlFor="title">Coupon Title</Label>
              <Input
                id="title"
                placeholder="e.g., Summer Sale, New Member Discount"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            {/* Coupon Code with generate button */}
            <div className="space-y-1">
              <Label htmlFor="code">
                Coupon Code (6 Alphanumeric Characters)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="code"
                  placeholder="ABC123"
                  value={formData.code}
                  onChange={(e) =>
                    handleChange("code", e.target.value.toUpperCase())
                  }
                  maxLength={6}
                  required
                  className="font-mono uppercase"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={generateCode}
                  title="Generate random code"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Generate
                </Button>
              </div>
            </div>

            {/* Discount */}
            <div className="space-y-1">
              <Label htmlFor="discount">Discount Percentage (%)</Label>
              <Input
                id="discount"
                type="number"
                placeholder="e.g., 10, 25, 50"
                value={formData.discount}
                onChange={(e) => handleChange("discount", e.target.value)}
                required
                min="1"
                max="100"
              />
            </div>

            {/* Expired Checkbox (Using proper component) */}
            <div className="flex items-center space-x-2 pt-2">
              {/* Checkbox component is generally styled better than raw input */}
              <Checkbox
                id="isExpired"
                checked={formData.isExpired}
                onCheckedChange={(checked) =>
                  handleChange("isExpired", checked)
                }
              />
              <Label
                htmlFor="isExpired"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mark as Expired
              </Label>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : editingCoupon ? (
                "Update Coupon"
              ) : (
                "Create Coupon"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
