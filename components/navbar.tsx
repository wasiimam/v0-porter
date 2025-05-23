"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const isHomePage = pathname === "/"

  // Function to handle smooth scrolling for anchor links
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only apply smooth scrolling on the home page
    if (isHomePage && href.startsWith("#")) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
        // Close mobile menu after clicking
        setIsOpen(false)
      }
    }
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled || !isHomePage
          ? "bg-white/95 backdrop-blur-sm shadow-md text-gray-900"
          : "bg-transparent text-white",
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <Image src="/images/logo.png" alt="DoorStep Logo" width={40} height={40} className="object-contain" />
            </div>
            <span className={cn("text-xl font-bold", isScrolled || !isHomePage ? "text-blue-600" : "text-white")}>
              DoorStep
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-6">
            {isHomePage ? (
              <>
                <NavLink href="#services" isScrolled={isScrolled} onClick={(e) => handleAnchorClick(e, "#services")}>
                  Services
                </NavLink>
                <NavLink href="#about" isScrolled={isScrolled} onClick={(e) => handleAnchorClick(e, "#about")}>
                  About Us
                </NavLink>
                <NavLink
                  href="#testimonials"
                  isScrolled={isScrolled}
                  onClick={(e) => handleAnchorClick(e, "#testimonials")}
                >
                  Testimonials
                </NavLink>
                <NavLink href="#gallery" isScrolled={isScrolled} onClick={(e) => handleAnchorClick(e, "#gallery")}>
                  Gallery
                </NavLink>
                <NavLink href="#contact" isScrolled={isScrolled} onClick={(e) => handleAnchorClick(e, "#contact")}>
                  Contact
                </NavLink>
              </>
            ) : (
              <>
                <Link
                  href="/#services"
                  className={cn("text-sm font-medium transition-colors hover:text-blue-400", "text-gray-700")}
                >
                  Services
                </Link>
                <Link
                  href="/#about"
                  className={cn("text-sm font-medium transition-colors hover:text-blue-400", "text-gray-700")}
                >
                  About Us
                </Link>
                <Link
                  href="/#testimonials"
                  className={cn("text-sm font-medium transition-colors hover:text-blue-400", "text-gray-700")}
                >
                  Testimonials
                </Link>
                <Link
                  href="/#gallery"
                  className={cn("text-sm font-medium transition-colors hover:text-blue-400", "text-gray-700")}
                >
                  Gallery
                </Link>
                <Link
                  href="/#contact"
                  className={cn("text-sm font-medium transition-colors hover:text-blue-400", "text-gray-700")}
                >
                  Contact
                </Link>
              </>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex items-center gap-2",
                      isScrolled || !isHomePage ? "text-gray-700" : "text-white",
                    )}
                  >
                    <div className="relative h-8 w-8 overflow-hidden rounded-full bg-blue-100">
                      {user.image ? (
                        <Image
                          src={user.image || "/placeholder.svg"}
                          alt={user.name || ""}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white">
                          {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <span className="hidden sm:inline">{user.name || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className={cn(
                  "px-4 py-2 rounded-md text-white font-medium transition-colors",
                  isScrolled || !isHomePage ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600/90 hover:bg-blue-700",
                )}
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
          >
            {isOpen ? (
              <X className={cn("h-6 w-6", isScrolled || !isHomePage ? "text-blue-600" : "text-white")} />
            ) : (
              <Menu className={cn("h-6 w-6", isScrolled || !isHomePage ? "text-blue-600" : "text-white")} />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="mt-4 flex flex-col space-y-4 pb-4 md:hidden">
            {isHomePage ? (
              <>
                <MobileNavLink href="#services" onClick={(e) => handleAnchorClick(e, "#services")}>
                  Services
                </MobileNavLink>
                <MobileNavLink href="#about" onClick={(e) => handleAnchorClick(e, "#about")}>
                  About Us
                </MobileNavLink>
                <MobileNavLink href="#testimonials" onClick={(e) => handleAnchorClick(e, "#testimonials")}>
                  Testimonials
                </MobileNavLink>
                <MobileNavLink href="#gallery" onClick={(e) => handleAnchorClick(e, "#gallery")}>
                  Gallery
                </MobileNavLink>
                <MobileNavLink href="#contact" onClick={(e) => handleAnchorClick(e, "#contact")}>
                  Contact
                </MobileNavLink>
              </>
            ) : (
              <>
                <Link
                  href="/#services"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Services
                </Link>
                <Link
                  href="/#about"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  href="/#testimonials"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Testimonials
                </Link>
                <Link
                  href="/#gallery"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Gallery
                </Link>
                <Link
                  href="/#contact"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </Link>
              </>
            )}

            {user ? (
              <>
                <div className="flex items-center space-x-2 py-2">
                  <div className="relative h-8 w-8 overflow-hidden rounded-full bg-blue-100">
                    {user.image ? (
                      <Image
                        src={user.image || "/placeholder.svg"}
                        alt={user.name || ""}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white">
                        {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name || user.email}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    signOut()
                    setIsOpen(false)
                  }}
                  className="text-left text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium bg-blue-600 text-white py-2 px-4 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

function NavLink({
  href,
  children,
  isScrolled,
  onClick,
}: {
  href: string
  children: React.ReactNode
  isScrolled: boolean
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm font-medium transition-colors hover:text-blue-400",
        isScrolled ? "text-gray-700" : "text-white",
      )}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
    >
      {children}
    </Link>
  )
}
