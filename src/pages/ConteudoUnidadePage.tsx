import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getUnitById, updateUnit, removeUnit } from "@/infra/services/firebase/unitService";
import { getDisciplineById } from "@/infra/services/firebase/disciplineService";
import {
  ArrowLeft,
  Sparkles,
  FileText,
  CheckCircle2,
  PlayCircle,
  BookOpen,
  Target,
  Users,
  Clock,
  Edit3,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  Presentation,
  ClipboardCheck,
  Lightbulb,
} from "lucide-react";

type TabType = "plano" | "atividade" | "slides";

export default function ConteudoUnidadePage() {
  const { unidadeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false); // evita autosave antes de carregar dados
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"manual" | "ai">("manual");
  const [status, setStatus] = useState<"em_andamento" | "concluida" | "planejada">("em_andamento");
  const [bnccSkills, setBnccSkills] = useState<string[]>([]);
  const [disciplineId, setDisciplineId] = useState<string>("");
  const [disciplineName, setDisciplineName] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState<number>(50);
  const [lessons, setLessons] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [objectiveInput, setObjectiveInput] = useState("");
  const [planItems, setPlanItems] = useState<Array<{ title: string; minutes: number; description: string }>>([]);
  const [planTitle, setPlanTitle] = useState("");
  const [planMinutes, setPlanMinutes] = useState<number>(30);
  const [planDescription, setPlanDescription] = useState("");
  const [criteriaItems, setCriteriaItems] = useState<Array<{ name: string; weight: number }>>([]);
  const [criteriaName, setCriteriaName] = useState("");
  const [criteriaWeight, setCriteriaWeight] = useState<number>(10);

  useEffect(() => {
    async function load() {
      if (!unidadeId) return;
      setLoading(true);
      try {
        const unit = await getUnitById(unidadeId);
        if (!unit) {
          setError("Unidade não encontrada");
          setLoading(false);
          return;
        }
        setTitle(unit.title);
        setType(unit.type);
        setStatus(unit.status);
        setBnccSkills(unit.bnccSkills ?? []);
        setDisciplineId(unit.discipline);
        setDescription(unit.description ?? ""); // hidrata sempre, inclusive vazio
        setObjectives(unit.objectives ?? []);
        setPlanItems(unit.plan ?? []);
        setCriteriaItems(unit.criteria ?? []);
        setLessons(unit.lessonsCount ?? (unit.plan?.length ?? 0));
        if (typeof unit.durationMinutes === "number") setDurationMinutes(unit.durationMinutes);
        if (unit.discipline) {
          const d = await getDisciplineById(unit.discipline);
          setDisciplineName(d?.name ?? "");
          setLevel(d?.level ?? "");
        }
        setError(null);
        setHydrated(true); // marca como hidratado após carregar
      } catch {
        setError("Falha ao carregar unidade");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [unidadeId]);

  const savePartial = async (
    partial: Record<string, unknown>,
    options?: { silent?: boolean; successTitle?: string }
  ) => {
    if (!unidadeId) return;
    try {
      if (!options?.silent) {
        setIsSaving(true);
      }
      await updateUnit(unidadeId, partial);
      if (!options?.silent) {
        toast({
          title: options?.successTitle ?? "Unidade atualizada",
          description: "Alterações salvas com sucesso.",
        });
      }
    } catch {
      if (!options?.silent) {
        toast({ title: "Falha ao salvar", description: "Tente novamente." });
      }
    } finally {
      if (!options?.silent) {
        setIsSaving(false);
      }
    }
  };

  useEffect(() => {
    if (!hydrated) return; // não salvar antes da hidratação inicial
    const t = setTimeout(() => {
      console.debug("[unit][autosave] commit: detalhes", {
        unidadeId,
        description,
        lessons,
        durationMinutes,
      });
      savePartial({ description, lessonsCount: lessons, durationMinutes }, { silent: true });
    }, 600);
    return () => clearTimeout(t);
  }, [description, lessons, durationMinutes, hydrated]);

  useEffect(() => {
    if (!hydrated) return; // não salvar antes da hidratação inicial
    const t = setTimeout(() => {
      console.debug("[unit][autosave] commit: conteudo", {
        unidadeId,
        objectives,
        bnccSkills,
      });
      savePartial({ objectives, bnccSkills }, { silent: true });
    }, 600);
    return () => clearTimeout(t);
  }, [objectives, bnccSkills, hydrated]);

const assessment = {
  title: "Atividade Avaliativa: Cidadãos Digitais em Ação",
  description:
    "Os alunos deverão criar um guia ilustrado de boas práticas online, contemplando pelo menos 5 situações do cotidiano digital.",
  criteria: [
    { name: "Identificação de situações relevantes", weight: "25%" },
    { name: "Clareza na explicação das boas práticas", weight: "25%" },
    { name: "Criatividade e organização visual", weight: "25%" },
    { name: "Alinhamento com os conceitos estudados", weight: "25%" },
  ],
};

  const [activeTab, setActiveTab] = useState<TabType>("plano");
  const [expandedSection, setExpandedSection] = useState<string | null>("development");

  const handleSave = async () => {
    if (!unidadeId) return;
    try {
      setIsSaving(true);
      await updateUnit(unidadeId, {
        title,
        type,
        status,
        description,
        bnccSkills,
        objectives,
        plan: planItems,
        criteria: criteriaItems,
        lessonsCount: lessons,
        durationMinutes,
      });
      toast({ title: "Unidade atualizada", description: "Alterações salvas com sucesso." });
    } catch {
      toast({ title: "Falha ao salvar", description: "Tente novamente." });
    } finally {
      setIsSaving(false);
    }
  };

  const commitSilent = async () => {
    if (!unidadeId) return;
    await savePartial(
      {
        title,
        type,
        status,
        description,
        bnccSkills,
        objectives,
        plan: planItems,
        criteria: criteriaItems,
        lessonsCount: lessons,
        durationMinutes,
      },
      { silent: true }
    );
  };

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        commitSilent();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [title, type, status, description, bnccSkills, objectives, planItems, criteriaItems, lessons, durationMinutes, unidadeId]);

  const handleDelete = async () => {
    if (!unidadeId) return;
    try {
      await removeUnit(unidadeId);
      toast({ title: "Unidade removida", description: "Voltando para a lista." });
      navigate(`/disciplinas/${disciplineId}/unidades`);
    } catch {
      toast({ title: "Falha ao remover", description: "Tente novamente." });
    }
  };

  const tabs = [
    { id: "plano" as const, label: "Plano de Aula", icon: BookOpen },
    { id: "atividade" as const, label: "Atividade Avaliativa", icon: ClipboardCheck },
    { id: "slides" as const, label: "Slides", icon: Presentation },
  ];

  if (loading) {
    return (
      <AppLayout showIllustrations={false}>
        <div className="p-6 text-sm text-muted-foreground">Carregando unidade...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout showIllustrations={false}>
        <div className="p-6 text-sm text-destructive">{error}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showIllustrations={false}>
      <div className="max-w-8xl mx-auto" onBlurCapture={commitSilent}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link
            to={`/disciplinas/${disciplineId}/unidades`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para unidades
          </Link>

          {/* Info da unidade */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {type === "ai" && (
                  <Badge variant="ai">
                    <Sparkles className="w-3 h-3" />
                    Gerada por IA
                  </Badge>
                )}
                <Badge variant="muted">{level}</Badge>
              </div>
              <h1 className="text-foreground mb-3">{title}</h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-6 mt-6 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  {lessons} aulas
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {`${lessons * (durationMinutes ?? 0)} min ( ${durationMinutes ?? 0} min/aula )`}
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {disciplineName || disciplineId}
                </span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-3">
              <div className="w-56">
                <Select
                  value={status}
                  onValueChange={async (v) => {
                    const next = v as typeof status;
                    setStatus(next);
                    if (!unidadeId) return;
                    try {
                      setIsSaving(true);
                      await updateUnit(unidadeId, { status: next });
                      toast({ title: "Status atualizado", description: "O progresso foi salvo." });
                    } catch {
                      toast({ title: "Falha ao atualizar status", description: "Tente novamente." });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                >
                  <SelectTrigger aria-label="Alterar status da unidade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concluida" className="hover:bg-muted focus:bg-muted focus:text-foreground">
                      <span className="flex items-center gap-2 text-foreground">
                        <CheckCircle2 className="w-4 h-4" /> Concluída
                      </span>
                    </SelectItem>
                    <SelectItem value="em_andamento" className="hover:bg-muted focus:bg-muted focus:text-foreground">
                      <span className="flex items-center gap-2 text-foreground">
                        <PlayCircle className="w-4 h-4" /> Em andamento
                      </span>
                    </SelectItem>
                    <SelectItem value="planejada" className="hover:bg-muted focus:bg-muted focus:text-foreground">
                      <span className="flex items-center gap-2 text-foreground">
                        <Clock className="w-4 h-4" /> Planejada
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
              <Button variant="institutional" size="sm" onClick={handleSave} disabled={isSaving}>
                <Edit3 className="w-4 h-4" />
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Remover
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Objetivos e BNCC */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 mb-10"
        >
          {/* Detalhes da Unidade */}
          <Card variant="editorial" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                Detalhes da Unidade
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descreva o que será abordado nesta unidade..."
                  className="min-h-[100px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número de aulas</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={lessons}
                    onChange={(e) => setLessons(Number(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duração por aula (min)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value) || 50)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objetivos */}
          <Card variant="editorial" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                Objetivos de Aprendizagem
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Input
                  placeholder="Adicionar objetivo"
                  value={objectiveInput}
                  onChange={(e) => setObjectiveInput(e.target.value)}
                />
                <Button
                  type="button"
                  variant="institutional"
                  onClick={() => {
                    const v = objectiveInput.trim();
                    if (!v) return;
                    setObjectives((prev) => [...prev, v]);
                    setObjectiveInput("");
                  }}
                >
                  Adicionar
                </Button>
              </div>
              <ul className="space-y-3">
                {objectives.map((objective, index) => (
                  <li key={index} className="grid grid-cols-[auto_1fr_auto] items-start gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground break-words">{objective}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="justify-self-end self-start"
                      onClick={() => {
                        const next = [...objectives];
                        next.splice(index, 1);
                        setObjectives(next);
                      }}
                    >
                      Remover
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Competências BNCC - Redesign */}
          <Card variant="muted" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">BNCC</span>
                </div>
                Habilidades da BNCC
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Adicionar habilidades (código — descrição, uma por linha)</Label>
                <Textarea
                  placeholder={"Ex:\nEF06CI12 — Identificar componentes de sistemas digitais\nEF07LP03 — Produzir textos multimodais com propósito definido"}
                  className="min-h-[100px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const value = (e.target as HTMLTextAreaElement).value;
                      const lines = value
                        .split(/\r?\n/)
                        .map((s) => s.trim())
                        .filter(Boolean);
                      if (lines.length === 0) return;
                      setBnccSkills((prev) => Array.from(new Set([...prev, ...lines])));
                      (e.target as HTMLTextAreaElement).value = "";
                    }
                  }}
                />
              </div>
              {/* Tabela de habilidades */}
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Habilidade</TableHead>
                      <TableHead className="w-[120px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bnccSkills.map((skill, idx) => {
                      const parts = skill.split(/\\s[-—]\\s/);
                      const code = parts[0] ?? skill;
                      const desc = parts[1] ?? "";
                      return (
                        <TableRow key={skill}>
                          <TableCell>
                            <div className="space-y-1">
                              <span className="font-medium text-foreground">{code}</span>
                              {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const next = [...bnccSkills];
                                  next.splice(idx, 1);
                                  setBnccSkills(next);
                                }}
                              >
                                Remover
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {bnccSkills.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-sm text-muted-foreground">
                          Nenhuma habilidade adicionada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-muted-foreground">
                As habilidades acima serão consideradas no planejamento desta unidade.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navegação por abas - Estilo Editorial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Tabs customizadas */}
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conteúdo das abas */}
          <AnimatePresence mode="wait">
            {activeTab === "plano" && (
              <motion.div
                key="plano"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <Card variant="editorial">
                  <CardHeader>
                    <CardTitle>Plano de Aula</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid sm:grid-cols-3 gap-3">
                      <Input placeholder="Título do card" value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} />
                      <Input
                        type="number"
                        placeholder="Tempo (min)"
                        value={planMinutes}
                        onChange={(e) => setPlanMinutes(Number(e.target.value))}
                      />
                      <Button
                        type="button"
                        variant="institutional"
                        onClick={() => {
                          const t = planTitle.trim();
                          if (!t || planMinutes <= 0) return;
                          const next = [...planItems, { title: t, minutes: planMinutes, description: planDescription }];
                          setPlanItems(next);
                          setPlanTitle("");
                          setPlanMinutes(30);
                          setPlanDescription("");
                        }}
                      >
                        Adicionar card
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Descrição da atividade"
                      value={planDescription}
                      onChange={(e) => setPlanDescription(e.target.value)}
                    />
                    <div className="space-y-2">
                      {planItems.map((item, idx) => (
                        <Card key={idx} variant="outlined">
                          <CardContent className="p-0">
                            <button
                              onClick={() =>
                                setExpandedSection(expandedSection === `plan-${idx}` ? null : `plan-${idx}`)
                              }
                              className="w-full flex items-center justify-between p-4 text-left"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                                  <span className="text-sm font-display">{idx + 1}</span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                                  <span className="text-xs text-muted-foreground">{item.minutes} min</span>
                                </div>
                              </div>
                              {expandedSection === `plan-${idx}` ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                            {expandedSection === `plan-${idx}` && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-4 pb-4">
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                <div className="mt-3 flex gap-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                      const next = [...planItems];
                                      next.splice(idx, 1);
                                      setPlanItems(next);
                                    }}
                                  >
                                    Remover
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "atividade" && (
              <motion.div
                key="atividade"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card variant="muted">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                        <ClipboardCheck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                          {assessment.title}
                        </h3>
                        <p className="text-foreground leading-relaxed">
                          {assessment.description}
                        </p>
                      </div>
                    </div>

                    <div className="bg-background rounded-xl p-6 border border-border/70 space-y-4">
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-secondary" />
                        Critérios de Avaliação
                      </h4>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <Input placeholder="Nome do critério" value={criteriaName} onChange={(e) => setCriteriaName(e.target.value)} />
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Valor"
                          value={criteriaWeight}
                          onChange={(e) => setCriteriaWeight(Number(e.target.value))}
                        />
                        <Button
                          type="button"
                          variant="institutional"
                          onClick={() => {
                            const name = criteriaName.trim();
                            const weight = criteriaWeight;
                            if (!name || weight <= 0) return;
                            const sum = criteriaItems.reduce((acc, c) => acc + c.weight, 0) + weight;
                            if (sum > 100) {
                              toast({ title: "Limite excedido", description: "A soma dos valores não pode ultrapassar 100." });
                              return;
                            }
                            setCriteriaItems((prev) => [...prev, { name, weight }]);
                            setCriteriaName("");
                            setCriteriaWeight(10);
                          }}
                        >
                          Adicionar critério
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {criteriaItems.map((criterion, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <span className="text-sm text-foreground">{criterion.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="muted">{criterion.weight}</Badge>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const next = [...criteriaItems];
                                  next.splice(index, 1);
                                  setCriteriaItems(next);
                                }}
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "slides" && (
              <motion.div
                key="slides"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card variant="muted">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted-foreground/10 flex items-center justify-center mx-auto mb-6">
                      <Presentation className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      Slides não gerados
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Você pode gerar uma apresentação de slides baseada no
                      conteúdo desta unidade.
                    </p>
                    <Button variant="ai" size="lg">
                      <Sparkles className="w-4 h-4" />
                      Gerar slides com IA
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Dica pedagógica */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8"
        >
          <Card variant="muted">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Dica pedagógica
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Considere adaptar as atividades de acordo com a realidade de
                    acesso tecnológico dos seus alunos. Para turmas com acesso
                    limitado, as dinâmicas podem ser realizadas com materiais
                    impressos ou utilizando o celular como ferramenta de apoio.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div> */}
      </div>
    </AppLayout>
  );
}
