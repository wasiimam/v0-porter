"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    general?: string
  }>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { signIn } = useAuth()

  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  const validateForm = () => {
    const newErrors: {
      email?: string
      password?: string
    } = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      await signIn({
        email: formData.email,
        password: formData.password,
      })

      toast({
        title: "Login successful",
        description: "Welcome back to DoorStep!",
        variant: "success",
      })

      router.push(callbackUrl)
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle specific Supabase errors
      if (error.message?.includes("Invalid login credentials")) {
        setErrors({
          general: "Invalid email or password. Please try again.",
        })
      } else if (error.message?.includes("Email not confirmed")) {
        setErrors({
          general: "Please verify your email address before logging in.",
        })
      } else {
        setErrors({
          general: "An error occurred during login. Please try again.",
        })
      }

      toast({
        title: "Authentication error",
        description: errors.general || "Failed to log in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col p-8 md:p-12 lg:p-16">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="flex items-center mb-8">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-blue-600 mr-3">
            <Image
              src="/images/logo.png"
              alt="DoorStep Logo"
              width={40}
              height={40}
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "https://placehold.co/40x40/blue/white?text=DS"
              }}
            />
          </div>
          <h1 className="text-2xl font-bold">DoorStep</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-gray-600">Please enter your details to sign in</p>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={cn("pl-10", errors.email ? "border-red-500 focus-visible:ring-red-500" : "")}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-sm text-red-500 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={cn("pl-10 pr-10", errors.password ? "border-red-500 focus-visible:ring-red-500" : "")}
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-sm text-red-500 mt-1">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center">
            <Checkbox id="remember-me" checked={formData.rememberMe} onCheckedChange={handleCheckboxChange} />
            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
              Remember me for 30 days
            </label>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign up
            </Link>
          </div>
        </form>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:block md:w-1/2 bg-blue-600 relative">
        <Image
          src="/images/login-bg.jpg"
          alt="Delivery service"
          fill
          className="object-cover"
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "https://placehold.co/1200x800/blue/white?text=Delivery+Service"
          }}
        />
        <div className="absolute inset-0 bg-blue-900/40 flex flex-col justify-center p-12">
          <div className="max-w-md text-white">
            <h2 className="text-3xl font-bold mb-4">Fast, Reliable Delivery Services</h2>
            <p className="mb-6">
              Join thousands of customers who trust DoorStep for their delivery needs. Experience the difference with
              our professional service.
            </p>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-400 fill-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 15.585l-5.196 2.733 1-5.83-4.196-4.088 5.798-.844L10 2.326l2.594 5.23 5.798.844-4.196 4.088 1 5.83L10 15.585z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>
            <p className="mt-2 text-white/90">Rated 4.9/5 by our customers</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
