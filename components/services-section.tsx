import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default function ServicesSection() {
  const services = [
    {
      icon: "/images/two-wheeler.png",
      title: "Two Wheelers",
      description: "Quick deliveries for small packages across the city with our efficient two-wheeler fleet.",
    },
    {
      icon: "/images/truck.png",
      title: "Trucks",
      description: "Move large shipments with our range of trucks suitable for all your transportation needs.",
    },
    {
      icon: "/images/packers.png",
      title: "Packers & Movers",
      description: "Complete relocation services with professional packing, loading, and transportation.",
    },
    {
      icon: "/images/intercity.png",
      title: "Intercity Courier",
      description: "Reliable and fast courier services connecting major cities across the country.",
    },
    {
      icon: "/images/enterprise.png",
      title: "Enterprise Solutions",
      description: "Customized logistics solutions for businesses of all sizes with dedicated support.",
    },
    {
      icon: "/images/api.png",
      title: "API Integration",
      description: "Seamlessly integrate our delivery services into your applications with our robust API.",
    },
  ]

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We offer a comprehensive range of delivery and logistics services to meet all your needs, from quick local
            deliveries to complete relocation solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="mb-4 rounded-full bg-blue-100 p-4 inline-block">
                  <Image
                    src={service.icon || "/placeholder.svg"}
                    alt={service.title}
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
