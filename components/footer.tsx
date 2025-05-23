import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white">
                <Image src="/images/logo.png" alt="DoorStep Logo" width={40} height={40} className="object-contain" />
              </div>
              <h3 className="text-xl font-bold">DoorStep</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Your reliable partner for all your delivery and logistics needs. Fast, secure, and on time.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={<Facebook className="h-5 w-5" />} label="Facebook" />
              <SocialLink href="#" icon={<Twitter className="h-5 w-5" />} label="Twitter" />
              <SocialLink href="#" icon={<Instagram className="h-5 w-5" />} label="Instagram" />
              <SocialLink href="#" icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink href="#services">Services</FooterLink>
              <FooterLink href="#about">About Us</FooterLink>
              <FooterLink href="#testimonials">Testimonials</FooterLink>
              <FooterLink href="#gallery">Gallery</FooterLink>
              <FooterLink href="#contact">Contact</FooterLink>
              <FooterLink href="/login">Login</FooterLink>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Services</h3>
            <ul className="space-y-2">
              <FooterLink href="#services">Two Wheelers</FooterLink>
              <FooterLink href="#services">Trucks</FooterLink>
              <FooterLink href="#services">Packers & Movers</FooterLink>
              <FooterLink href="#services">Intercity Courier</FooterLink>
              <FooterLink href="#services">Enterprise Solutions</FooterLink>
              <FooterLink href="#services">API Integration</FooterLink>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <address className="not-italic text-gray-400">
              <div className="flex items-start mb-2">
                <MapPin className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                <span>123 Delivery Street, Lucknow, Uttar Pradesh 226001, India</span>
              </div>
              <p className="mb-2">Phone: +91 9345432801</p>
              <p>Email: info@doorstep.com</p>
            </address>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© 2025 DoorStep. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors" aria-label={label}>
      {icon}
    </Link>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-gray-400 hover:text-white transition-colors">
        {children}
      </Link>
    </li>
  )
}
