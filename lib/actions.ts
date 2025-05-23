"use server"

import { createServerClient } from "@/lib/supabase"
import { initializeStorage } from "@/lib/storage"
import { revalidatePath } from "next/cache"

// Initialize storage buckets
export async function initializeApp() {
  try {
    await initializeStorage()
    return { success: true }
  } catch (error) {
    console.error("Error initializing app:", error)
    return { success: false, error }
  }
}

// Seed delivery history for a user
export async function seedDeliveryHistory(userId: string) {
  const supabase = createServerClient()

  // Check if user already has delivery history
  const { data: existingData } = await supabase.from("delivery_history").select("id").eq("user_id", userId).limit(1)

  if (existingData && existingData.length > 0) {
    return { success: true, message: "Delivery history already exists" }
  }

  // Sample delivery data
  const deliveries = [
    {
      user_id: userId,
      tracking_id: `DEL-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "In Transit",
      origin: "Lucknow",
      destination: "Delhi",
      estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: userId,
      tracking_id: `DEL-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "Out for Delivery",
      origin: "Mumbai",
      destination: "Pune",
      estimated_delivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: userId,
      tracking_id: `DEL-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "Pending",
      origin: "Bangalore",
      destination: "Chennai",
      estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: userId,
      tracking_id: `DEL-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "Delivered",
      origin: "Lucknow",
      destination: "Kanpur",
      estimated_delivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: userId,
      tracking_id: `DEL-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "Delivered",
      origin: "Delhi",
      destination: "Jaipur",
      estimated_delivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: userId,
      tracking_id: `DEL-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "Cancelled",
      origin: "Hyderabad",
      destination: "Vijayawada",
      estimated_delivery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  // Insert delivery history
  const { error } = await supabase.from("delivery_history").insert(deliveries)

  if (error) {
    console.error("Error seeding delivery history:", error)
    return { success: false, error }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

// Contact form submission
export async function submitContactForm(formData: { name: string; email: string; message: string }) {
  // In a real application, you would:
  // 1. Validate the input
  // 2. Store the message in a database
  // 3. Send an email notification
  // 4. Return a success/error response

  // For demo purposes, we'll simulate a delay and return success
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate validation
  if (!formData.email.includes("@")) {
    throw new Error("Invalid email address")
  }

  if (formData.message.length < 10) {
    throw new Error("Message is too short")
  }

  // Return success
  return { success: true }
}

// Password reset
export async function resetPassword(email: string) {
  const supabase = createServerClient()

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error resetting password:", error)
    throw error
  }
}

// Track package
export async function trackPackage(trackingId: string) {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase.from("delivery_history").select("*").eq("tracking_id", trackingId).single()

    if (error) {
      throw error
    }

    if (!data) {
      throw new Error("Package not found")
    }

    // Generate tracking history
    const history = [
      {
        status: "Order Placed",
        location: data.origin,
        timestamp: new Date(new Date(data.created_at).getTime() - 172800000).toISOString(),
      },
      {
        status: "Picked Up",
        location: `${data.origin} Hub`,
        timestamp: new Date(new Date(data.created_at).getTime() - 86400000).toISOString(),
      },
    ]

    // Add current status
    if (data.status === "Delivered") {
      history.push({
        status: "Delivered",
        location: data.destination,
        timestamp: new Date(data.updated_at).toISOString(),
      })
    } else if (data.status === "Cancelled") {
      history.push({
        status: "Cancelled",
        location: data.origin,
        timestamp: new Date(data.updated_at).toISOString(),
      })
    } else if (data.status === "Out for Delivery") {
      history.push({
        status: "In Transit",
        location: `${data.origin} to ${data.destination}`,
        timestamp: new Date(new Date(data.created_at).getTime() + 43200000).toISOString(),
      })
      history.push({
        status: "Out for Delivery",
        location: data.destination,
        timestamp: new Date(data.updated_at).toISOString(),
      })
    } else if (data.status === "In Transit") {
      history.push({
        status: "In Transit",
        location: `${data.origin} to ${data.destination}`,
        timestamp: new Date(data.updated_at).toISOString(),
      })
    } else {
      history.push({
        status: data.status,
        location: data.origin,
        timestamp: new Date(data.updated_at).toISOString(),
      })
    }

    return {
      id: data.id,
      tracking_id: data.tracking_id,
      status: data.status,
      origin: data.origin,
      destination: data.destination,
      estimated_delivery: data.estimated_delivery,
      created_at: data.created_at,
      updated_at: data.updated_at,
      history,
    }
  } catch (error) {
    console.error("Error tracking package:", error)
    throw error
  }
}

// Get price estimate
export async function getPriceEstimate(data: {
  origin: string
  destination: string
  packageType: string
  weight: number
  distance?: string
  isFragile?: boolean
  vehicleType?: string
  helpersCount?: number
  deliverySpeed?: string
  packageSize?: string
}) {
  // In a real application, you would:
  // 1. Validate the input
  // 2. Calculate the price based on distance, weight, etc.
  // 3. Return the price estimate

  // For demo purposes, we'll simulate a delay and return a mock price
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Basic validation
  if (!data.origin || !data.destination || !data.packageType || !data.weight) {
    throw new Error("All fields are required")
  }

  // Parse distance if provided (e.g., "10 km" -> 10)
  let distanceValue = 0
  if (data.distance) {
    const match = data.distance.match(/(\d+(\.\d+)?)/)
    if (match) {
      distanceValue = Number.parseFloat(match[1])
    }
  }

  // If we have a real distance from Google Maps, use it
  const distanceMultiplier = distanceValue > 0 ? distanceValue : Math.random() * 10 + 5

  // Service type base prices
  const serviceBasePrices = {
    "two-wheeler": 80,
    truck: 200,
    "packers-movers": 300,
    intercity: 150,
  }

  // Service type price per km
  const servicePricePerKm = {
    "two-wheeler": 5,
    truck: 15,
    "packers-movers": 20,
    intercity: 10,
  }

  // Base price based on service type
  const basePrice = serviceBasePrices[data.packageType] || 100

  // Calculate weight multiplier
  const weightMultiplier = data.weight * 2

  // Apply vehicle type multiplier
  let vehicleMultiplier = 1
  if (data.vehicleType) {
    switch (data.vehicleType) {
      case "mini":
        vehicleMultiplier = 0.8
        break
      case "medium":
        vehicleMultiplier = 1
        break
      case "large":
        vehicleMultiplier = 1.5
        break
    }
  }

  // Apply helpers multiplier for packers & movers
  let helpersMultiplier = 1
  if (data.packageType === "packers-movers" && data.helpersCount) {
    helpersMultiplier = 1 + data.helpersCount * 0.2 // Each helper adds 20% to the price
  }

  // Apply delivery speed multiplier
  let speedMultiplier = 1
  if (data.deliverySpeed) {
    switch (data.deliverySpeed) {
      case "express":
        speedMultiplier = 1.5
        break
      case "standard":
        speedMultiplier = 1
        break
      case "economy":
        speedMultiplier = 0.8
        break
      case "scheduled":
        speedMultiplier = 1.2
        break
    }
  }

  // Apply package size multiplier
  let sizeMultiplier = 1
  if (data.packageSize) {
    switch (data.packageSize) {
      case "small":
        sizeMultiplier = 0.8
        break
      case "medium":
        sizeMultiplier = 1
        break
      case "large":
        sizeMultiplier = 1.3
        break
      case "extra-large":
        sizeMultiplier = 1.6
        break
    }
  }

  // Apply fragile item surcharge
  const fragileSurcharge = data.isFragile ? 1.2 : 1

  // Calculate price per km based on service type
  const pricePerKm = servicePricePerKm[data.packageType] || 10

  // Calculate final price
  const price = Math.round(
    (basePrice + distanceMultiplier * pricePerKm + weightMultiplier) *
      vehicleMultiplier *
      helpersMultiplier *
      speedMultiplier *
      sizeMultiplier *
      fragileSurcharge,
  )

  // Determine estimated delivery time based on delivery speed
  let estimatedDeliveryTime = "1-2 days"
  if (data.deliverySpeed) {
    switch (data.deliverySpeed) {
      case "express":
        estimatedDeliveryTime = "Same day"
        break
      case "standard":
        estimatedDeliveryTime = "1-2 days"
        break
      case "economy":
        estimatedDeliveryTime = "3-5 days"
        break
      case "scheduled":
        estimatedDeliveryTime = "As scheduled"
        break
    }
  }

  // Return price estimate
  return {
    price,
    currency: "INR",
    estimatedDeliveryTime: data.distance ? estimatedDeliveryTime : estimatedDeliveryTime,
    distance: data.distance || Math.round(distanceMultiplier * 10) + " km",
  }
}

// Create a new booking
export async function createBooking(bookingData: {
  user_id: string
  service_type: string
  pickup_address: string
  delivery_address: string
  package_details?: string
  weight: number
  scheduled_date: string
  price: number
  distance?: string
  duration?: string
  is_fragile?: boolean
  vehicle_type?: string
  helpers_count?: number
  delivery_speed?: string
  package_size?: string
}) {
  const supabase = createServerClient()

  try {
    // Generate tracking ID
    const trackingId = `DS-${Math.floor(100000 + Math.random() * 900000)}`

    // Insert booking
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        ...bookingData,
        tracking_id: trackingId,
        status: "confirmed",
      })
      .select()
      .single()

    if (error) throw error

    // Send confirmation email
    await sendBookingConfirmationEmail(booking)

    // Add to delivery history for tracking
    await supabase.from("delivery_history").insert({
      user_id: bookingData.user_id,
      tracking_id: trackingId,
      status: "Pending",
      origin: bookingData.pickup_address,
      destination: bookingData.delivery_address,
      estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    })

    revalidatePath("/dashboard")
    return { success: true, booking }
  } catch (error) {
    console.error("Error creating booking:", error)
    return { success: false, error: error.message }
  }
}

// Send booking confirmation email
async function sendBookingConfirmationEmail(booking: any) {
  const supabase = createServerClient()

  try {
    // Get user profile for email
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", booking.user_id).single()

    // Get user email from auth
    const {
      data: { user },
    } = await supabase.auth.admin.getUserById(booking.user_id)

    if (!user?.email) {
      console.error("No email found for user")
      return
    }

    const emailContent = generateBookingEmailContent(booking, profile?.full_name || "Customer")

    // In a real application, you would use a service like:
    // - Resend
    // - SendGrid
    // - Nodemailer with SMTP
    // - Supabase Edge Functions with email service

    // For demo purposes, we'll log the email content
    console.log("Booking confirmation email would be sent to:", user.email)
    console.log("Email content:", emailContent)

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { success: true }
  } catch (error) {
    console.error("Error sending confirmation email:", error)
    return { success: false, error }
  }
}

// Generate email content
function generateBookingEmailContent(booking: any, customerName: string) {
  const formatServiceType = (serviceType: string) => {
    return serviceType
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Format additional details
  const additionalDetails = []
  if (booking.vehicle_type) {
    additionalDetails.push(
      `<p><strong>Vehicle Type:</strong> ${booking.vehicle_type.charAt(0).toUpperCase() + booking.vehicle_type.slice(1)}</p>`,
    )
  }
  if (booking.helpers_count && booking.helpers_count > 0) {
    additionalDetails.push(`<p><strong>Helpers:</strong> ${booking.helpers_count}</p>`)
  }
  if (booking.delivery_speed) {
    additionalDetails.push(
      `<p><strong>Delivery Speed:</strong> ${booking.delivery_speed.charAt(0).toUpperCase() + booking.delivery_speed.slice(1)}</p>`,
    )
  }
  if (booking.package_size) {
    additionalDetails.push(
      `<p><strong>Package Size:</strong> ${booking.package_size.charAt(0).toUpperCase() + booking.package_size.slice(1)}</p>`,
    )
  }
  if (booking.is_fragile) {
    additionalDetails.push(`<p><strong>Fragile Package:</strong> Yes</p>`)
  }

  return {
    subject: `Booking Confirmation - ${booking.tracking_id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .booking-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 DoorStep Delivery</h1>
            <h2>Booking Confirmed!</h2>
          </div>
          
          <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>Thank you for choosing DoorStep! Your delivery service has been successfully booked.</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <p><strong>Booking ID:</strong> ${booking.id}</p>
              <p><strong>Tracking ID:</strong> ${booking.tracking_id}</p>
              <p><strong>Service Type:</strong> ${formatServiceType(booking.service_type)}</p>
              <p><strong>Pickup Address:</strong> ${booking.pickup_address}</p>
              <p><strong>Delivery Address:</strong> ${booking.delivery_address}</p>
              <p><strong>Scheduled Pickup:</strong> ${new Date(booking.scheduled_date).toLocaleString()}</p>
              <p><strong>Weight:</strong> ${booking.weight} kg</p>
              <p><strong>Total Amount:</strong> ₹${booking.price}</p>
              <p><strong>Status:</strong> ${booking.status}</p>
              ${additionalDetails.join("")}
            </div>
            
            ${
              booking.package_details
                ? `
            <div class="booking-details">
              <h3>Package Details</h3>
              <p>${booking.package_details}</p>
            </div>
            `
                : ""
            }
            
            <div class="booking-details">
              <h3>What's Next?</h3>
              <ol>
                <li>Prepare your package for pickup at the scheduled time</li>
                <li>Our delivery partner will contact you before pickup</li>
                <li>Track your delivery using the tracking ID: ${booking.tracking_id}</li>
              </ol>
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/track" class="button">Track Your Package</a>
            </p>
          </div>
          
          <div class="footer">
            <p>Need help? Contact us at <a href="mailto:support@doorstep.com">support@doorstep.com</a></p>
            <p>© 2025 DoorStep. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      DoorStep Delivery - Booking Confirmed!
      
      Dear ${customerName},
      
      Thank you for choosing DoorStep! Your delivery service has been successfully booked.
      
      Booking Details:
      - Booking ID: ${booking.id}
      - Tracking ID: ${booking.tracking_id}
      - Service Type: ${formatServiceType(booking.service_type)}
      - Pickup Address: ${booking.pickup_address}
      - Delivery Address: ${booking.delivery_address}
      - Scheduled Pickup: ${new Date(booking.scheduled_date).toLocaleString()}
      - Weight: ${booking.weight} kg
      - Total Amount: ₹${booking.price}
      - Status: ${booking.status}
      ${booking.vehicle_type ? `- Vehicle Type: ${booking.vehicle_type}` : ""}
      ${booking.helpers_count > 0 ? `- Helpers: ${booking.helpers_count}` : ""}
      ${booking.delivery_speed ? `- Delivery Speed: ${booking.delivery_speed}` : ""}
      ${booking.package_size ? `- Package Size: ${booking.package_size}` : ""}
      ${booking.is_fragile ? "- Fragile Package: Yes" : ""}
      
      ${booking.package_details ? `Package Details: ${booking.package_details}` : ""}
      
      What's Next?
      1. Prepare your package for pickup at the scheduled time
      2. Our delivery partner will contact you before pickup
      3. Track your delivery using the tracking ID: ${booking.tracking_id}
      
      Track your package: ${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/track
      
      Need help? Contact us at support@doorstep.com
      
      © 2025 DoorStep. All rights reserved.
    `,
  }
}
