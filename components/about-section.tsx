import Image from "next/image"
import { CheckCircle } from "lucide-react"

export default function AboutSection() {
  const features = [
    "Fast and reliable delivery across multiple cities",
    "Professional and trained delivery personnel",
    "Real-time tracking of your shipments",
    "Secure handling of all packages",
    "Flexible scheduling options",
    "24/7 customer support",
  ]

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl font-bold mb-6">About DoorStep</h2>
            <p className="text-gray-600 mb-6">
              DoorStep is a leading logistics and delivery service provider committed to making delivery simple,
              efficient, and reliable. Since our inception, we've been revolutionizing the way packages are delivered
              across the country.
            </p>
            <p className="text-gray-600 mb-8">
              Our mission is to provide the fastest, most reliable delivery experience for our customers while
              maintaining the highest standards of service quality and customer satisfaction.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-xl">
              <Image src="/images/about.jpg" alt="About DoorStep" fill className="object-cover" loading="lazy" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 rounded-lg shadow-lg max-w-xs">
              <p className="text-2xl font-bold mb-2">5+ Years</p>
              <p>Of excellence in delivery services</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
