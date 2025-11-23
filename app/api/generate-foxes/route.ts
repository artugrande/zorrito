import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { Buffer } from "buffer"

export const dynamic = "force-dynamic"
export const maxDuration = 60

interface GenerateFoxesResponse {
  image: string
}

interface ErrorResponse {
  error: string
  details?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log("[SERVER][v0] Starting fox generation...")

    const apiKey = process.env.AI_GATEWAY_API_KEY

    if (!apiKey) {
      console.log("[SERVER][v0] No API key found")
      return NextResponse.json<ErrorResponse>(
        {
          error: "Configuration error",
          details: "No AI Gateway API key configured",
        },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { etapa, colorPelaje, tipoPelaje, expresion, entorno, customization } = body

    console.log("[SERVER][v0] Customization options:", {
      etapa,
      colorPelaje,
      tipoPelaje,
      expresion,
      entorno,
      customization,
    })

    const referenceImagePath = "/images/zorrodebase.png"
    console.log("[SERVER][v0] Fetching reference image from:", referenceImagePath)

    const imageResponse = await fetch(new URL(referenceImagePath, request.url))
    if (!imageResponse.ok) {
      console.log("[SERVER][v0] Failed to fetch image:", imageResponse.status, imageResponse.statusText)
      throw new Error(`Failed to fetch reference image: ${imageResponse.statusText}`)
    }

    const arrayBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString("base64")
    const imageDataUrl = `data:image/png;base64,${base64}`

    console.log("[SERVER][v0] Reference image loaded, size:", buffer.length, "bytes")

    const customizationPrompt = `You are an expert character artist. Create a variation of this Patagonian fox character maintaining the EXACT same art style and aesthetic as the reference image.

CRITICAL: Keep the same illustrated cartoon style, clean vector-like appearance, smooth gradients, and overall visual aesthetic as shown in the reference image.

CHARACTER SPECIFICATIONS:
- Age/Stage: ${etapa}
- Fur Color: ${colorPelaje} - IMPORTANT: The fox's main fur color MUST be clearly and predominantly ${colorPelaje}. This is the PRIMARY COLOR of the fox's body. Make sure the ${colorPelaje} color is very visible and obvious throughout the fox's fur.
- Fur Type: ${tipoPelaje}
- Expression/Personality: ${expresion}
- Environment: ${entorno}
${customization ? `- Additional customization: ${customization}` : ""}

STYLE REQUIREMENTS:
- Maintain the exact same illustration style as the reference image
- Keep the smooth, cartoon aesthetic with clean lines
- Use similar color palettes and shading techniques (BUT ensure the main fur is ${colorPelaje})
- Preserve the cheerful, friendly character design
- Keep the Patagonian mountain landscape background style (mountains, lakes, trees)

COMPOSITION:
- Fox sitting in center foreground like the reference
- Full body visible
- Same perspective and composition style
- Maintain the quality and detail level of the reference image

CRITICAL REMINDER: The fox's fur MUST be predominantly ${colorPelaje} color. This is non-negotiable.

Generate a single, complete image. Do not include any text or labels.`

    console.log("[SERVER][v0] Generating customized fox with Gemini...")

    const result = await generateText({
      model: "google/gemini-2.5-flash-image",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: customizationPrompt,
            },
            {
              type: "image",
              image: imageDataUrl,
            },
          ],
        },
      ],
    })

    console.log("[SERVER][v0] AI generation complete, processing result...")

    const imageFiles = result.files?.filter((f) => f.mediaType?.startsWith("image/")) || []

    if (imageFiles.length === 0) {
      console.log("[SERVER][v0] No images in result, result:", JSON.stringify(result))
      return NextResponse.json<ErrorResponse>(
        { error: "No image generated", details: "The model did not return any images" },
        { status: 500 },
      )
    }

    const generatedImage = imageFiles[0]
    const generatedUrl = `data:${generatedImage.mediaType};base64,${generatedImage.base64}`

    console.log("[SERVER][v0] Fox generated successfully! Image size:", generatedImage.base64?.length || 0, "chars")

    return NextResponse.json<GenerateFoxesResponse>({
      image: generatedUrl,
    })
  } catch (error) {
    console.error("[SERVER][v0] Error generating foxes:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json<ErrorResponse>(
      {
        error: "Failed to generate foxes",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
