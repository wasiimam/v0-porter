import Image from "next/image"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AppSection() {
  const features = [
    "Real-time package tracking",
    "Schedule pickups and deliveries",
    "Instant price estimates",
    "Manage multiple deliveries",
    "Secure payment options",
    "Delivery history and receipts",
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Download Our Mobile App</h2>
            <p className="text-gray-600 mb-6">
              Experience the convenience of managing your deliveries on the go with our mobile app. Track your packages
              in real-time, schedule pickups, and get instant price estimates right from your smartphone.
            </p>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                className="bg-black hover:bg-gray-800 text-white flex items-center justify-center gap-2 h-14"
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                        <path d="M17.5,12.5h-11C5.7,12.5,5,11.8,5,11V3c0-0.8,0.7-1.5,1.5-1.5h11C18.3,1.5,19,2.2,19,3v8C19,11.8,18.3,12.5,17.5,12.5z" />
                        <path d="M12,22.5c-0.8,0-1.5-0.7-1.5-1.5v-9h3v9C13.5,21.8,12.8,22.5,12,22.5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs">Download on the</div>
                      <div className="text-lg font-semibold font-sans -mt-1">App Store</div>
                    </div>
                  </div>
                </a>
              </Button>

              <Button
                asChild
                className="bg-black hover:bg-gray-800 text-white flex items-center justify-center gap-2 h-14"
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                        <path
                          d="M3.5,20.5c-0.3,0-0.5-0.1-0.7-0.3C2.6,20,2.5,19.8,2.5,19.5v-15C2.5,4.2,2.6,4,2.8,3.8c0.2-0.2,0.4-0.3,0.7-0.3l12,7.5
                          l-12,7.5C3.5,18.5,3.5,18.5,3.5,20.5z"
                        />
                        <path d="M14.5,11L4.5,3.5h15L14.5,11z" />
                        <path d="M19.5,20.5h-15l10-7.5L19.5,20.5z" />
                        <path d="M19.5,3.5v17l-5-7.5L19.5,3.5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs">GET IT ON</div>
                      <div className="text-lg font-semibold font-sans -mt-1">Google Play</div>
                    </div>
                  </div>
                </a>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto w-64 h-[500px] md:w-80">
              <Image
                src="/images/app-mockup.png"
                alt="DoorStep Mobile App"
                fill
                className="object-contain"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-xs">
              <div className="flex items-center">
                <div className="mr-2 text-2xl font-bold">4.8</div>
                <div className="flex">
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
              </div>
              <p className="text-sm mt-1">App Store Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
