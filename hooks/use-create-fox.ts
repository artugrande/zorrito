"use client"

import { useMutation } from "@tanstack/react-query"
import { createFox, type CreateFoxPayload, type CreateFoxResponse } from "@/services/fox-service"

export function useCreateFox() {
  return useMutation<CreateFoxResponse, Error, CreateFoxPayload>({
    mutationFn: createFox,
  })
}
