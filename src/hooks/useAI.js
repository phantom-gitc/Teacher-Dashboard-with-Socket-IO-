// src/hooks/useAI.js — AI hook that routes through the backend proxy
// API keys NEVER leave the server — all AI calls go through /api/ai/*

import { useState, useCallback } from "react";
import api from "@/lib/api";

// ── useAI: Custom hook for all AI feature calls ──
// Usage: const { callAI, loading, error } = useAI();
//        const result = await callAI({ systemPrompt, userPrompt, parseJSON });
//
// All requests are sent to the backend which holds the Gemini/AI key securely.

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callAI = useCallback(
    async ({ systemPrompt, userPrompt, messages, parseJSON = false }) => {
      setLoading(true);
      setError(null);

      try {
        // Build the messages array
        const apiMessages = messages || [{ role: "user", content: userPrompt }];

        const res = await api.post("/ai/chat", {
          messages: apiMessages,
          systemPrompt,
        });

        const responseText = res.data?.content || "";

        if (parseJSON) {
          try {
            const jsonMatch =
              responseText.match(/\[[\s\S]*\]/) ||
              responseText.match(/\{[\s\S]*\}/);
            const jsonText = jsonMatch ? jsonMatch[0] : responseText;
            return JSON.parse(jsonText);
          } catch {
            return null;
          }
        }

        return responseText;
      } catch (err) {
        console.error("AI API Error:", err);
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { callAI, loading, error };
}
