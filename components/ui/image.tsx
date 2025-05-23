"use client"

import { useState } from "react"
import NextImage, { type ImageProps as NextImageProps } from "next/image"

interface ImageProps extends NextImageProps {
  fallbackSrc?: string
}

export default function Image({ fallbackSrc, alt, ...props }: ImageProps) {
  const [src, setSrc] = useState<string | undefined>(undefined)

  // Generate a fallback image URL if not provided
  const defaultFallback = `https://placehold.co/${props.width || 300}x${props.height || 300}/blue/white?text=${encodeURIComponent(alt || "Image")}`

  const finalFallbackSrc = fallbackSrc || defaultFallback

  return (
    <NextImage
      {...props}
      src={src || props.src}
      alt={alt}
      onError={() => {
        setSrc(finalFallbackSrc)
      }}
    />
  )
}
