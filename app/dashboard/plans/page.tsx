"use client";

import React, { useState } from "react";
import { strapi } from "@/lib/strapiSDK/strapi";
import { useStrapi } from "@/lib/strapiSDK/useStrapi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Delete, Edit, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

type PlanForm = {
  title: string;
  duration: string | number;
  price: string | number;
};

type GymPlan = {
  id: number;
  documentId: number;
  title: string;
  duration: number;
  price: number;
};

export default function PlansPage() {
  const {
    data: plansData,
    isLoading,
    mutate,
  } = useStrapi("gym-plans", {
    populate: "*",
    pagination: {
      page: 1,
      pageSize: 9999,
    },
  });

  const plans: any[] = plansData?.data || [];

  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<GymPlan | null>(null);
  const [form, setForm] = useState<PlanForm>({
    title: "",
    duration: "",
    price: "",
  });

  const handleOpen = (plan: GymPlan | null = null) => {
    if (plan) {
      setEditingPlan(plan);
      setForm({
        title: plan.title,
        duration: plan.duration.toString(),
        price: plan.price.toString(),
      });
    } else {
      setEditingPlan(null);
      setForm({ title: "", duration: "", price: "" });
    }
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.title || !form.duration || !form.price) {
      toast.error("All fields are required!");
      return;
    }

    const payload = {
      title: form.title,
      duration: Number(form.duration),
      price: Number(form.price),
    };

    setIsSaving(true);
    try {
      if (editingPlan) {
        await strapi.update(
          "gym-plans",
          editingPlan.documentId as any,
          payload
        );
        toast.success(`Plan '${form.title}' updated successfully.`);
      } else {
        await strapi.create("gym-plans", payload);
        toast.success(`Plan '${form.title}' created successfully.`);
      }
      mutate();
      setOpen(false);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(`Failed to ${editingPlan ? "update" : "create"} plan.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (plan: any) => {
    if (confirm(`Are you sure you want to delete the plan: ${plan.title}?`)) {
      try {
        await strapi.delete("gym-plans", plan.documentId);
        mutate();
        toast.success(`Plan '${plan.title}' deleted successfully.`);
      } catch (error) {
        console.error("Delete failed:", error);
        toast.error(`Failed to delete plan '${plan.title}'.`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-lg text-gray-600">Loading Plans...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {" "}
      {/* Adjusted padding for mobile (p-4) and desktop (sm:p-8) */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 sm:mb-0">
          💰 Membership Plans
        </h1>
        <Button
          onClick={() => handleOpen()}
          className="flex items-center gap-1 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Add New Plan
        </Button>
      </div>
      {/* Table Container (Made responsive) */}
      <div className="rounded-lg border shadow-sm overflow-x-auto">
        {" "}
        {/* KEY: overflow-x-auto allows horizontal scrolling */}
        <Table className="min-w-full">
          {" "}
          {/* KEY: min-w-full ensures table is not squashed */}
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Title</TableHead>
              <TableHead className="min-w-[120px]">Duration</TableHead>
              <TableHead className="text-right min-w-[100px]">Price</TableHead>
              <TableHead className="text-center w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.title}</TableCell>
                <TableCell>{plan.duration} Months</TableCell>
                <TableCell className="text-right font-semibold">
                  ₹{plan.price.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="flex justify-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleOpen(plan)}
                    title="Edit Plan"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(plan)}
                    title="Delete Plan"
                  >
                    <Delete className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {plans.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-gray-500"
                >
                  No membership plans have been created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Create/Edit Modal (Made responsive) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] data-[state=open]:h-full sm:data-[state=open]:h-auto data-[state=open]:max-w-full sm:data-[state=open]:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Edit Membership Plan" : "Create New Plan"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Input Groups */}
            <div className="grid items-center gap-1.5">
              <Label htmlFor="title">Plan Title</Label>
              <Input
                id="title"
                placeholder="e.g., Monthly Elite, Annual Saver"
                name="title"
                required
                value={form.title}
                onChange={handleChange}
              />
            </div>
            <div className="grid items-center gap-1.5">
              <Label htmlFor="duration">Duration (in Months)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 1, 3, 12"
                name="duration"
                required
                value={form.duration}
                onChange={handleChange}
                min="1"
              />
            </div>
            <div className="grid items-center gap-1.5">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g., 999, 5499"
                required
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : editingPlan ? (
                "Update Plan"
              ) : (
                "Create Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
