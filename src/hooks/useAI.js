import { useState, useCallback } from "react";

// ── useAI: Custom hook for calling Anthropic Claude API ──
// Usage: const { callAI, loading, error } = useAI();
//        const result = await callAI({ systemPrompt, userPrompt, parseJSON });

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callAI = useCallback(async ({ systemPrompt, userPrompt, messages, parseJSON = false, maxTokens = 1000 }) => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error("Anthropic API key not found. Add VITE_ANTHROPIC_API_KEY to your .env file.");
      }

      // Build messages array — either use passed messages or create single user message
      const apiMessages = messages || [{ role: "user", content: userPrompt }];

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.content[0].text;

      if (parseJSON) {
        try {
          // Try to extract JSON from the response (may be wrapped in markdown code blocks)
          const jsonMatch = responseText.match(/\[[\s\S]*\]/) || responseText.match(/\{[\s\S]*\}/);
          const jsonText = jsonMatch ? jsonMatch[0] : responseText;
          return JSON.parse(jsonText);
        } catch (parseError) {
          console.warn("Failed to parse JSON from AI response, returning raw text:", parseError);
          return null; // Caller should use fallback data
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
  }, []);

  return { callAI, loading, error };
}
