"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Mail,
  ShoppingBag,
  Plus,
  FileText,
  Phone,
  MailIcon,
  PhoneIcon,
  IdCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStrapi } from "@/lib/strapiSDK/useStrapi";
import { renderImage } from "@/lib/renderImage";
import { strapi } from "@/lib/strapiSDK/strapi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatDate } from "@/lib/formatDate";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = use(params);
  const [amount, setAmount] = useState("");
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [invoiceSub, setInvoiceSub] = useState<any>(null);

  // New subscription states
  const [showSubDialog, setShowSubDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [subPaidAmount, setSubPaidAmount] = useState("");

  const { data, error, isLoading, mutate } = useStrapi("users", {
    filters: { documentId: id },
    populate: {
      profile: true,
      subscriptions: {
        sort: ["createdAt:desc"],
        populate: {
          plan: true,
          invoices: {
            filters: { publishedAt: { $notNull: true } },
          },
        },
        filters: { publishedAt: { $notNull: true } },
      },
    },
    fields: [
      "firstname",
      "lastname",
      "type",
      "email",
      "phone",
      "createdAt",
      "documentId",
      "id",
      "isGymMember",
    ],
  });

  const { data: plansData } = useStrapi("gym-plans", {
    fields: ["id", "title", "price", "duration"],
    filters: { publishedAt: { $notNull: true } },
  });

  const user: any = (data as any)?.[0] || [];
  const plans: any = plansData?.data || [];

  // --------- HANDLERS ----------
  const handleAddPayment = async () => {
    if (!selectedSub) return;

    const planPrice = Number(selectedSub.currentPlanAmount || 0);
    const alreadyPaid = Number(selectedSub.paidAmount || 0);
    const pending = planPrice - alreadyPaid;
    const payAmount = Number(amount);

    if (!payAmount || payAmount <= 0) {
      toast.warning("Amount must be greater than 0");
      return;
    }
    if (payAmount > pending) {
      toast.warning(`Cannot pay more than pending ₹${pending}`);
      return;
    }

    try {
      const newInvoice = await strapi.create("invoices", {
        user: user.id,
        subscription: selectedSub.id,
        amount: payAmount,
        paymentDate: new Date(),
      });

      const newPaid = alreadyPaid + payAmount;
      await strapi.update("subscriptions", selectedSub.documentId, {
        paidAmount: newPaid,
        paid: newPaid >= planPrice,
        invoices: [
          ...selectedSub.invoices.map((inv: any) => inv.id),
          newInvoice.data.id,
        ],
      });

      setAmount("");
      setSelectedSub(null);
      mutate();
      toast.success("Payment added successfully!");
    } catch (err) {
      console.error("Error adding payment:", err);
      toast.error("Failed to add payment");
    }
  };

  const handleAddSubscription = async () => {
    if (!selectedPlan) {
      toast.warning("Please select a plan");
      return;
    }

    const plan = plans?.find((p: any) => p.id === Number(selectedPlan));
    if (!plan) {
      toast.error("Invalid plan selected");
      return;
    }

    const payAmount = Number(subPaidAmount || 0);
    if (payAmount < 0) {
      toast.warning("Paid amount cannot be negative");
      return;
    }
    if (payAmount > plan.price) {
      toast.warning(`Cannot pay more than plan price ₹${plan.price}`);
      return;
    }

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (plan.duration || 1));

      const newSub = await strapi.create("subscriptions", {
        user: user.id,
        plan: plan.id,
        startDate,
        endDate,
        currentPlanAmount: plan.price,
        paidAmount: payAmount,
        paid: payAmount >= plan.price,
      });

      if (payAmount > 0) {
        await strapi.create("invoices", {
          user: user.id,
          subscription: newSub.data.id,
          amount: payAmount,
          paymentDate: new Date(),
        });
      }

      setSelectedPlan(null);
      setSubPaidAmount("");
      setShowSubDialog(false);
      mutate();
      toast.success("Subscription added successfully!");
    } catch (err) {
      console.error("Error adding subscription:", err);
      toast.error("Failed to add subscription");
    }
  };
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-purple-500/20 text-purple-400">Admin</Badge>
        );
      case "customer":
        return <Badge className="bg-blue-500/20 text-blue-400">Customer</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  // --------- CHECK IF ALL PAID & EXPIRED ----------
  const canAddNewSubscription = useMemo(() => {
    if (!user.subscriptions || user.subscriptions.length === 0) return true;
    return user.subscriptions.every((sub: any) => {
      const fullyPaid =
        Number(sub.paidAmount || 0) >= Number(sub.currentPlanAmount || 0);
      const expired = sub.expired;

      return fullyPaid && expired;
    });
  }, [user.subscriptions]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-gray-400 animate-pulse">
        Loading user details...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
        <p className="text-gray-400 mb-6">
          The user you're looking for doesn't exist.
        </p>
        <Link href="/dashboard/users">
          <Button variant="outline">Back to Users</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold  leading-tight">
              {user?.firstname + " " + user?.lastname}
            </h1>
            <p className=" text-sm">User Details</p>
          </div>
        </div>
        {/* <Link href={`/dashboard/users/${user.documentId}/edit`}>
          <Button className="bg-neon-green text-black font-semibold hover:opacity-90 transition">
            <Edit className="h-4 w-4 mr-2" />
            Edit User
          </Button>
        </Link> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Card */}
          <Card className="bg-gray-800 border-gray-700 shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="flex items-start gap-6">
              <Avatar className="h-24 w-24 ring-2 ring-gray-700">
                <AvatarImage
                  src={renderImage(user.profile?.url)}
                  alt={user.firstname}
                />
                <AvatarFallback>{user.firstname?.[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex flex-col justify-start items-start">
                <h3 className="text-xl font-semibold text-white">
                  {user.firstname} {user.lastname}
                </h3>
                <div className="space-x-2">
                  {getRoleBadge(user.type)}
                  {user.isGymMember && (
                    <Badge className="bg-green-500/20 text-green-400">
                      Gym Member
                    </Badge>
                  )}
                </div>
                <p className="text-gray-300 flex justify-center items-center gap-1">
                  {" "}
                  <IdCard className="h-5" /> {user.documentId}
                </p>

                <p className="text-gray-300 flex justify-center items-center gap-1">
                  {" "}
                  <MailIcon className="h-5" /> {user.email}
                </p>
                {user.phone && (
                  <p className="text-gray-300 flex justify-center items-center gap-1">
                    {" "}
                    <PhoneIcon className="h-5" /> {user.phone}
                  </p>
                )}
                <p className="text-gray-300 flex justify-center items-center gap-1">
                    JoinedOn :{' '} {formatDate(user.createdAt)}
                  </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions */}
          {user.isGymMember && (
            <Card className="bg-gray-800 border-gray-700 shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">
                  <div className="flex items-center justify-between w-full">
                    <h1>Gym Subscriptions</h1>

                    <Dialog
                      open={showSubDialog}
                      onOpenChange={setShowSubDialog}
                    >
                      <DialogTrigger asChild>
                        <Button disabled={!canAddNewSubscription}>
                          Add New Subscription
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="space-y-4">
                        <DialogHeader>
                          <DialogTitle>Add Subscription</DialogTitle>
                        </DialogHeader>

                        <Select
                          onValueChange={(val) => setSelectedPlan(val)}
                          value={selectedPlan || ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {plans?.map((plan: any) => (
                              <SelectItem key={plan.id} value={String(plan.id)}>
                                {plan.title} - ₹{plan.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          type="number"
                          placeholder="Enter Paid Amount"
                          value={subPaidAmount}
                          onChange={(e) => setSubPaidAmount(e.target.value)}
                        />
                        <p>
                          Pending :{" "}
                          {selectedPlan
                            ? Math.max(
                                0,
                                (plans?.find(
                                  (plan: any) => plan.id == selectedPlan
                                )?.price || 0) - Number(subPaidAmount || 0)
                              )
                            : 0}
                        </p>

                        <Button
                          className="w-full"
                          onClick={handleAddSubscription}
                        >
                          Confirm Subscription
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.subscriptions.length === 0 ? (
                  <p className="text-red-400 font-medium">
                    No Active Subscriptions
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-900/50 text-gray-400">
                          <th className="p-3 text-left">Id</th>
                          <th className="p-3 text-left">Plan</th>
                          <th className="p-3 text-left">Duration</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Payment</th>
                          <th className="p-3 text-left">Invoices</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.subscriptions.map((sub: any, idx: number) => {
                          const planPrice = Number(sub.currentPlanAmount || 0);
                          const paidAmount = Number(sub.paidAmount || 0);
                          const pending = planPrice - paidAmount;

                          return (
                            <tr
                              key={sub.id}
                              className={`border-t border-gray-700 ${
                                idx % 2 === 0 ? "bg-gray-800/40" : ""
                              }`}
                            >
                              <td className="p-3 text-gray-300">{sub.id}</td>
                              <td className="p-3 text-white font-medium">
                                {sub.plan?.title}
                              </td>
                              <td className="p-3 text-gray-300">
                                {formatDate(sub.startDate)} →{" "}
                                {formatDate(sub.endDate)}
                              </td>
                              <td className="p-3">
                                {sub.expired ? (
                                  <Badge className="bg-red-500/20 text-red-400">
                                    Expired
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-500/20 text-green-400">
                                    Active
                                  </Badge>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="text-white font-medium">
                                  ₹{paidAmount} / ₹{planPrice}
                                </div>
                                <div
                                  className={`text-xs mt-1 ${
                                    pending > 0
                                      ? "text-red-400"
                                      : "text-green-400"
                                  }`}
                                >
                                  {pending > 0
                                    ? `Pending: ₹${pending}`
                                    : "Fully Paid"}
                                </div>
                              </td>
                              <td className="p-3">
                                {sub.invoices?.length > 0 ? (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setInvoiceSub(sub)}
                                      >
                                        <FileText className="h-4 w-4 mr-1" />{" "}
                                        View
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="space-y-4 max-w-md">
                                      <DialogHeader>
                                        <DialogTitle>
                                          Invoices - {sub.plan?.title}
                                        </DialogTitle>
                                      </DialogHeader>
                                      {sub.invoices.map((inv: any) => (
                                        <div
                                          key={inv.id}
                                          className="flex justify-between border-b border-gray-700 py-2 text-sm"
                                        >
                                          <span>
                                            {formatDate(
                                              inv.paymentDate
                                            )}
                                          </span>
                                          <span className="font-medium">
                                            ₹{inv.amount}
                                          </span>
                                        </div>
                                      ))}
                                    </DialogContent>
                                  </Dialog>
                                ) : (
                                  <span className="text-gray-500 italic">
                                    No invoices
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                {pending > 0 && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedSub(sub)}
                                      >
                                        <Plus className="h-4 w-4 mr-1" /> Add
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="space-y-4">
                                      <DialogHeader>
                                        <DialogTitle>Add Payment</DialogTitle>
                                      </DialogHeader>
                                      <Input
                                        type="number"
                                        placeholder={`Enter amount (max ₹${pending})`}
                                        value={amount}
                                        onChange={(e) =>
                                          setAmount(e.target.value)
                                        }
                                      />

                                      <Button
                                        className="w-full font-semibold"
                                        onClick={handleAddPayment}
                                      >
                                        Confirm Payment
                                      </Button>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          <Card className="bg-gray-800 border-gray-700 shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* <Link href={`/dashboard/users/${user.documentId}/edit`}>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-gray-600"
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
              </Link> */}
              {/* <Button
                variant="outline"
                className="w-full justify-start hover:bg-gray-600"
              >
                <Mail className="h-4 w-4 mr-2" /> Send Message
              </Button> */}
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-gray-200"
              >
                <Link className="flex justify-center items-center" href={`/dashboard/orders?user=${user.documentId}`}><ShoppingBag className="h-4 w-4 mr-2" /> View Orders </Link>
              </Button> 
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
