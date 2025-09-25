"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { strapi } from "@/lib/strapiSDK/strapi";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function SignIn() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Check if user exists and is an admin
      const getUserType = await strapi.axios.get(
        // NOTE: In strapi, the user's login identifier is typically 'username', 'email', or 'phone'.
        // Assuming 'identifier' maps to a field like 'email' or a custom unique ID in your user model.
        // The original code used a custom filter `/users?filters[identifier][$eq]=...` which might not be standard.
        // Using `email` as a proxy for the login identifier here for clarity, though keeping original variable names.
        `/users?filters[email][$eq]=${identifier}`
      );
      const user = getUserType.data[0] || null;

      if (!user) {
        setError(`No User Found With This Identifier`);
        return;
      }

      if (user.type !== "admin") {
        setError("Only Admin users can log in to the dashboard.");
        return;
      }

      // 2. Send OTP
      const res = await strapi.axios.post("/otp/send", { identifier });

      if (res.data.success) {
        setStep("otp");
        toast.success("OTP sent successfully! Check your email or phone.");
      } else {
        // This handles successful API call but a logical failure (e.g., OTP service error)
        setError(res.data.message || "Failed to send OTP. Please try again.");
        toast.error(res.data.message || "Failed to send OTP.");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error?.message ||
        "An unexpected error occurred while sending OTP.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const signInRes = await signIn("credentials", {
        redirect: false,
        identifier,
        otp,
      });

      if (signInRes?.error) {
        setError(signInRes.error);
        toast.error(signInRes.error);
        setOtp(""); // Clear OTP input on failure for security/retry ease
        return;
      }

      toast.success("Welcome to the Dashboard! Redirecting...");
      router.push("/dashboard"); // Redirect to dashboard on successful sign in
      router.refresh();
    } catch (err) {
      setError("Error verifying OTP. Please try again.");
      toast.error("An unexpected error occurred during sign-in.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToIdentifier = () => {
    setOtp("");
    setError("");
    setStep("identifier");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg transition-all duration-300">
        <CardHeader className="text-center p-6">
          <div className="flex justify-center mb-4">
            <Dumbbell className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
            {step === "identifier"
              ? "Sign in using your administrator email/identifier."
              : `Enter the OTP sent to ${identifier}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="h-32 w-full mb-6">
            <DotLottieReact src="/Login.lottie" loop autoplay />
          </div>
          {step === "identifier" ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="identifier">Administrator Email / ID</Label>
                <Input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@muscledenz.com"
                  required
                  className="h-10"
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-10"
                disabled={loading || identifier.trim() === ""}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password (OTP)</Label>
                <Input
                  id="otp"
                  type="text" // Changed to text to handle standard OTP inputs (could be letters/numbers)
                  pattern="\d*" // Suggests numeric keyboard on mobile
                  maxLength={6} // Assuming a 6-digit OTP
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  } // Restrict to 6 digits, numbers only
                  placeholder="••••••"
                  required
                  autoFocus
                  className="h-10 text-center text-lg tracking-[0.5em]"
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-10"
                disabled={loading || otp.length < 6}
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={handleBackToIdentifier}
                className="w-full text-sm text-primary/80 hover:text-primary"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Try a different ID
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
