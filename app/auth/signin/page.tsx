"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Dumbbell } from "lucide-react"
import { strapi } from "@/lib/strapiSDK/strapi"
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
  import { signIn } from "next-auth/react"
import { toast } from "sonner"
export default function SignIn() {
  const [identifier, setidentifier] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"identifier" | "otp">("identifier")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    

    try {


      const getUserType = await strapi.axios.get(`/users?filters[identifier][$eq]=${identifier}`)
      const user = getUserType.data[0] || null 

      if (!user){
        setError(`No User Found With ${identifier}`)
        return
      }

      if (user && user.type !== 'admin'){
        setError("Only Admin's Can Login!")
        return
      }


      const res = await strapi.axios.post("/otp/send", { identifier })
      if (res.data.success) {
        setStep("otp")
      } else {
        setError("Failed to send OTP")
      }
      toast.success("OTP sent successfully")
    } catch (err:any) {
      setError("Error sending OTP")
      console.log('error',err?.response?.data?.error?.message || 'something went wrong!')
      toast.error(err?.response?.data?.error?.message || 'something went wrong!')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
     
      const signInRes = await signIn("credentials", {
        redirect: false,
        identifier,
        otp,
      })
      
      console.log("Sign in response:", signInRes)

      if (signInRes?.error) {
        setError(signInRes?.error)
        toast.error(signInRes?.error || 'something went wrong!')
        console.log("Sign in error:", signInRes.error)
        return
      }

      toast.success("Welcome To Dashboard!")
      router.refresh()
    } catch (err) {
      setError("Error verifying OTP")
      toast.error('Something Went Wrong Try Again!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Dumbbell className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">MuscleDenz</CardTitle>
           <DotLottieReact
      src="/Login.lottie"
      loop
      autoplay
    />
          <CardDescription>
            {step === "identifier" ? "Sign in with your identifier number" : "Enter the OTP sent to your identifier"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "identifier" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Enter Your Email</Label>
                <Input
                  id="identifier"
                  type="tel"
                  value={identifier}
                  onChange={(e) => setidentifier(e.target.value)}
                  placeholder="example@mail.com"
                  required
                />
              </div>
              {error && <div className="text-destructive text-sm">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  required
                />
              </div>
              {error && <div className="text-destructive text-sm">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
