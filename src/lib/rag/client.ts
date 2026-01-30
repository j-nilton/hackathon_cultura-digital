import { generateWithRag } from "@/infra/services/ai";

type Options = {
  includeAssessment?: boolean;
  includeSlides?: boolean;
};

type Filters = {
  ano?: string;
  etapa?: string;
  componente?: string;
};

type CacheEntry = {
  text: string;
  ts: number;
};

function buildKey(prompt: string, options?: Options, filters?: Filters) {
  const parts = [
    filters?.componente || "",
    filters?.ano || "",
    filters?.etapa || "",
    (options?.includeAssessment ? "1" : "0") + (options?.includeSlides ? "1" : "0"),
    prompt,
  ];
  return "rag:" + encodeURIComponent(parts.join("|"));
}

export async function ragGenerateCached(
  prompt: string,
  options?: Options,
  filters?: Filters,
  ttlMs: number = 12 * 60 * 60 * 1000
): Promise<string> {
  try {
    const key = buildKey(prompt, options, filters);
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    if (raw) {
      const parsed: CacheEntry = JSON.parse(raw);
      if (Date.now() - parsed.ts < ttlMs && typeof parsed.text === "string" && parsed.text.length > 0) {
        return parsed.text;
      }
    }
  } catch { }
  const text = await generateWithRag(prompt, options, filters);
  try {
    const key = buildKey(prompt, options, filters);
    const entry: CacheEntry = { text, ts: Date.now() };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(entry));
    }
  } catch { }
  return text;
}
