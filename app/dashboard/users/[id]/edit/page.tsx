"use client"

import type React from "react"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Save, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usersApi, type User } from "@/lib/api/users"

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { data: user, error, mutate } = useSWR(`user-${id}`, () => usersApi.getUserById(id))

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || ("member" as User["role"]),
    phone: user?.phone || "",
    status: user?.status || ("active" as User["status"]),
    membershipType: user?.membershipType || "",
    avatar: user?.avatar || "",
  })

  // Update form data when user data loads
  useState(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        status: user.status,
        membershipType: user.membershipType || "",
        avatar: user.avatar || "",
      })
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await usersApi.updateUser(id, formData)
      mutate()
      router.push(`/dashboard/users/${id}`)
    } catch (error) {
      console.error("Failed to update user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
        <p className="text-gray-400 mb-4">The user you're trying to edit doesn't exist.</p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-gray-600 text-gray-300 hover:text-white"
        >
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit User</h1>
          <p className="text-gray-400 mt-2">Update user information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-300">
                      Role *
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: User["role"]) => handleInputChange("role", value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-gray-300">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: User["status"]) => handleInputChange("status", value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.role === "member" && (
                  <div className="space-y-2">
                    <Label htmlFor="membershipType" className="text-gray-300">
                      Membership Type
                    </Label>
                    <Select
                      value={formData.membershipType}
                      onValueChange={(value) => handleInputChange("membershipType", value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select membership type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar || "/placeholder.svg"}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <Input
                    type="url"
                    placeholder="Avatar URL"
                    value={formData.avatar}
                    onChange={(e) => handleInputChange("avatar", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-neon-green hover:bg-neon-green/80 text-black"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Updating..." : "Update User"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full border-gray-600 text-gray-300 hover:text-white"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
