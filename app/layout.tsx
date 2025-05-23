import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import Chatbot from "@/components/chatbot"
import { initializeApp } from "@/lib/actions"

// Initialize app (try-catch to handle potential errors)
try {
  initializeApp()
} catch (error) {
  console.error("Error initializing app:", error)
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DoorStep - Fast & Reliable Delivery Services",
  description: "DoorStep provides fast and reliable delivery services across multiple cities in India.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
          <Chatbot />
        </AuthProvider>
      </body>
    </html>
  )
}
