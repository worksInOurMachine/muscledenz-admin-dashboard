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

  // Subscriptions query
  const { data: subscriptionData, isLoading } = useStrapi("subscriptions", {
    populate: ["plan", "user", "invoices"],
    filters,
    pagination: {
      page,
      pageSize: pageSize, 
    },
  });

  // Plans query
  const { data: planData, isLoading: plansLoading } = useStrapi("gym-plans", {
    fields: ["title", "id"],
    pagination: { page: 1, pageSize: 99999 },
  });

  const subscriptions = subscriptionData?.data || [];
  const plans = planData?.data || [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Subscriptions</h1>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search by name, email, phone or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />

        <Select onValueChange={setPlanFilter} value={planFilter}>
          <SelectTrigger className="w-48">
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
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={"all"}>All Statuses</SelectItem>
            <SelectItem value={"active"}>Active</SelectItem>
            <SelectItem value={"expired"}>Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead>Id</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expired</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub: any) => {
                const planPrice = Number(sub.currentPlanAmount || 0);
                const paid = Number(sub.paidAmount || 0);
                const pending = Math.max(0, planPrice - paid);

                return (
                  <TableRow key={sub.id}>
                     <TableCell className="text-xs">{sub.documentId}</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        onClick={() => setSelectedUser(sub.user)}
                      >
                        {sub.user?.firstname} {sub.user?.lastname}
                      </Button>
                    </TableCell>
                    <TableCell>{sub.plan?.title}</TableCell>
                    <TableCell>{formatDate(sub.startDate)}</TableCell>
                    <TableCell>{formatDate(sub.endDate)}</TableCell>
                    <TableCell>₹{paid}</TableCell>
                    <TableCell>₹{pending}</TableCell>
                    <TableCell>
                      {sub.paid ? (
                        <span className="text-green-600 font-medium">Paid</span>
                      ) : (
                        <span className="text-yellow-600 font-medium">
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sub.expired ? (
                        <span className="text-red-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-green-600 font-medium">No</span>
                      )}
                    </TableCell>
                    <TableCell>
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

          <Pagination
            meta={subscriptionData?.meta?.pagination}
            page={page}
            setPage={setPage}
          />
        </>
      )}

      {/* User Info Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Info</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <Card>
              <CardContent className="space-y-3 pt-4">
                 <p>
                  <span className="font-semibold">Id:</span>{" "}
                  {selectedUser.documentId} 
                </p>
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {selectedUser.firstname} {selectedUser.lastname}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {selectedUser.email}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {selectedUser.phone || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Gender:</span>{" "}
                  {selectedUser.gender || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Birthdate:</span>{" "}
                  {selectedUser.birthdate || "N/A"}
                </p>
                <p>
                  <Link className="text-blue-500 mt-2 px-4 font-semibold py-2 bg-gray-200 rounded-3xl hover:text-red-500" href={`/dashboard/users/${selectedUser.documentId}`}>Visit Profile</Link>
                </p>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoices Dialog */}
      <Dialog
        open={selectedInvoices.length > 0}
        onOpenChange={() => setSelectedInvoices([])}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invoices</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedInvoices.map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell>{formatDate(inv.paymentDate)}</TableCell>
                  <TableCell>₹{inv.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Page;
