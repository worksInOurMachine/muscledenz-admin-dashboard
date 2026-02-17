"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  MapPin,
  CreditCard,
  User,
  Package,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { ordersApi } from "@/lib/api/orders"; // Not used directly in the component body
// import useSWR from "swr"; // Not used directly in the component body
import { useStrapi } from "@/lib/strapiSDK/useStrapi";
// import { calculateDiscount } from "@/lib/calculateDiscount"; // Not used directly in the component body
import { renderImage } from "@/lib/renderImage";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/formatDate";
import { Separator } from "@/components/ui/separator";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data, error, isLoading } = useStrapi("orders", {
    populate: [
      "user",
      "product",
      "user.profile",
      "product.thumbnail",
      "address",
      "document",
    ],
    filters: { documentId: id },
  });

  const order: any = data?.data?.[0] || null;

  if (isLoading) {
    return (
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[300px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16 px-4">
        <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Order Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The order you're looking for doesn't exist or is unavailable.
        </p>
        <Link href="/dashboard/orders">
          <Button
            variant="outline"
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders List
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30 font-medium px-3 py-1 text-xs sm:text-sm">
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30 font-medium px-3 py-1 text-xs sm:text-sm">
            Processing
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30 font-medium px-3 py-1 text-xs sm:text-sm">
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-green-500/10 text-green-600 border border-green-500/30 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30 font-medium px-3 py-1 text-xs sm:text-sm">
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/10 text-red-600 border border-red-500/30 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 font-medium px-3 py-1 text-xs sm:text-sm">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="font-medium px-3 py-1 text-xs sm:text-sm"
          >
            {status}
          </Badge>
        );
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-500/10 text-green-600 border border-green-500/30 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30 font-medium px-3 py-1 text-xs sm:text-sm">
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30 font-medium px-3 py-1 text-xs sm:text-sm">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-600 border border-red-500/30 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 font-medium px-3 py-1 text-xs sm:text-sm">
            Failed
          </Badge>
        );
      case "refunded":
        return (
          <Badge className="bg-gray-500/10 text-gray-600 border border-gray-500/30 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30 font-medium px-3 py-1 text-xs sm:text-sm">
            Refunded
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="font-medium px-3 py-1 text-xs sm:text-sm"
          >
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/orders")}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 p-2 h-auto"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
              Order for {order.user?.firstname}{" "}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        {/* <Link href={`/dashboard/orders/${order.id}/edit`}>
          <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-white transition-colors">
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </Button>
        </Link> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Left/Main Column: Order Items and Customer Info */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6">
          {/* Order Items Card */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />{" "}
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-gray-700/50">
                    <TableRow className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <TableHead className="text-gray-600 dark:text-gray-300 min-w-[200px] sm:min-w-[250px]">
                        Product
                      </TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-300 text-center">
                        Qty
                      </TableHead>
                      {/* MODIFIED: Removed hidden md:table-cell */}
                      <TableHead className="text-gray-600 dark:text-gray-300 text-center">
                        Product Disc.
                      </TableHead>
                      {/* MODIFIED: Removed hidden md:table-cell */}
                      <TableHead className="text-gray-600 dark:text-gray-300 text-center">
                        Coupon Disc.
                      </TableHead>
                      {/* MODIFIED: Removed hidden sm:table-cell */}
                      <TableHead className="text-gray-600 dark:text-gray-300 text-center">
                        Price/Unit
                      </TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-300 text-right">
                        Final Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.product && (
                      <TableRow
                        key={order.id}
                        className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {/* Product details (No change) */}
                        <TableCell className="py-3 sm:py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 sm:h-14 sm:w-14 flex-shrink-0">
                              <img
                                src={renderImage(
                                  order?.product?.thumbnail?.url
                                )}
                                alt={order?.product?.name || "Product"}
                                className="h-full w-full rounded-md object-cover border border-gray-200 dark:border-gray-700"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">
                                {order?.product?.name || "Unnamed Product"}
                              </span>
                              <Link
                                href={`/dashboard/products/${order?.product?.documentId}`}
                                className="text-xs text-blue-500 dark:text-blue-400 hover:underline"
                              >
                                View Product
                              </Link>
                            </div>
                          </div>
                        </TableCell>

                        {/* Quantity (No change) */}
                        <TableCell className="text-gray-700 dark:text-gray-300 text-center font-medium">
                          {order?.quantity}
                        </TableCell>

                        {/* Product Discount - MODIFIED: Removed hidden md:table-cell */}
                        <TableCell className="text-green-600 dark:text-green-400 text-center font-medium">
                          {order?.product?.discount ?? 0}%
                        </TableCell>

                        {/* Coupon Discount - MODIFIED: Removed hidden md:table-cell */}
                        <TableCell className="text-green-600 dark:text-green-400 text-center font-medium">
                          {order?.couponDiscount ?? 0}%
                        </TableCell>

                        {/* Price per item - MODIFIED: Removed hidden sm:table-cell */}
                        <TableCell className="text-gray-500 dark:text-gray-400 text-center">
                          ₹
                          {Number(order?.product?.price ?? 0).toFixed(2) +
                            " x " +
                            order?.quantity +
                            " = "}
                          {order?.quantity * Number(order?.product?.price ?? 0)}
                        </TableCell>

                        {/* Total (Final Amount for the item, which equals order.amount here) - No change */}
                        <TableCell className="text-right font-semibold text-gray-900 dark:text-white text-base">
                          ₹{Number(order?.amount ?? 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information Card */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />{" "}
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Avatar className="h-16 w-16 flex-shrink-0">
                  <AvatarImage
                    src={order.user?.profile?.url || "/placeholder.svg"}
                    alt={order.user?.firstname}
                  />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-medium">
                    {(order.user?.firstname?.[0] || "") +
                      (order.user?.lastname?.[0] || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {order.user?.firstname + " " + order.user?.lastname}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <p>{order.user?.email}</p>
                    <p>{order.address?.phone}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  onClick={() =>
                    router.push(`/dashboard/users/${order.user.documentId}`)
                  }
                >
                  View Profile
                </Button>
              </div>

              <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

              {/* Address and Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-gray-900 dark:text-white flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-red-500" /> Shipping
                    Address
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 ml-6">
                    {order.user?.firstname + " " + order.user?.lastname}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 ml-6">
                    {[
                      order?.address?.streetAddress,
                      order?.address?.locality,
                      order?.address?.city,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    {order?.address?.pincode
                      ? ` - ${order.address.pincode}`
                      : ""}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 ml-6">
                    {order?.address?.state}, {order?.address?.country}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-gray-900 dark:text-white flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-green-500" />{" "}
                    Payment Method
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 ml-6 font-mono">
                    {order?.paymentMethod}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Status and Summary */}
        <div className="lg:col-span-1 xl:col-span-1 space-y-6">
          {/* Order Status Card */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Details & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  Order Status
                </span>
                {getStatusBadge(order.orderStatus)}
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  Payment Status
                </span>
                {getPaymentBadge(order.paymentStatus)}
              </div>

              {order.document && order.document.length > 0 && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700/50">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    Payment Proof
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <img
                        src={renderImage(order.document[0].url)}
                        alt="Payment Proof"
                        className="h-10 w-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-90 transition object-cover"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-white dark:bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                          Payment Proof
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center p-2">
                        <img
                          src={renderImage(order.document[0].url)}
                          alt="Payment Proof"
                          className="max-h-[85vh] w-auto rounded-lg shadow-xl"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {order.trackingNumber && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700/50">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    Tracking No.
                  </span>
                  <span className="text-gray-800 dark:text-white font-mono text-sm">
                    {order.trackingNumber}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  Order Date
                </span>
                <span className="text-gray-800 dark:text-white text-sm">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  Last Updated
                </span>
                <span className="text-gray-800 dark:text-white text-sm">
                  {formatDate(order.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  ₹{order.amount.toFixed(2)}
                </span>
              </div>

              {/* Total Calculation */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Total Payment
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    ₹{order.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Order Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
