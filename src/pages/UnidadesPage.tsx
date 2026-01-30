import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  FileText,
  CheckCircle2,
  Clock,
  PlayCircle,
  Edit3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDisciplineById } from "@/infra/services/firebase/disciplineService";
import { useEffect, useMemo, useState } from "react";
import { useUnitsByDiscipline } from "@/hooks/useUnitsByDiscipline";
import { deleteUnit } from "@/infra/services/firebase/unitService";

const mapStatus = (status: string) => {
  switch (status) {
    case "concluida":
      return { label: "Concluída", color: "bg-[hsl(158,64%,40%)]/10 text-[hsl(158,64%,40%)] border-[hsl(158,64%,40%)]/20" };
    case "em_andamento":
      return { label: "Em andamento", color: "bg-secondary/10 text-secondary border-secondary/20" };
    default:
      return { label: "Planejada", color: "bg-muted text-muted-foreground border-border" };
  }
};

const getStatusConfig = (status: string) => {
  const base = mapStatus(status);
  const icon = status === "concluida" ? CheckCircle2 : status === "em_andamento" ? PlayCircle : Clock;
  return { ...base, icon };
};

export default function UnidadesPage() {
  const { disciplinaId } = useParams();
  const { items, loading } = useUnitsByDiscipline(disciplinaId);
  const [disciplineHeader, setDisciplineHeader] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      if (!disciplinaId) return;
      const d = await getDisciplineById(disciplinaId);
      setDisciplineHeader(d);
    }
    load();
  }, [disciplinaId]);

  const onDelete = async (id: string) => {
    try {
      await deleteUnit(id);
      toast({ title: "Unidade removida", description: "A lista foi atualizada." });
    } catch {
      toast({ title: "Falha ao remover unidade", description: "Tente novamente." });
    }
  };

  return (
    <AppLayout showIllustrations={false}>
      <div className="space-y-8">
        {/* Header com contexto */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to="/disciplinas"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para disciplinas
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-foreground">{disciplineHeader?.name ?? "Disciplina"}</h1>
                  <Badge variant={disciplineHeader?.levelVariant ?? "muted"}>
                    {disciplineHeader?.level ?? ""}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-1">{disciplineHeader?.description ?? ""}</p>
                <div className="text-xs text-muted-foreground">
                  Aulas nas unidades: {items.reduce((acc, u) => acc + (u.lessonsCount ?? (u.plan?.length ?? 0)), 0)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to={`/disciplinas/${disciplinaId}/nova-unidade`}>
                <Button variant="institutional" size="lg">
                  <Plus className="w-4 h-4" />
                  Nova unidade
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Visão de Progressão Pedagógica */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-foreground">
              Unidades de ensino
            </h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(158,64%,40%)]" />
                Concluída
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                Em andamento
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                Planejada
              </span>
            </div>
          </div>

          {/* Timeline de Unidades */}
          <div className="relative">
            {/* Linha de progressão */}
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[hsl(158,64%,40%)] via-secondary to-muted" />

            <div className="space-y-4">
              {items.map((unit, index) => {
                const statusConfig = getStatusConfig(unit.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={unit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                  >
                    <Link to={`/unidades/${unit.id}`}>
                      <div className="relative pl-16 group">
                        {/* Indicador de status na linha */}
                        <div
                          className={`absolute left-5 top-6 w-5 h-5 rounded-full border-4 border-background ${
                            unit.status === "concluida"
                              ? "bg-[hsl(158,64%,40%)]"
                              : unit.status === "em_andamento"
                              ? "bg-secondary"
                              : "bg-muted-foreground/30"
                          }`}
                        />

                        <Card
                          variant="editorial"
                          className={`group-hover:shadow-lg transition-all ${
                            unit.status === "em_andamento"
                              ? "ring-2 ring-secondary/20"
                              : ""
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              {/* Número da unidade */}
                              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                <span className="text-lg font-display font-semibold text-muted-foreground">
                                  {index + 1}
                                </span>
                              </div>

                              {/* Conteúdo */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {unit.title}
                                  </h3>
                                  {unit.type === "ai" && (
                                    <Badge variant="ai">
                                      <Sparkles className="w-3 h-3" />
                                      Gerada por IA
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {(unit as any).description ?? ""}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <FileText className="w-4 h-4" />
                                    {(unit.lessonsCount ?? (unit as any).lessons ?? (unit.plan?.length ?? 0))} aulas
                                  </span>
                                  <Badge
                                    className={statusConfig.color}
                                    variant="outline"
                                  >
                                    <StatusIcon className="w-3 h-3" />
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                              </div>

                              {/* Ações */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100"
                                  onClick={() => {}}
                                  aria-label="Editar unidade"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
              {!loading && items.length === 0 && (
                <div className="text-sm text-muted-foreground pl-16">Nenhuma unidade encontrada.</div>
              )}
              {loading && (
                <div className="text-sm text-muted-foreground pl-16">Carregando unidades...</div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Card para nova unidade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="pl-16 relative"
        >
          <div className="absolute left-5 top-6 w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/30 bg-background" />

          <Link to={`/disciplinas/${disciplinaId}/nova-unidade`}>
            <Card
              variant="outlined"
              className="group border-dashed border-2 hover:border-primary/40"
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Adicionar nova unidade
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Crie manualmente ou gere com IA
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </AppLayout>
  );
}
