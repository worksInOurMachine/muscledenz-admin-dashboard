"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useStrapi } from "@/lib/strapiSDK/useStrapi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { usePagination } from "@/lib/pagination/usePagination";
import { Pagination } from "@/lib/pagination/Pagination";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import { User, FileText, Calendar, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

function Page() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<any[]>([]);
  const { page, pageSize, setPage } = usePagination();

  useEffect(() => {
    setPage(1);
  }, [search, planFilter, statusFilter]);

  const filters = useMemo(() => {
    const f: any = {};

    if (search) {
      f.$or = [
        { user: { firstname: { $containsi: search } } },
        { user: { lastname: { $containsi: search } } },
        { user: { email: { $containsi: search } } },
        { user: { phone: { $containsi: search } } },
        { documentId: { $eq: search } },
      ];
    }

    if (planFilter && planFilter !== "all") {
      f.plan = { id: { $eq: planFilter } };
    }

    if (statusFilter && statusFilter !== "all") {
      f.expired = statusFilter === "expired";
    }

    return f;
  }, [search, planFilter, statusFilter]);

  const { data: subscriptionData, isLoading } = useStrapi("subscriptions", {
    populate: ["plan", "user", "invoices"],
    filters,
    pagination: {
      page,
      pageSize: pageSize,
    },
  });

  const { data: planData, isLoading: plansLoading } = useStrapi("gym-plans", {
    fields: ["title", "id"],
    pagination: { page: 1, pageSize: 99999 },
  });

  const subscriptions = subscriptionData?.data || [];
  const plans = planData?.data || [];

  return (
    <div className="space-y-6 w-full p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <Input
            placeholder="Search by name, email, phone or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow min-w-[200px] sm:w-64"
          />
          <Select onValueChange={setPlanFilter} value={planFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"all"}>All Plans</SelectItem>
              {!plansLoading &&
                plans.map((plan: any) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setStatusFilter} value={statusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"all"}>All Statuses</SelectItem>
              <SelectItem value={"active"}>Active</SelectItem>
              <SelectItem value={"expired"}>Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p className="flex justify-center items-center h-48 text-lg text-muted-foreground">
          Loading...
        </p>
      ) : (
        <>
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] sm:w-auto">Id</TableHead>
                  <TableHead className="min-w-[150px]">User</TableHead>
                  <TableHead className="min-w-[120px]">Plan</TableHead>
                  <TableHead className="min-w-[100px] hidden md:table-cell">
                    Start
                  </TableHead>
                  <TableHead className="min-w-[100px] hidden md:table-cell">
                    End
                  </TableHead>
                  <TableHead className="min-w-[80px]">Paid</TableHead>
                  <TableHead className="min-w-[80px] hidden sm:table-cell">
                    Pending
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    Payment Status
                  </TableHead>
                  <TableHead className="min-w-[100px] hidden sm:table-cell">
                    Expired
                  </TableHead>
                  <TableHead className="text-right w-[120px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub: any) => {
                  const planPrice = Number(sub.currentPlanAmount || 0);
                  const paid = Number(sub.paidAmount || 0);
                  const pending = Math.max(0, planPrice - paid);

                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="text-xs">
                        {sub.documentId}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          onClick={() => setSelectedUser(sub.user)}
                          className="p-0 h-auto"
                        >
                          {sub.user?.firstname} {sub.user?.lastname}
                        </Button>
                      </TableCell>
                      <TableCell>{sub.plan?.title}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(sub.startDate)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(sub.endDate)}
                      </TableCell>
                      <TableCell>₹{paid}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        ₹{pending}
                      </TableCell>
                      <TableCell>
                        {sub.paid ? (
                          <span className="text-green-600 font-medium">
                            Paid
                          </span>
                        ) : (
                          <span className="text-yellow-600 font-medium">
                            Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {sub.expired ? (
                          <span className="text-red-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-green-600 font-medium">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setSelectedInvoices(sub.invoices || [])
                          }
                        >
                          View Invoices
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          <Pagination
            meta={subscriptionData?.meta?.pagination}
            page={page}
            setPage={setPage}
          />
        </>
      )}

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-sm sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle>User Info</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-3">
                <User className="text-muted-foreground" />
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {selectedUser.firstname} {selectedUser.lastname}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="text-muted-foreground" />
                <p>
                  <span className="font-semibold">Id:</span>{" "}
                  <span className="text-xs">{selectedUser.documentId}</span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {selectedUser.email}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {selectedUser.phone || "N/A"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <p>
                  <span className="font-semibold">Gender:</span>{" "}
                  {selectedUser.gender || "N/A"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="text-muted-foreground" />
                <p>
                  <span className="font-semibold">Birthdate:</span>{" "}
                  {selectedUser.birthdate || "N/A"}
                </p>
              </div>
              <Link href={`/dashboard/users/${selectedUser.documentId}`}>
                <Button className="w-full mt-4">Visit Profile</Button>
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedInvoices.length > 0}
        onOpenChange={() => setSelectedInvoices([])}
      >
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle>Invoices</DialogTitle>
          </DialogHeader>
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  {/* <TableHead>Status</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedInvoices.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell>{formatDate(inv.paymentDate)}</TableCell>
                    <TableCell>₹{inv.amount}</TableCell>
                    {/* <TableCell>
                      {inv.paid ? (
                        <span className="text-green-600">Paid</span>
                      ) : (
                        <span className="text-red-600">Unpaid</span>
                      )}
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Page;
