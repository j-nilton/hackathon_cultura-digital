import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileText,
  Wand2,
  BookOpen,
  Target,
  Lightbulb,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { createUnit } from "@/infra/services/firebase/unitService";
import { generateFromPrompt } from "@/infra/services/ai";
import { Checkbox } from "@/components/ui/checkbox";

export default function NovaUnidadePage() {
  const { disciplinaId } = useParams();
  const navigate = useNavigate();
  const [creationType, setCreationType] = useState<"manual" | "ai" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lessons, setLessons] = useState<number>(1);
  const [durationText, setDurationText] = useState("");
  const [objectivesText, setObjectivesText] = useState("");
  const [bnccSkills, setBnccSkills] = useState<string[]>([]);
  const [bnccInput, setBnccInput] = useState("");
  const [includeAssessment, setIncludeAssessment] = useState(false);
  const [includeSlides, setIncludeSlides] = useState(false);
  const { userId } = useUserProfile();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !disciplinaId) return;
    setIsLoading(true);
    try {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now());
      const type = creationType ?? "manual";
      const unitTitle = type === "ai" ? aiPrompt.trim() || "Unidade gerada por IA" : title.trim();
      if (!unitTitle) {
        setIsLoading(false);
        return;
      }
      const durationMinutes = (() => {
        const m = durationText.match(/\d+/);
        return m ? Number(m[0]) : undefined;
      })();
      const objectives =
        objectivesText
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0) ?? [];
      const parsedSkills =
        bnccInput
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      const finalBnccSkills = Array.from(new Set([...(bnccSkills ?? []), ...parsedSkills]));
      let generatedDescription: string | undefined = undefined;
      if (type === "ai") {
        const text = await generateFromPrompt(aiPrompt, {
          includeAssessment,
          includeSlides,
        });
        generatedDescription = text;
      }
      await createUnit(id, {
        title: unitTitle,
        discipline: String(disciplinaId),
        type,
        status: "em_andamento",
        userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        description: (generatedDescription ?? description.trim()) || undefined,
        bnccSkills: finalBnccSkills.length ? finalBnccSkills : undefined,
        objectives,
        lessonsCount: Number.isFinite(lessons) ? Math.max(1, lessons) : 1,
        durationMinutes,
      });
      toast({ title: "Unidade criada", description: "Sua unidade foi salva." });
      navigate(`/disciplinas/${disciplinaId}/unidades`);
    } catch {
      toast({ title: "Falha ao criar unidade", description: "Tente novamente." });
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
          <h1 className="text-foreground mb-2">Nova Unidade</h1>
          <p className="text-muted-foreground">
            Crie uma nova unidade de ensino para sua disciplina
          </p>
        </motion.div>

        {/* Seleção de tipo de criação */}
        {!creationType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Opção Manual */}
            <button
              type="button"
              onClick={() => setCreationType("manual")}
              className="text-left"
            >
              <Card
                variant="editorial"
                className="h-full group hover:shadow-lg transition-all"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <FileText className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    Criar manualmente
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Defina você mesmo o tema, objetivos e conteúdo da unidade
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Controle total sobre o conteúdo
                    </li>
                    <li className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Ideal para temas específicos
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </button>

            {/* Opção IA */}
            <button
              type="button"
              onClick={() => setCreationType("ai")}
              className="text-left"
            >
              <Card
                variant="ai"
                className="h-full group hover:shadow-lg transition-all border border-border/70"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-[hsl(262,52%,40%)] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-[hsl(262,52%,40%)] transition-colors">
                    Gerar com IA
                  </h3>
                  <p className="text-foreground mb-4">
                    Deixe a inteligência artificial criar o plano de aula completo
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-[hsl(262,52%,40%)]" />
                      Geração automática de conteúdo
                    </li>
                    <li className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-[hsl(262,52%,40%)]" />
                      Alinhamento automático à BNCC
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </button>
          </motion.div>
        )}

        {/* Formulário Manual */}
        {creationType === "manual" && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <Card variant="editorial">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  Detalhes da Unidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da unidade *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Cidadania Digital e Direitos Online"
                    variant="editorial"
                    inputSize="lg"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o que será abordado nesta unidade..."
                    className="min-h-[100px] resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lessons">Número de aulas</Label>
                    <Input
                      id="lessons"
                      type="number"
                      placeholder="3"
                      variant="editorial"
                      min={1}
                      max={20}
                      value={lessons}
                      onChange={(e) => setLessons(Number(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração por aula</Label>
                    <Input
                      id="duration"
                      placeholder="50 minutos"
                      variant="editorial"
                      value={durationText}
                      onChange={(e) => setDurationText(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objectives">Objetivos de aprendizagem</Label>
                  <Textarea
                    id="objectives"
                    placeholder="Liste os objetivos que os alunos devem alcançar..."
                    className="min-h-[80px] resize-none"
                    value={objectivesText}
                    onChange={(e) => setObjectivesText(e.target.value)}
                  />
                </div>

                {/* Habilidades BNCC */}
                <div className="space-y-2">
                  <Label>Habilidades BNCC (uma por linha)</Label>
                  <Textarea
                    placeholder={"Ex:\nEF06CI03\nEF07LP03"}
                    value={bnccInput}
                    className="min-h-[80px]"
                    onChange={(e) => setBnccInput(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreationType(null)}
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                type="submit"
                variant="institutional"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    Criar unidade
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        )}

        {/* Formulário IA */}
        {creationType === "ai" && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <Card variant="ai">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(262,52%,55%)] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  Geração com IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="p-4 rounded-lg bg-muted border border-border">
                  <p className="text-sm text-foreground">
                    Descreva o tema ou assunto que você deseja abordar. Nossa IA
                    irá gerar um plano de aula completo, incluindo objetivos,
                    atividades e avaliação — tudo alinhado à BNCC.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Tema da unidade *</Label>
                  <Input
                    id="topic"
                    placeholder="Ex: Segurança na internet e proteção de dados pessoais"
                    variant="editorial"
                    inputSize="lg"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Detalhes adicionais (opcional)</Label>
                  <Textarea
                    id="details"
                    placeholder="Adicione contexto, requisitos específicos ou abordagens que deseja incluir..."
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-lessons">Número de aulas</Label>
                    <Input
                      id="ai-lessons"
                      type="number"
                      placeholder="3"
                      variant="editorial"
                      min={1}
                      max={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Incluir</Label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="ai-include-assessment"
                          checked={includeAssessment}
                          onCheckedChange={(v) => setIncludeAssessment(Boolean(v))}
                        />
                        <Label htmlFor="ai-include-assessment">Atividade avaliativa</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="ai-include-slides"
                          checked={includeSlides}
                          onCheckedChange={(v) => setIncludeSlides(Boolean(v))}
                        />
                        <Label htmlFor="ai-include-slides">Slides</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview do que será gerado */}
            <Card variant="muted">
              <CardContent className="p-6">
                <h3 className="font-medium text-foreground mb-3">
                  O que será gerado:
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(262,52%,55%)]" />
                    Plano de aula detalhado com metodologia
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(262,52%,55%)]" />
                    Objetivos alinhados às competências da BNCC
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(262,52%,55%)]" />
                    Sugestões de recursos e materiais
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(262,52%,55%)]" />
                    Atividade avaliativa com critérios
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreationType(null)}
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                type="submit"
                variant="ai"
                size="lg"
                disabled={isLoading || !aiPrompt.trim()}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Gerar com IA
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        )}
      </div>
    </AppLayout>
  );
}
