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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Delete, Edit } from "lucide-react";
import { toast } from "sonner";

export default function PlansPage() {
  const { data: plansData, isLoading, mutate } = useStrapi("gym-plans", {
    populate: "*",
    pagination:{
        page:1,
        pageSize:9999
    }
  });

  const plans = plansData?.data || [];

  const [open, setOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [form, setForm] = useState({ title: "", duration: "", price: "" });

  const handleOpen = (plan: any = null) => {
    if (plan) {
      setEditingPlan(plan);
      setForm({
        title: plan.title,
        duration: plan.duration,
        price: plan.price,
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

    if (!form.title || !form.duration || !form.price){
        toast.error('All fields are required!')
        return
    }

    if (editingPlan) {
      await strapi.update("gym-plans", editingPlan.documentId, form);
    } else {
      await strapi.create("gym-plans", form);
    }
    mutate(); // refresh data
    setOpen(false);
  };

  const handleDelete = async (id: any) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      await strapi.delete("gym-plans", id);
      mutate();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Gym Plans</h1>
        <Button onClick={() => handleOpen()}>+ Add Plan</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Duration (months)</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan: any) => (
            <TableRow key={plan.id}>
              <TableCell>{plan.title}</TableCell>
              <TableCell>{plan.duration} Months</TableCell>
              <TableCell>₹{plan.price}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleOpen(plan)}>
                  <Edit/>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(plan.documentId)}
                >
                  <Delete/>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {plans.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No plans found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Create/Edit Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Plan" : "Create Plan"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <Input
              placeholder="Title"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
            />
            <Input
              type="number"
              placeholder="Duration (months)"
              name="duration"
              required
              value={form.duration}
              onChange={handleChange}
            />
            <Input
              type="number"
              placeholder="Price"
              required
              name="price"
              value={form.price}
              onChange={handleChange}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSave}>
              {editingPlan ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
