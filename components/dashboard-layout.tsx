"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Home, Package, Truck, Settings, LogOut, Menu, X, CreditCard, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Deliveries", href: "/dashboard/deliveries", icon: Package },
    { name: "Track Package", href: "/dashboard/track", icon: Truck },
    { name: "Payment Methods", href: "/dashboard/payments", icon: CreditCard },
    { name: "Account Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white shadow-sm">
        <div className="flex items-center">
          <button type="button" className="text-gray-500 hover:text-gray-600" onClick={() => setIsSidebarOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="ml-4 flex items-center">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-blue-600">
              <Image src="/images/logo.png" alt="DoorStep Logo" width={32} height={32} className="object-contain" />
            </div>
            <span className="ml-2 text-lg font-semibold text-blue-600">DoorStep</span>
          </div>
        </div>
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
          Back to Home
        </Link>
      </div>

      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", isSidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)} />

        <div className="fixed inset-y-0 left-0 flex max-w-xs w-full flex-col bg-white shadow-xl">
          <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center">
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-blue-600">
                  <Image src="/images/logo.png" alt="DoorStep Logo" width={32} height={32} className="object-contain" />
                </div>
                <span className="ml-2 text-lg font-semibold text-blue-600">DoorStep</span>
              </div>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-600"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-8 px-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                      isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                    )}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500",
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-200">
                {user?.image ? (
                  <Image src={user.image || "/placeholder.svg"} alt={user.name || ""} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name || user?.email}</p>
                <button
                  onClick={() => signOut()}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <LogOut className="mr-1 h-3 w-3" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex items-center justify-center">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-blue-600">
                <Image src="/images/logo.png" alt="DoorStep Logo" width={40} height={40} className="object-contain" />
              </div>
              <span className="ml-2 text-xl font-bold text-blue-600">DoorStep</span>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                      isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500",
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-200">
                {user?.image ? (
                  <Image src={user.image || "/placeholder.svg"} alt={user.name || ""} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 truncate max-w-[140px]">{user?.name || user?.email}</p>
                <button
                  onClick={() => signOut()}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <LogOut className="mr-1 h-3 w-3" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col">
        <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
