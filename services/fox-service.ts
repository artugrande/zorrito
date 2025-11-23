const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
const FOX_ENDPOINT = `${API_BASE_URL}/api/fox`;

console.log("FOX_ENDPOINT =>", FOX_ENDPOINT); // 👈

export interface CreateFoxPayload {
  name: string;
  imageDataUrl: string;
  owner: string;
}

export interface CreateFoxResponse {
  foxId: string;
  name: string;
  owner: string;
  round: string;
  imageUrl: string;
  pieceCid: string;
  storage?: unknown;
}

export async function createFox(
  payload: CreateFoxPayload
): Promise<CreateFoxResponse> {
  const response = await fetch(FOX_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = "Failed to create fox";

    try {
      const errorData = await response.json();
      errorMessage = errorData?.error || errorData?.message || errorMessage;
    } catch (err) {
      console.error("Error parsing createFox error response", err);
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
