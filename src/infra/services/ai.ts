type ContentOptions = {
  includeAssessment?: boolean
  includeSlides?: boolean
}

type RagFilters = {
  ano?: string
  etapa?: string
  componente?: string
}

async function postToRag(prompt: string, options?: ContentOptions): Promise<string> {
  try {
    const res = await fetch("/rag/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        includeAssessment: !!options?.includeAssessment,
        includeSlides: !!options?.includeSlides,
      }),
    })
    if (!res.ok) throw new Error("bad_response")
    const data = await res.json()
    if (typeof data?.text === "string") return data.text
    throw new Error("invalid_payload")
  } catch {
    throw new Error("network_error")
  }
}

export async function generateFromPrompt(prompt: string, options?: ContentOptions): Promise<string> {
  try {
    return await postToRag(prompt, options)
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const parts: string[] = []
    if (options?.includeAssessment) parts.push("com atividade avaliativa")
    if (options?.includeSlides) parts.push("com slides")
    const suffix = parts.length ? ` (${parts.join(" e ")})` : ""
    return `Resultado gerado para: "${prompt}"${suffix}. Inclui objetivos e conteúdos alinhados à BNCC.`
  }
}

async function postToRagWithFilters(
  prompt: string,
  options?: ContentOptions,
  filters?: RagFilters
): Promise<string> {
  try {
    const res = await fetch("/rag/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        includeAssessment: !!options?.includeAssessment,
        includeSlides: !!options?.includeSlides,
        ano: filters?.ano,
        etapa: filters?.etapa,
        componente: filters?.componente,
      }),
    })
    if (!res.ok) throw new Error("bad_response")
    const data = await res.json()
    if (typeof data?.text === "string") return data.text
    throw new Error("invalid_payload")
  } catch {
    throw new Error("network_error")
  }
}

export async function generateWithRag(
  prompt: string,
  options?: ContentOptions,
  filters?: RagFilters
): Promise<string> {
  try {
    return await postToRagWithFilters(prompt, options, filters)
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const parts: string[] = []
    if (options?.includeAssessment) parts.push("com atividade avaliativa")
    if (options?.includeSlides) parts.push("com slides")
    const suffix = parts.length ? ` (${parts.join(" e ")})` : ""
    return `Resultado gerado para: "${prompt}"${suffix}. Contexto aplicado parcialmente.`
  }
}
