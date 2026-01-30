import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { observeUserDisciplines, type Discipline } from "@/infra/services/firebase/disciplineService";
import { getUnitsByDiscipline, updateUnit, type Unit } from "@/infra/services/firebase/unitService";
import { ragGenerateCached } from "@/lib/rag/client";
import { parseAiTextToUnitContent } from "@/lib/rag/aiTextToUnit";

export default function IAGeradorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useUserProfile();
  const [disciplines, setDisciplines] = useState<Array<{ id: string } & Discipline>>([]);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>("");
  const [units, setUnits] = useState<Array<{ id: string; title: string; description?: string }>>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includeAssessment, setIncludeAssessment] = useState(false);
  const [includeSlides, setIncludeSlides] = useState(false);

  useEffect(() => {
    if (!userId) {
      setDisciplines([]);
      return;
    }
    const unsub = observeUserDisciplines(userId, (items) => {
      setDisciplines(items);
    });
    return () => unsub();
  }, [userId]);

  useEffect(() => {
    setUnits([]);
    setSelectedUnitId("");
    setPrompt("");
    setPreview(null);
    setError(null);
    if (!selectedDisciplineId) return;
    getUnitsByDiscipline(selectedDisciplineId)
      .then((items) => {
        setUnits(items.map((u) => ({ id: u.id, title: u.title, description: u.description })));
      })
      .catch(() => {
        setError("Falha ao carregar unidades da disciplina.");
      });
  }, [selectedDisciplineId]);

  useEffect(() => {
    if (!selectedUnitId) return;
    const unit = units.find((u) => u.id === selectedUnitId);
    if (!unit) return;
    const base = unit.description?.trim() || unit.title?.trim() || "";
    setPrompt(base);
  }, [selectedUnitId, units]);

  const selectedDiscipline = useMemo(
    () => disciplines.find((d) => d.id === selectedDisciplineId),
    [disciplines, selectedDisciplineId]
  );

  const filters = useMemo(() => {
    const etapa =
      selectedDiscipline?.levelVariant === "fundamental1"
        ? "Ensino Fundamental I"
        : selectedDiscipline?.levelVariant === "fundamental2"
        ? "Ensino Fundamental II"
        : selectedDiscipline?.levelVariant === "medio"
        ? "Ensino Médio"
        : undefined;
    const ano = /\d+\s?(?:º|°)\s?ano/i.test(String(selectedDiscipline?.level || "")) ? selectedDiscipline?.level : undefined;
    const componente = selectedDiscipline?.name || undefined;
    return { ano, etapa, componente };
  }, [selectedDiscipline]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      console.debug("[rag][generate] prompt", { prompt, includeAssessment, includeSlides, filters });
      const out = await ragGenerateCached(prompt, { includeAssessment, includeSlides }, filters);
      setPreview(out);
    } catch (e) {
      console.debug("[rag][generate][error]", e);
      setError("Falha ao gerar com IA. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedUnitId || !preview) return;
    try {
      setLoading(true);
      const parsed = parseAiTextToUnitContent(preview, { defaultPlanMinutes: 50 });
      const payload: Partial<Unit> = {
        type: "ai",
        description: preview,
        status: "em_andamento",
      };
      if (parsed.objectives.length) payload.objectives = parsed.objectives;
      if (parsed.bnccSkills.length) payload.bnccSkills = parsed.bnccSkills;
      if (parsed.plan.length) {
        payload.plan = parsed.plan;
        payload.lessonsCount = parsed.plan.length;
      }
      await updateUnit(selectedUnitId, payload);
      toast({ title: "Conteúdo gerado", description: "Unidade atualizada com sucesso." });
      navigate(`/unidades/${selectedUnitId}`);
    } catch {
      setError("Falha ao salvar conteúdo na unidade.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showIllustrations={false}>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-foreground mb-2">Gerador IA</h1>
          <p className="text-muted-foreground">Selecione disciplina e unidade, gere conteúdo alinhado à BNCC</p>
        </motion.div>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card variant="ai">
            <CardHeader>
              <CardTitle>Seleção de contexto</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Disciplina</Label>
                  <Select
                    value={selectedDisciplineId}
                    onValueChange={(v) => setSelectedDisciplineId(v)}
                  >
                    <SelectTrigger aria-label="Selecionar disciplina">
                      <SelectValue placeholder="Escolha a disciplina" />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplines.map((d) => (
                        <SelectItem key={d.id} value={d.id} className="hover:bg-muted">
                          <span className="text-foreground">{d.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select
                    value={selectedUnitId}
                    onValueChange={(v) => setSelectedUnitId(v)}
                    disabled={!selectedDisciplineId || units.length === 0}
                  >
                    <SelectTrigger aria-label="Selecionar unidade">
                      <SelectValue placeholder={units.length ? "Escolha a unidade" : "Nenhuma unidade disponível"} />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u.id} value={u.id} className="hover:bg-muted">
                          <span className="text-foreground">{u.title}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição do que deseja gerar</Label>
                <Input
                  placeholder="Ex: Plano detalhado para segurança digital no 6º ano"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={!selectedUnitId}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="opt-assessment"
                    checked={includeAssessment}
                    onCheckedChange={(v) => setIncludeAssessment(Boolean(v))}
                  />
                  <Label htmlFor="opt-assessment">Incluir atividade avaliativa</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="opt-slides"
                    checked={includeSlides}
                    onCheckedChange={(v) => setIncludeSlides(Boolean(v))}
                  />
                  <Label htmlFor="opt-slides">Incluir slides</Label>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ai" onClick={handleGenerate} disabled={loading || !selectedUnitId || !prompt.trim()}>
                  {loading ? "Gerando..." : "Gerar com IA"}
                </Button>
                {preview && (
                  <Button variant="institutional" onClick={handleConfirm} disabled={loading}>
                    Confirmar e salvar na unidade
                  </Button>
                )}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>
        </motion.section>

        {preview && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <Card variant="editorial">
              <CardContent className="p-6">
                <h2 className="text-foreground mb-2">Resultado</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{preview}</p>
              </CardContent>
            </Card>
          </motion.section>
        )}
      </div>
    </AppLayout>
  );
}
