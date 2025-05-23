import HeroSlider from "@/components/hero-slider"
import Navbar from "@/components/navbar"
import ServicesSection from "@/components/services-section"
import TestimonialsSection from "@/components/testimonials-section"
import AboutSection from "@/components/about-section"
import GallerySection from "@/components/gallery-section"
import ContactSection from "@/components/contact-section"
import Footer from "@/components/footer"
import AppSection from "@/components/app-section"

export default function Home() {
  // Hero slider images and content
  const heroSlides = [
    {
      id: 1,
      imageUrl: "/images/hero-1.jpg",
      title: "Your packages, our priority!",
      subtitle: "Fast, reliable delivery services for all your needs",
      buttonText: "Get an estimate",
      buttonLink: "#contact",
    },
    {
      id: 2,
      imageUrl: "/images/hero-2.jpg",
      title: "Delivery solutions for businesses",
      subtitle: "Streamline your logistics with our enterprise solutions",
      buttonText: "Learn more",
      buttonLink: "#services",
    },
    {
      id: 3,
      imageUrl: "/images/hero-3.jpg",
      title: "Join our delivery network",
      subtitle: "Become a delivery partner and grow with us",
      buttonText: "Partner with us",
      buttonLink: "#contact",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSlider slides={heroSlides} />
        <ServicesSection />
        <AboutSection />
        <TestimonialsSection />
        <GallerySection />
        <AppSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
