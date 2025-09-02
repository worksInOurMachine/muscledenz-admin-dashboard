"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Package,
  Truck,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ordersApi, type Order } from "@/lib/api/orders";
import { useStrapi } from "@/lib/strapiSDK/useStrapi";
import { strapi } from "@/lib/strapiSDK/strapi";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { usePagination } from "@/lib/pagination/usePagination";
import { Pagination } from "@/lib/pagination/Pagination";

export default function OrdersPage() {
  const params = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(params?.get("user") || "");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const {page,pageSize,setPage} = usePagination()


  useEffect(() => {
    if (searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'){
        setPage(1)
        console.log('hii')
    }
  },[searchTerm,statusFilter,paymentFilter])


  const { data, error, isLoading, mutate } = useStrapi("orders", {
    populate: ["user", "product", "user.profile"],
    sort: ["createdAt:desc"],
    filters: {
      paymentStatus: paymentFilter !== "all" ? paymentFilter : undefined,
      orderStatus: statusFilter !== "all" ? statusFilter : undefined,
      ...(searchTerm && {
        $or: [
          { user: { firstname: { $containsi: searchTerm } } },
          { user: { lastname: { $containsi: searchTerm } } },
          { user: { email: { $containsi: searchTerm } } },
          { user: { phone: { $containsi: searchTerm } } },
          { user: { documentId: { $containsi: searchTerm } } },
          { documentId: { $containsi: searchTerm } },
        ],
      }),
    },
    pagination:{
      page:page,
      pageSize:pageSize
    }
  });

  const orders: any = data?.data || [];


  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      await strapi.update("orders", orderId, { orderStatus: newStatus });
      mutate();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handlePaymentChange = async (
    orderId: string,
    newStatus: Order["paymentStatus"]
  ) => {
    if (newStatus === "paid") {
      setSelectedOrderId(orderId);
      setShowPaymentModal(true);
      return;
    }

    try {
      await strapi.update("orders", orderId, { paymentStatus: newStatus });
      mutate();
      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status!");
    }
  };

  const submitProof = async () => {
    try {
      let proofDoc: string | undefined;

      const imageUploading = toast.loading("Uploading proof...");

      if (proofFile) {
        const formData = new FormData();
        formData.append("files", proofFile);

        const uploadRes = await strapi.axios.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        proofDoc = uploadRes.data?.[0]?.id;
      }

      toast.dismiss(imageUploading);

      await strapi.update("orders", selectedOrderId!, {
        paymentStatus: "paid",
        document: proofDoc,
      });

      setShowPaymentModal(false);
      setProofFile(null);
      setSelectedOrderId(null);
      mutate();
      toast.success("Payment status updated to paid");
    } catch (error) {
      console.error("Failed to upload proof or update payment:", error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await strapi.delete("orders", orderId);
        mutate();
        toast.success("Order deleted successfully");
      } catch (error) {
        console.error("Failed to delete order:", error);
      }
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
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

  const getPaymentBadge = (status: Order["paymentStatus"]) => {
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

  if (error) return <div className="text-red-400">Failed to load orders</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className=" mt-2">Track and manage customer orders</p>
        </div>
        {/* <Link href="/dashboard/orders/new">
          <Button className="bg-neon-green hover:bg-neon-green/80 text-black">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link> */}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search orders by name, email, phone or OrderId"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Filter by payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Order</TableHead>
              <TableHead className="text-gray-300">Customer</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Payment</TableHead>
              <TableHead className="text-gray-300">Total</TableHead>
              <TableHead className="text-gray-300">Date</TableHead>
              <TableHead className="text-gray-300 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-gray-700">
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-pulse text-gray-400">
                      Loading orders...
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow className="border-gray-700">
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-400"
                >
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: any) => (
                <TableRow
                  key={order.documentId}
                  className="border-gray-700 hover:bg-gray-700/50"
                >
                  <TableCell>
                    <div className="font-medium text-white">
                      {order.documentId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={order.user?.profile?.url || "/placeholder.svg"}
                          alt={order.user.name}
                        />
                        <AvatarFallback className="bg-gray-700 text-white text-xs">
                          {order.user.name}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white text-sm">
                          {order.user.firstname + " " + order.user.lastname}
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.user.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.user.phone}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                  <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                  <TableCell className="text-white font-medium">
                    ₹{order.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-gray-800 border-gray-700"
                      >
                        <DropdownMenuLabel className="text-gray-300">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/orders/${order.documentId}`}
                            className="text-gray-300 hover:text-white"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/orders/${order.documentId}/edit`}
                            className="text-gray-300 hover:text-white"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Order
                          </Link>
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator className="bg-gray-700" />
                        {/* Status actions */}
                        {order.orderStatus === "pending" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(order.documentId, "processing")
                            }
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Mark Processing
                          </DropdownMenuItem>
                        )}
                        {order.orderStatus === "processing" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(order.documentId, "shipped")
                            }
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Mark Shipped
                          </DropdownMenuItem>
                        )}
                        {order.orderStatus === "shipped" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(order.documentId, "delivered")
                            }
                            className="text-green-400 hover:text-green-300"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Mark Delivered
                          </DropdownMenuItem>
                        )}
                        {/* Payment actions */}
                        <DropdownMenuItem
                          onClick={() =>
                            handlePaymentChange(order.documentId, "paid")
                          }
                          className="text-green-400 hover:text-green-300"
                        >
                          <IndianRupee className="h-4 w-4 mr-2" />
                          Mark Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handlePaymentChange(order.documentId, "failed")
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          <IndianRupee className="h-4 w-4 mr-2" />
                          Mark Failed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handlePaymentChange(order.documentId, "refunded")
                          }
                          className="text-gray-400 hover:text-gray-300"
                        >
                          <IndianRupee className="h-4 w-4 mr-2" />
                          Mark Refunded
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem
                          onClick={() => handleDeleteOrder(order.documentId)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
          <Pagination page={page} setPage={setPage} meta={data?.meta?.pagination}/>


      {/* Payment Proof Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Upload Payment Proof</DialogTitle>
            <DialogDescription className="text-gray-400">
              This step is optional. You can attach a file to confirm the
              payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="proof">Proof of Payment (optional)</Label>
            <Input
              id="proof"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submitProof}
              className="bg-green-600 hover:bg-green-500"
            >
              Confirm Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
