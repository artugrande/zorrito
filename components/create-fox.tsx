"use client";

import { useState } from "react";
import { Loader2, Wallet, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/footer";
import { useCreateFox } from "@/hooks/use-create-fox";
import { useToast } from "@/hooks/use-toast";

interface CreateFoxProps {
  walletAddress: string;
  onFoxCreated: (data: any) => void;
  onBack: () => void;
}

const sanitizeCustomization = (
  text: string
): { isValid: boolean; message?: string } => {
  const bannedPatterns = [
    /sex|nude|naked|porn|xxx/i,
    /violence|weapon|gun|knife|blood|kill/i,
    /swastika|nazi|kkk|hate/i,
    /drug|cocaine|heroin|meth/i,
    /racist|discriminat|slur/i,
    /terror|bomb|explosive/i,
  ];

  for (const pattern of bannedPatterns) {
    if (pattern.test(text)) {
      return {
        isValid: false,
        message:
          "Please use friendly and safe descriptions. Avoid inappropriate content.",
      };
    }
  }

  return { isValid: true };
};

export function CreateFox({
  walletAddress,
  onFoxCreated,
  onBack,
}: CreateFoxProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [nameError, setNameError] = useState("");
  const [customizationError, setCustomizationError] = useState("");
  const [createdFox, setCreatedFox] = useState<any>(null);

  const { mutateAsync: createFox, isPending: isMinting } = useCreateFox();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    etapa: "Young",
    colorPelaje: "Red",
    tipoPelaje: "Short & tidy",
    expresion: "Curious",
    entorno: "Dry steppe",
    nombre: "",
    customization: "",
  });

  const handleGenerate = async () => {
    if (!formData.nombre.trim()) {
      setNameError("Please enter a name for your fox");
      return;
    }
    setNameError("");

    if (formData.customization.trim()) {
      const validation = sanitizeCustomization(formData.customization);
      if (!validation.isValid) {
        setCustomizationError(validation.message || "");
        return;
      }
    }
    setCustomizationError("");

    console.log("[v0] Starting fox generation...");
    setIsGenerating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 2;
      });
    }, 100);

    try {
      console.log("[v0] Calling API with data:", formData);
      const response = await fetch("/api/generate-foxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("[v0] API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[v0] API error:", errorData);
        throw new Error(errorData.details || "Failed to generate fox");
      }

      const data = await response.json();
      console.log(
        "[v0] Fox generated successfully, image length:",
        data.image?.length || 0
      );
      setGeneratedImage(data.image);
      setProgress(100);
    } catch (error) {
      console.error("[v0] Error generating fox:", error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Failed to generate fox"
        }`
      );
      setProgress(0);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handleMint = async () => {
    if (!generatedImage) {
      toast({
        title: "Generate your fox first",
        description: "Create an image before minting your fox.",
      });
      return;
    }

    if (!walletAddress) {
      toast({
        title: "Connect your wallet",
        description: "We need your wallet address to mint your fox.",
      });
      return;
    }

    try {
      const fox = await createFox({
        name: formData.nombre,
        imageDataUrl: generatedImage,
        owner: walletAddress,
      });

      setCreatedFox(fox);
      setShowSuccessModal(true);

      toast({
        title: "Fox created!",
        description: "Your fox was saved to the backend.",
      });
    } catch (error) {
      console.error("Error creating fox:", error);
      toast({
        title: "Failed to mint fox",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  };

  const handleContinue = () => {
    onFoxCreated(
      createdFox || {
        ...formData,
        image: generatedImage,
      }
    );
  };

  if (showSuccessModal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#87CEEB] bg-[url('/images/backgroundzorrito.png')] bg-fixed bg-cover bg-center p-4">
        <Card className="w-full max-w-md border-zorrito-cream bg-white p-8 shadow-lg">
          <div className="space-y-6 text-center">
            {generatedImage && (
              <img
                src={generatedImage || "/placeholder.svg"}
                alt="Generated Fox"
                className="w-full rounded-lg"
              />
            )}
            <h2 className="text-2xl font-bold text-zorrito-brown">
              Your fox NFT has been minted successfully!
            </h2>
            <Button
              onClick={handleContinue}
              className="h-12 w-full bg-black text-white hover:bg-black/90"
            >
              Continue
            </Button>
          </div>
        </Card>
        <div className="mt-8">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#87CEEB] bg-[url('/images/backgroundzorrito.png')] bg-fixed bg-cover bg-center p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-center gap-4">
          <Button
            onClick={onBack}
            className="h-10 bg-black px-4 py-2 text-white hover:bg-black/90"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back Home
          </Button>
          <h1 className="text-3xl font-bold text-zorrito-brown md:text-4xl">
            Customize Your Fox 🦊
          </h1>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-[#FFAA5A] bg-[#D8731F] p-6 shadow-lg">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="font-semibold text-white">
                  Fox Name *
                </Label>
                <Input
                  id="nombre"
                  placeholder="Name your fox"
                  value={formData.nombre}
                  onChange={(e) => {
                    setFormData({ ...formData, nombre: e.target.value });
                    if (nameError) setNameError("");
                  }}
                  className="w-full border-[#FFAA5A] bg-white text-zorrito-brown placeholder:text-zorrito-brown/40"
                  required
                />
                {nameError && (
                  <p className="text-sm font-semibold text-red-200">
                    {nameError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="etapa" className="font-semibold text-white">
                  Stage / Age
                </Label>
                <Select
                  value={formData.etapa}
                  onValueChange={(value) =>
                    setFormData({ ...formData, etapa: value })
                  }
                >
                  <SelectTrigger
                    id="etapa"
                    className="w-full border-[#FFAA5A] bg-white text-zorrito-brown"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Puppy">Puppy</SelectItem>
                    <SelectItem value="Young">Young</SelectItem>
                    <SelectItem value="Adult">Adult</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="colorPelaje"
                  className="font-semibold text-white"
                >
                  Fur Color
                </Label>
                <Select
                  value={formData.colorPelaje}
                  onValueChange={(value) =>
                    setFormData({ ...formData, colorPelaje: value })
                  }
                >
                  <SelectTrigger
                    id="colorPelaje"
                    className="w-full border-[#FFAA5A] bg-white text-zorrito-brown"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Black">Black</SelectItem>
                    <SelectItem value="Gray">Gray</SelectItem>
                    <SelectItem value="Brown">Brown</SelectItem>
                    <SelectItem value="Red">Red</SelectItem>
                    <SelectItem value="Pink">Pink</SelectItem>
                    <SelectItem value="White">White</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Light Blue">Light Blue</SelectItem>
                    <SelectItem value="Golden">Golden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="tipoPelaje"
                  className="font-semibold text-white"
                >
                  Fur Type
                </Label>
                <Select
                  value={formData.tipoPelaje}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipoPelaje: value })
                  }
                >
                  <SelectTrigger
                    id="tipoPelaje"
                    className="w-full border-[#FFAA5A] bg-white text-zorrito-brown"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Short & tidy">Short & tidy</SelectItem>
                    <SelectItem value="Long & messy">Long & messy</SelectItem>
                    <SelectItem value="Soft & fluffy">Soft & fluffy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expresion" className="font-semibold text-white">
                  Expression / Personality
                </Label>
                <Select
                  value={formData.expresion}
                  onValueChange={(value) =>
                    setFormData({ ...formData, expresion: value })
                  }
                >
                  <SelectTrigger
                    id="expresion"
                    className="w-full border-[#FFAA5A] bg-white text-zorrito-brown"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Curious">Curious</SelectItem>
                    <SelectItem value="Alert">Alert</SelectItem>
                    <SelectItem value="Playful">Playful</SelectItem>
                    <SelectItem value="Wise">Wise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entorno" className="font-semibold text-white">
                  Patagonian Environment
                </Label>
                <Select
                  value={formData.entorno}
                  onValueChange={(value) =>
                    setFormData({ ...formData, entorno: value })
                  }
                >
                  <SelectTrigger
                    id="entorno"
                    className="w-full border-[#FFAA5A] bg-white text-zorrito-brown"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Dry steppe">Dry steppe</SelectItem>
                    <SelectItem value="Andean forest">Andean forest</SelectItem>
                    <SelectItem value="Snowy mountains">
                      Snowy mountains
                    </SelectItem>
                    <SelectItem value="Windy coastline">
                      Windy coastline
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="customization"
                  className="font-semibold text-white"
                >
                  Customize your fox (optional)
                </Label>
                <Textarea
                  id="customization"
                  placeholder="Clothes, hat, accessories… e.g. 'explorer hat', 'scarf', 'backpack'. Keep it friendly and respectful."
                  value={formData.customization}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      customization: e.target.value,
                    });
                    if (customizationError) setCustomizationError("");
                  }}
                  rows={3}
                  className="w-full resize-none border-[#FFAA5A] bg-white text-zorrito-brown placeholder:text-zorrito-brown/40"
                />
                {customizationError && (
                  <p className="text-sm font-semibold text-red-200">
                    {customizationError}
                  </p>
                )}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="relative h-12 w-full overflow-hidden bg-black text-white hover:bg-black/90"
              >
                {isGenerating && (
                  <div
                    className="absolute inset-0 bg-zorrito-orange transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Fox"
                  )}
                </span>
              </Button>
            </div>
          </Card>

          <div className="flex flex-col items-center justify-center">
            {generatedImage ? (
              <div className="w-full space-y-4">
                <img
                  src={generatedImage || "/placeholder.svg"}
                  alt="Generated Fox"
                  className="w-full rounded-xl border-2 border-zorrito-cream shadow-lg"
                />
                <Button
                  onClick={handleMint}
                  disabled={isMinting}
                  className="h-12 w-full bg-black text-white hover:bg-black/90"
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-5 w-5" />
                      Mint NFT
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Card className="flex aspect-square w-full items-center justify-center border-zorrito-cream bg-black shadow-lg">
                <p className="px-8 text-center text-white">
                  Generate your fox to see the preview
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
