"use client";

import { use } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, Edit, MapPin, CreditCard } from "lucide-react";
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
import { ordersApi } from "@/lib/api/orders";
import { useStrapi } from "@/lib/strapiSDK/useStrapi";
import { calculateDiscount } from "@/lib/calculateDiscount";
import { renderImage } from "@/lib/renderImage";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/formatDate";

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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-20 bg-gray-700 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-48 bg-gray-800 rounded-lg animate-pulse" />
          </div>
          <div className="h-96 bg-gray-800 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
        <p className="text-gray-400 mb-4">
          The order you're looking for doesn't exist.
        </p>
        <Link href="/dashboard/orders">
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
          >
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Processing
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            Failed
          </Badge>
        );
      case "refunded":
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {order.orderNumber}
            </h1>
            <p className="text-gray-400 mt-2">Order Details</p>
          </div>
        </div>
        <Link href={`/dashboard/orders/₹{order.id}/edit`}>
          <Button className="bg-neon-green hover:bg-neon-green/80 text-black">
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Product</TableHead>
                    <TableHead className="text-gray-300">Quantity</TableHead>
                    <TableHead className="text-gray-300">discount</TableHead>
                    <TableHead className="text-gray-300">Price</TableHead>
                    <TableHead className="text-gray-300">Final Price</TableHead>

                    <TableHead className="text-gray-300 text-right">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.product && (
                    <TableRow
                      key={order.id}
                      className="hover:bg-gray-800/50 transition-colors"
                    >
                      {/* Product details */}
                      <TableCell className="min-w-[250px]">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 flex-shrink-0">
                            <img
                              src={renderImage(order?.product?.thumbnail?.url)}
                              alt={order?.product?.name || "Product"}
                              className="h-14 w-14 rounded-xl object-cover shadow-md border border-gray-700"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-white truncate text-sm md:text-base">
                              {order?.product?.name || "Unnamed Product"}
                            </span>
                            <Link
                              href={`/dashboard/products/${order?.product?.documentId}`}
                              className="text-xs text-blue-400 hover:underline"
                            >
                              View details
                            </Link>
                          </div>
                        </div>
                      </TableCell>

                      {/* Quantity */}
                      <TableCell className="text-gray-300 text-center font-medium">
                        {order?.quantity}
                      </TableCell>

                      {/* Discount */}
                      <TableCell className="text-green-400 text-center font-medium">
                        {order?.product?.discount ?? 0}%
                      </TableCell>

                      {/* Price per item */}
                      <TableCell className="text-gray-300 text-center">
                        ₹{Number(order?.product?.price ?? 0).toFixed(2)}
                        <span className="text-xs text-gray-500"> /unit</span>
                      </TableCell>

                      {/* Discounted Price */}
                      <TableCell className="text-gray-300 text-center">
                        ₹
                        {(
                          (order?.quantity ?? 0) *
                          calculateDiscount(
                            order?.product?.price ?? 0,
                            order?.product?.discount ?? 0
                          )
                        ).toFixed(2)}
                      </TableCell>

                      {/* Total */}
                      <TableCell className="text-right font-semibold text-white">
                        ₹{Number(order?.amount ?? 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={order.user?.profile?.url || "/placeholder.svg"}
                    alt={order.user?.firstname}
                  />
                  <AvatarFallback className="bg-gray-700 text-white">
                    {order.user?.firstname + " " + order.user?.lastname}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {order.user.firstname + " " + order.user.lastname}
                    </h3>
                    <p className="text-gray-400">{order.user?.email}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {order?.address?.city},{order.address?.pincode},
                        {order?.address?.state},{order?.address?.country}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <CreditCard className="h-4 w-4" />
                      <span>{order?.paymentMethod}</span>
                    </div>
                    <Button onClick={() => router.push(`/dashboard/users/${order.user.documentId}`)}>View Customer Profile</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Order Status</span>
                {getStatusBadge(order.orderStatus)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Payment Status</span>
                {getPaymentBadge(order.paymentStatus)}
              </div>
              {order.document && order.document.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Payment Proof</span>

                  <Dialog>
                    <DialogTrigger asChild>
                      <img
                        src={renderImage(order.document[0].url)}
                        alt="Payment Proof"
                        className="h-12 w-12 rounded-lg border border-gray-700 cursor-pointer hover:opacity-80 transition"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">
                          Payment Proof
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center">
                        <img
                          src={renderImage(order.document[0].url)}
                          alt="Payment Proof"
                          className="max-h-[80vh] rounded-lg shadow-lg"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {order.trackingNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tracking</span>
                  <span className="text-white font-mono text-sm">
                    {order.trackingNumber}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Order Date</span>
                <span className="text-white">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last Updated</span>
                <span className="text-white">
                  {formatDate(order.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-gray-400">₹{order.amount.toFixed(2)}</span>
              </div>
              {/* <div className="flex justify-between items-center">
                <span className="text-gray-400">Tax</span>
                <span className="text-white">₹{order.tax.toFixed(2)}</span>
              </div> */}
              {/* <div className="flex justify-between items-center">
                <span className="text-gray-400">Shipping</span>
                <span className="text-white">₹{order.shipping.toFixed(2)}</span>
              </div> */}
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">
                    Total
                  </span>
                  <span className="text-lg font-semibold text-white">
                    ₹{order.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
