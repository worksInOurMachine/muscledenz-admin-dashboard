"use client"

import { useState } from "react"
import { useStrapi } from "@/lib/strapiSDK/useStrapi"
import { strapi } from "@/lib/strapiSDK/strapi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react"

export default function CouponsPage() {
  const { data, mutate, isLoading } = useStrapi("coupons", { populate: "*" })
  const coupons = data?.data || []

  const [open, setOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    discount: "",
    isExpired: false,
  })

  // Validation regex for coupon code (6 uppercase alphanumeric chars)
  const couponCodeRegex = /^[A-Z0-9]{6}$/

  // Handle input change
  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  // Generate random coupon code
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((prev) => ({ ...prev, code: result }))
  }

  // Open Add/Edit dialog
  const openDialog = (coupon?: any) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        title: coupon.title,
        code: coupon.code,
        discount: coupon.discount,
        isExpired: coupon.isExpired,
      })
    } else {
      setEditingCoupon(null)
      setFormData({ title: "", code: "", discount: "", isExpired: false })
    }
    setOpen(true)
  }

  // Create or Update Coupon
  const handleSubmit = async () => {
    try {
      // Validate coupon code
      if (!couponCodeRegex.test(formData.code)) {
        toast.error("❌ Coupon code must be 6 characters (A–Z, 0–9)")
        return
      }

      if (editingCoupon) {
        await strapi.update("coupons", editingCoupon.documentId, {
          ...formData,
          discount: Number(formData.discount),
        })
        toast.success("✅ Coupon updated")
      } else {
        await strapi.create("coupons", {
          ...formData,
          discount: Number(formData.discount),
        })
        toast.success("✅ Coupon created")
      }
      setOpen(false)
      mutate()
    } catch (err) {
      console.error(err)
      toast.error("❌ Failed to save coupon")
    }
  }

  // Delete Coupon
  const handleDelete = async (id: any) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return
    try {
      await strapi.delete("coupons", id)
      toast.success("🗑️ Coupon deleted")
      mutate()
    } catch (err) {
      console.error(err)
      toast.error("❌ Failed to delete coupon")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
        <Button onClick={() => openDialog()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Coupon
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Discount %</TableHead>
              <TableHead>Usage Count</TableHead>
              <TableHead>Expired?</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading...</TableCell>
              </TableRow>
            ) : coupons.length > 0 ? (
              coupons.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell>{c.title}</TableCell>
                  <TableCell>{c.code}</TableCell>
                  <TableCell>{c.discount}%</TableCell>
                  <TableCell>{c.usageCount ?? 0}</TableCell>
                  <TableCell>{c.isExpired ? "✅ Yes" : "❌ No"}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button size="icon" variant="outline" onClick={() => openDialog(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(c.documentId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No coupons found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />

            {/* Coupon Code with generate button */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Coupon Code (ABC123)"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                maxLength={6}
                required
              />
              <Button type="button" variant="outline" onClick={generateCode}>
                <RefreshCw className="h-4 w-4 mr-1" /> Generate
              </Button>
            </div>

            <Input
              type="number"
              placeholder="Discount %"
              value={formData.discount}
              onChange={(e) => handleChange("discount", e.target.value)}
              required
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isExpired}
                onChange={(e) => handleChange("isExpired", e.target.checked)}
              />
              <label>Expired?</label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingCoupon ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
