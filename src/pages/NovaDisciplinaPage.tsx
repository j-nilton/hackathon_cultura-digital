import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Check,
  GraduationCap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { createDiscipline } from "@/infra/services/firebase/disciplineService";

const levels = [
  {
    id: "fundamental1",
    name: "Fundamental I",
    years: ["1º", "2º", "3º", "4º", "5º"],
    description: "Anos iniciais (1º ao 5º ano)",
    color: "from-primary/20 to-primary/5 border-primary/30",
    selected: "bg-primary/10 border-primary",
  },
  {
    id: "fundamental2",
    name: "Fundamental II",
    years: ["6º", "7º", "8º", "9º"],
    description: "Anos finais (6º ao 9º ano)",
    color: "from-secondary/20 to-secondary/5 border-secondary/30",
    selected: "bg-secondary/10 border-secondary",
  },
  {
    id: "medio",
    name: "Ensino Médio",
    years: ["1º EM", "2º EM", "3º EM"],
    description: "Ensino Médio (1º ao 3º ano)",
    color: "from-accent/20 to-accent/5 border-accent/30",
    selected: "bg-accent/10 border-accent",
  },
];

export default function NovaDisciplinaPage() {
  const location = useLocation() as { state?: { discipline?: any } };
  const editing = location.state?.discipline ?? null;
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [weekly, setWeekly] = useState<number | undefined>(editing?.weekly ?? undefined);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useUserProfile();

  const currentLevel = levels.find((l) => l.id === (selectedLevel ?? editing?.levelVariant ?? null));

  const original = useMemo(() => {
    if (!editing) return null;
    return {
      name: editing.name ?? "",
      description: editing.description ?? "",
      weekly: editing.weekly ?? undefined,
      levelVariant: editing.levelVariant ?? null,
      level: editing.level ?? null,
    };
  }, [editing]);

  const normalizedCurrent = {
    name: name.trim(),
    description: (description ?? "").trim(),
    weekly: weekly ?? undefined,
    levelVariant: selectedLevel ?? editing?.levelVariant ?? null,
    level: selectedYear ?? editing?.level ?? null,
  };

  const hasRequired = !!normalizedCurrent.name && !!normalizedCurrent.levelVariant && !!normalizedCurrent.level;
  const hasChanges =
    !!original &&
    (original.name !== normalizedCurrent.name ||
      (original.description ?? "") !== normalizedCurrent.description ||
      (original.weekly ?? undefined) !== normalizedCurrent.weekly ||
      (original.levelVariant ?? null) !== normalizedCurrent.levelVariant ||
      (original.level ?? null) !== normalizedCurrent.level);
  const isEditing = !!editing;
  const disableReason = !hasRequired
    ? "Preencha Nome, Nível e Ano/Série"
    : !hasChanges && isEditing
    ? "Nenhuma alteração detectada"
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const levelVariant = selectedLevel ?? editing?.levelVariant ?? null;
    const level = selectedYear ?? editing?.level ?? null;
    const weeklySafe =
      typeof weekly === "number" && Number.isFinite(weekly) ? Math.min(10, Math.max(1, weekly)) : undefined;
    if (!userId || !levelVariant || !level || !name.trim()) return;
    setIsLoading(true);
    try {
      if (editing?.id) {
        await createDiscipline(editing.id, {
          name,
          level,
          levelVariant: levelVariant as "fundamental1" | "fundamental2" | "medio",
          unitsCount: editing.unitsCount ?? 0,
          lastAccess: new Date().toLocaleDateString("pt-BR"),
          description: description.trim() || undefined,
          weekly: weeklySafe,
          userId,
          createdAt: editing.createdAt ?? Date.now(),
          updatedAt: Date.now(),
        });
        toast({ title: "Disciplina atualizada", description: "Alterações salvas." });
      } else {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : String(Date.now());
        await createDiscipline(id, {
          name,
          level,
          levelVariant: levelVariant as "fundamental1" | "fundamental2" | "medio",
          unitsCount: 0,
          lastAccess: new Date().toLocaleDateString("pt-BR"),
          description: description.trim() || undefined,
          weekly: weeklySafe,
          userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        toast({ title: "Disciplina criada", description: "Sua disciplina foi salva." });
      }
      navigate("/disciplinas");
    } catch {
      toast({ title: "Falha ao criar disciplina", description: "Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout showIllustrations={false}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="text-foreground mb-2">Nova Disciplina</h1>
          <p className="text-muted-foreground">
            Configure os detalhes da disciplina que você vai ensinar
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seleção de Nível */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Label className="text-base font-semibold mb-4 block">
              Nível de ensino
            </Label>
            <div className="grid gap-4 md:grid-cols-3">
              {levels.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => {
                    setSelectedLevel(level.id);
                    setSelectedYear(null);
                  }}
                  className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                    (selectedLevel ?? editing?.levelVariant) === level.id
                      ? level.selected
                      : `bg-gradient-to-br ${level.color} hover:border-opacity-60`
                  }`}
                >
                  {(selectedLevel ?? editing?.levelVariant) === level.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <GraduationCap
                    className={`w-6 h-6 mb-3 ${
                      (selectedLevel ?? editing?.levelVariant) === level.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <h3 className="font-semibold text-foreground mb-1">
                    {level.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {level.description}
                  </p>
                </button>
              ))}
            </div>
          </motion.section>

          {/* Seleção de Ano/Série */}
          {currentLevel && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Label className="text-base font-semibold mb-4 block">
                Ano/Série
              </Label>
              <div className="flex flex-wrap gap-3">
                {currentLevel.years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setSelectedYear(year)}
                    className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                      (selectedYear ?? editing?.level) === year
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:border-primary/40"
                    }`}
                  >
                    {year}
                    {!year.includes("EM") && " Ano"}
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {/* Detalhes da Disciplina */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card variant="editorial">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  Detalhes da Disciplina
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da disciplina *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Cultura Digital"
                    variant="editorial"
                    inputSize="lg"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva brevemente os objetivos e conteúdos da disciplina..."
                    className="min-h-[100px] resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekly">Carga horária semanal</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="weekly"
                      type="number"
                      placeholder="2"
                      variant="editorial"
                      className="w-24"
                      min={1}
                      max={10}
                      value={weekly ?? ""}
                      onChange={(e) => setWeekly(e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <span className="text-muted-foreground">aulas por semana</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Alinhamento BNCC */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card variant="muted">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">BNCC</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Alinhamento com a BNCC
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Os planos de aula e atividades gerados serão automaticamente
                      alinhados às competências de Cultura Digital da BNCC para o
                      nível selecionado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Botões de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex items-center justify-end gap-4 pt-4"
          >
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  variant={disableReason ? "outline" : "institutional"}
                  size="lg"
                  disabled={isEditing ? !hasRequired || !hasChanges || isLoading : !selectedLevel || !selectedYear || isLoading}
                  className={disableReason ? "opacity-70 cursor-not-allowed" : ""}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      {editing ? "Salvar alterações" : "Criar disciplina"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {disableReason && <TooltipContent>{disableReason}</TooltipContent>}
            </Tooltip>
          </motion.div>
        </form>
      </div>
    </AppLayout>
  );
}
