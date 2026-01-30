export type PlanItem = { title: string; minutes: number; description: string };

export type ParsedAiUnitContent = {
  objectives: string[];
  bnccSkills: string[];
  plan: PlanItem[];
};

type SectionKey = "objectives" | "bncc" | "plan" | "other";

const bnccCodeRegex = /\b(?:EF|EM|EI)\d{2}[A-Z]{2,4}\d{2,3}\b/g;

function normalizeText(input: string) {
  return String(input ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function isLikelyHeading(line: string) {
  const t = line.trim();
  if (!t) return false;
  if (t.startsWith("#")) return true;
  if (t.endsWith(":") && t.length <= 80) return true;
  if (t.length <= 60 && !/[.!?]$/.test(t)) return true;
  return false;
}

function detectSectionKey(line: string): SectionKey | null {
  const raw = line.trim();
  if (!raw) return null;
  const t = raw.replace(/^#+\s*/, "").replace(/:$/, "").trim().toLowerCase();

  if (!isLikelyHeading(raw)) return null;

  if (/(objetiv)/i.test(t)) return "objectives";

  if (/(bncc|habilidad|compet[eê]ncia)/i.test(t)) return "bncc";

  if (/(desenvolv|plano\s+de\s+aula|sequ[eê]ncia\s+did[aá]tica|metodolog)/i.test(t)) return "plan";

  return null;
}

function stripListPrefix(line: string) {
  return line
    .trim()
    .replace(/^(?:[-*•·–—]|(?:\d+)[.)]|(?:[IVX]+)[.)]|(?:[a-z])[.)])\s+/i, "")
    .trim();
}

function uniqPreserveOrder(items: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.trim().toLowerCase();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item.trim());
  }
  return out;
}

export function isValidBnccSkillLine(line: string) {
  const raw = String(line ?? "").trim();
  if (!raw) return false;

  const cleaned = raw.replace(/^#+\s*/, "").trim();
  if (!cleaned) return false;

  if (/^\s*#{1,6}\s*/.test(raw)) return false;
  if (/(objetiv|descri[cç][aã]o|planos?\s+de\s+aula|desenvolv|atividade\s+avaliativa|slides)/i.test(cleaned)) return false;
  if (/^(aula|etapa|momento|parte|encontro|semana|slide)\b/i.test(cleaned)) return false;
  if (/\b\d{1,3}\s*min\b/i.test(cleaned)) return false;

  const hasCode = bnccCodeRegex.test(cleaned);
  bnccCodeRegex.lastIndex = 0;
  if (hasCode) return true;

  const normalized = cleaned.replace(/\s*[-—–]\s*/g, " — ").trim();
  if (!normalized.includes(" — ")) return false;
  if (normalized.length < 6 || normalized.length > 220) return false;
  return true;
}

export function sanitizeBnccSkills(lines: string[]) {
  const rejected: string[] = [];
  const valid: string[] = [];
  for (const line of lines) {
    const normalized = String(line ?? "").trim().replace(/\s*[-—–]\s*/g, " — ").trim();
    if (!normalized) continue;
    if (isValidBnccSkillLine(normalized)) valid.push(normalized);
    else rejected.push(normalized);
  }
  return { valid: uniqPreserveOrder(valid), rejected: uniqPreserveOrder(rejected) };
}

function extractObjectives(text: string) {
  const lines = normalizeText(text).split("\n");
  const items: string[] = [];
  for (const line of lines) {
    const v = stripListPrefix(line);
    if (!v) continue;
    if (/^(bncc|habilidades?\b|compet[eê]ncias?\b)/i.test(v)) continue;
    if (isLikelyHeading(v) && /(bncc|habilidad|compet[eê]ncia|desenvolv|plano\s+de\s+aula)/i.test(v)) continue;
    items.push(v);
  }
  return uniqPreserveOrder(items);
}

function extractBnccSkills(text: string) {
  const lines = normalizeText(text).split("\n");
  const items: string[] = [];

  for (const rawLine of lines) {
    const line = stripListPrefix(rawLine);
    if (!line) continue;

    const codes = Array.from(line.matchAll(bnccCodeRegex)).map((m) => m[0]);
    if (codes.length) {
      const normalizedLine = line.replace(/\s*[-—–]\s*/g, " — ").trim();
      if (codes.length === 1) {
        items.push(normalizedLine);
        continue;
      }
      const desc = normalizedLine.replace(bnccCodeRegex, "").replace(/^[\s—-]+/, "").trim();
      for (const code of codes) {
        items.push(desc ? `${code} — ${desc}` : code);
      }
      continue;
    }

    if (line.length >= 6) {
      items.push(line.replace(/\s*[-—–]\s*/g, " — ").trim());
    }
  }

  return sanitizeBnccSkills(items).valid;
}

function parseMinutesFromLine(line: string) {
  const m = line.match(/(\d{1,3})\s*min/i);
  if (!m) return null;
  const v = Number(m[1]);
  if (!Number.isFinite(v) || v <= 0) return null;
  return v;
}

function extractPlanFromMarkdownTable(text: string, defaultMinutes: number) {
  const lines = normalizeText(text).split("\n").filter(Boolean);
  const tableLines = lines.filter((l) => l.includes("|"));
  if (tableLines.length < 3) return null;

  const header = tableLines[0].toLowerCase();
  if (!/(tempo|min|dura|etapa|aula)/i.test(header)) return null;

  const rows = tableLines.slice(2);
  const items: PlanItem[] = [];

  for (const row of rows) {
    const cols = row
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cols.length < 2) continue;
    const minutesCandidate = cols.find((c) => /min/i.test(c));
    const minutes = minutesCandidate ? parseMinutesFromLine(minutesCandidate) : null;
    const title = cols[0] || "Etapa";
    const description = cols.slice(1).join(" | ").trim();
    items.push({ title, minutes: minutes ?? defaultMinutes, description });
  }

  return items.length ? items : null;
}

function extractPlanByAulaBlocks(text: string, defaultMinutes: number) {
  const lines = normalizeText(text).split("\n");
  const items: PlanItem[] = [];

  let current: PlanItem | null = null;

  function commit() {
    if (!current) return;
    const desc = current.description.trim();
    if (!desc) return;
    items.push({ ...current, description: desc });
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const cleaned = line.replace(/^#+\s*/, "");

    const aulaMatch = cleaned.match(/^(aula|encontro|semana)\s*(\d+)\s*[:\-–—]\s*(.+)$/i);
    if (aulaMatch) {
      commit();
      const minutes = parseMinutesFromLine(cleaned) ?? defaultMinutes;
      current = {
        title: `${aulaMatch[1][0].toUpperCase()}${aulaMatch[1].slice(1).toLowerCase()} ${aulaMatch[2]} — ${aulaMatch[3].trim()}`,
        minutes,
        description: "",
      };
      continue;
    }

    const etapaMatch = cleaned.match(/^(etapa|momento|parte)\s*(\d+)?\s*[:\-–—]\s*(.+)$/i);
    if (etapaMatch) {
      commit();
      const minutes = parseMinutesFromLine(cleaned) ?? defaultMinutes;
      current = {
        title: `${etapaMatch[1][0].toUpperCase()}${etapaMatch[1].slice(1).toLowerCase()}${etapaMatch[2] ? ` ${etapaMatch[2]}` : ""} — ${etapaMatch[3].trim()}`,
        minutes,
        description: "",
      };
      continue;
    }

    if (!current) {
      current = { title: "Desenvolvimento", minutes: defaultMinutes, description: "" };
    }
    current.description += (current.description ? "\n" : "") + stripListPrefix(cleaned);
  }

  commit();
  return items.length ? items : null;
}

function extractPlan(text: string, defaultMinutes: number) {
  const fromTable = extractPlanFromMarkdownTable(text, defaultMinutes);
  if (fromTable) return fromTable;
  const byBlocks = extractPlanByAulaBlocks(text, defaultMinutes);
  if (byBlocks) return byBlocks;
  const fallback = normalizeText(text);
  if (!fallback) return [];
  return [{ title: "Desenvolvimento", minutes: defaultMinutes, description: fallback }];
}

function splitIntoSections(text: string) {
  const normalized = normalizeText(text);
  const lines = normalized.split("\n");
  const sections: Record<SectionKey, string[]> = { objectives: [], bncc: [], plan: [], other: [] };

  let current: SectionKey = "other";
  for (const line of lines) {
    const key = detectSectionKey(line);
    if (key) {
      current = key;
      continue;
    }
    sections[current].push(line);
  }

  return {
    objectives: sections.objectives.join("\n").trim(),
    bncc: sections.bncc.join("\n").trim(),
    plan: sections.plan.join("\n").trim(),
    other: sections.other.join("\n").trim(),
  };
}

export function parseAiTextToUnitContent(
  aiText: string,
  options?: { defaultPlanMinutes?: number }
): ParsedAiUnitContent {
  const defaultMinutes = Math.max(5, Math.min(180, Number(options?.defaultPlanMinutes ?? 50)));
  const sections = splitIntoSections(aiText);

  const objectives = extractObjectives(sections.objectives || aiText);
  const bnccSkills = extractBnccSkills(sections.bncc);
  const plan = extractPlan(sections.plan, defaultMinutes);

  return { objectives, bnccSkills, plan };
}
