"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

export default function GallerySection() {
  const galleryImages = [
    {
      id: 1,
      src: "/images/gallery-1.jpg",
      alt: "Delivery personnel with packages",
      caption: "Our professional delivery team",
    },
    {
      id: 2,
      src: "/images/gallery-2.jpg",
      alt: "Delivery truck on the road",
      caption: "Our fleet of delivery vehicles",
    },
    {
      id: 3,
      src: "/images/gallery-3.jpg",
      alt: "Warehouse operations",
      caption: "State-of-the-art warehouse facilities",
    },
    {
      id: 4,
      src: "/images/gallery-4.jpg",
      alt: "Package being delivered",
      caption: "Safe and secure package delivery",
    },
    {
      id: 5,
      src: "/images/gallery-5.jpg",
      alt: "Customer receiving package",
      caption: "Customer satisfaction is our priority",
    },
    {
      id: 6,
      src: "/images/gallery-6.jpg",
      alt: "Mobile app interface",
      caption: "Track deliveries with our mobile app",
    },
    {
      id: 7,
      src: "/images/gallery-7.jpg",
      alt: "Delivery scooter in city",
      caption: "Quick urban deliveries with our scooter fleet",
    },
    {
      id: 8,
      src: "/images/gallery-8.jpg",
      alt: "Sorting facility",
      caption: "Advanced sorting technology for faster processing",
    },
    {
      id: 9,
      src: "/images/gallery-9.jpg",
      alt: "Delivery person at doorstep",
      caption: "Doorstep delivery with a smile",
    },
  ]

  // For lazy loading implementation
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({})
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute("data-id"))
            setImagesLoaded((prev) => ({ ...prev, [id]: true }))
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: "100px" },
    )

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      imageRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [])

  return (
    <section id="gallery" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Gallery</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Take a look at our delivery operations, fleet, and team in action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-lg shadow-md group"
              ref={(el) => (imageRefs.current[index] = el)}
              data-id={image.id}
            >
              <div className="relative h-64 w-full">
                {imagesLoaded[image.id] && (
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white font-medium">{image.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
