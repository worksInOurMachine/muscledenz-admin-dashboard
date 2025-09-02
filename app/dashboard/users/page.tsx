"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Plus, Search, MoreHorizontal, Edit, Trash2, UserCheck, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usersApi, type User } from "@/lib/api/users"
import { useStrapi } from "@/lib/strapiSDK/useStrapi"
import { renderImage } from "@/lib/renderImage"
import { toast } from "sonner"
import { copyToClipboard } from "@/lib/copyToClipboard"
import { strapi } from "@/lib/strapiSDK/strapi"
import { usePagination } from "@/lib/pagination/usePagination"
import { Pagination } from "@/lib/pagination/Pagination"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, settypeFilter] = useState<string>("all")
  const [userFilter, setUserFilter] = useState<string>("all")
  const {page,pageSize,setPage} = usePagination({page:1,pageSize:15})

  const { data, error, isLoading, mutate } = useStrapi('paginated-users',{
    populate:['profile'],
    sort: ['createdAt:desc'],
    pagination:{page,pageSize:pageSize},
    fields:['firstname','lastname','email','phone','isGymMember','type','documentId','createdAt'],
    filters:{
      ...(userFilter === 'gymMembers' && { isGymMember: true }),
      ...(typeFilter !== 'all' && { type: typeFilter }),
      ...(searchTerm && { 
        $or: [
          { firstname: { $containsi: searchTerm } },
          { lastname: { $containsi: searchTerm } },
          { email: { $containsi: searchTerm } },
          { phone: { $containsi: searchTerm } },
          { documentId: { $containsi: searchTerm } },
        ]
      })
    }
  })


const users:any = data?.data || []

useEffect(() => {
  if (searchTerm || typeFilter !== 'all' || userFilter !== 'all'){
      setPage(1)
  }
},[searchTerm,typeFilter,userFilter])

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await strapi.delete("users", userId)
        toast.success("User deleted successfully")
        mutate()
      } catch (error) {
        console.error("Failed to delete user:", error)
      }
    }
  }

  const gettypeBadge = (type: User["role"]) => {
    switch (type) {
      case "admin":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Admin</Badge>
      case "customer":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Customer</Badge>
     
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className=" mt-2">Manage gym members, customers, and administrators</p>
        </div>
        <Link href="/dashboard/users/new">
          <Button className="bg-neon-green hover:bg-neon-green/80 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Select value={typeFilter} onValueChange={settypeFilter}>
          <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
           <SelectItem value="gymMembers">Gym Members</SelectItem>
           
          </SelectContent>
        </Select>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">User</TableHead>
              <TableHead className="text-gray-300">Contact</TableHead>
              <TableHead className="text-gray-300">Is Member{'(Gym)'}</TableHead>
              <TableHead className="text-gray-300">Type</TableHead>
              {/* <TableHead className="text-gray-300">Orders</TableHead> */}
              <TableHead className="text-gray-300">Created At</TableHead>
              <TableHead className="text-gray-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-gray-700">
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-pulse text-gray-400">Loading users...</div>
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow className="border-gray-700">
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user:any) => (
                <TableRow key={user?.documentId} className="border-gray-700 hover:bg-gray-700/50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={renderImage(user?.profile?.url) || "/placeholder.svg"} alt={user?.firstname} />
                        <AvatarFallback className="bg-gray-700 text-white">
                        {
                          user?.firstname
                        }
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white">{user?.firstname+ ' ' + user?.lastname}</div>
                        <div onClick={() => {
                            copyToClipboard(user.documentId, "User ID ")
                        }} className="text-sm cursor-pointer text-gray-400"> Id : {user.documentId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div>
                      <div className="cursor-pointer" onClick={() => copyToClipboard(user?.phone,'Phone number')}>Phone : {user.phone || "N/A"}</div>
                     <div className="cursor-pointer" onClick={() => copyToClipboard(user?.email,'Email')}> Email : {user.email}</div>

                    </div>
                  </TableCell>
                  <TableCell>{user?.isGymMember ? <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Yes</Badge> : <Badge className="bg-red-500/20 text-red-400 border-red-500/30">No</Badge>}</TableCell>
                  <TableCell>{gettypeBadge(user.type)}</TableCell>
                  {/* <TableCell>{getStatusBadge(user.status)}</TableCell> */}
                  {/* <TableCell className="text-gray-300">{user.membershipType || "N/A"}</TableCell> */}
                  {/* <TableCell className="text-gray-300">{user.totalOrders || 0}</TableCell> */}
                  <TableCell className="text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                        <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/users/${user.documentId}`} className="text-gray-300 hover:text-white">
                            <Edit className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/users/${user.documentId}/edit`} className="text-gray-300 hover:text-white">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        {/* {user.status === "active" ? (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user.id, "suspended")}
                            className="text-yellow-400 hover:text-yellow-300"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user.id, "active")}
                            className="text-green-400 hover:text-green-300"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Activate User
                          </DropdownMenuItem>
                        )} */}
                        {/* <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.documentId)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
          <Pagination page={page} setPage={setPage} meta={data?.meta.pagination}/>

    </div>
  )
}
