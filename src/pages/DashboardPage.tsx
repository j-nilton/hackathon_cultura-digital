import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  Sparkles,
  Clock,
  TrendingUp,
  Calendar,
  ChevronRight,
  FileText,
  Lightbulb,
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDisciplines } from "@/hooks/useDisciplines";
import { useUnits } from "@/hooks/useUnits";
import { useToast } from "@/hooks/use-toast";

function firstName(full?: string) {
  if (!full) return "";
  const t = full.trim().split(" ");
  return t[0] ?? full;
}

const quickActions = [
  {
    title: "Nova Disciplina",
    description: "Configure uma nova disciplina para planejar",
    icon: BookOpen,
    href: "/disciplinas/nova",
    variant: "default" as const,
  },
  {
    title: "Gerar com IA",
    description: "Crie planos de aula automaticamente",
    icon: Sparkles,
    href: "/gerador",
    variant: "ai" as const,
  },
];

export default function DashboardPage() {
  const { profile, userId } = useUserProfile();
  const { items: disciplines } = useDisciplines(userId);
  const { items: units } = useUnits(userId);
  const { toast } = useToast();

  return (
    <AppLayout>
      <div className="space-y-10">
        {/* Header Contextual */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <p className="text-muted-foreground mb-1">Olá, professor(a) {profile?.name ?? "Professor(a)"}!</p>
            <h1 className="text-foreground">Seu painel pedagógico</h1>
          </div>
        </motion.div>

        {/* Layout Assimétrico Principal */}
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          {/* Coluna Principal */}
          <div className="space-y-8">
            {/* Ações Rápidas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {quickActions.map((action) => (
                <Link key={action.title} to={action.href}>
                  <Card
                    variant={action.variant === "ai" ? "ai" : "interactive"}
                    className="h-full group border border-border/70"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            action.variant === "ai"
                              ? "bg-[hsl(262,52%,40%)] text-white dark:bg-[hsl(262,52%,55%)] dark:text-white"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          <action.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-foreground">
                            {action.description}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </motion.div>

            {/* Disciplinas Recentes */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl text-foreground">Suas disciplinas</h2>
                <Link to="/disciplinas">
                  <Button variant="ghost" size="sm" className="text-primary">
                    Ver todas
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {disciplines.map((discipline, index) => (
                  <motion.div
                    key={discipline.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Link to={`/disciplinas/${discipline.id}/unidades`}>
                      <Card variant="editorial" className="group">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                              <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                  {discipline.name}
                                </h3>
                                <Badge variant={discipline.levelVariant}>
                                  {discipline.level}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5" />
                                  {units.filter((u) => u.discipline === discipline.id).length} unidades
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  {discipline.lastAccess}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <Link to="/disciplinas/nova">
                <Button variant="institutional" className="w-full mt-4">
                  <Plus className="w-4 h-4" />
                  Adicionar nova disciplina
                </Button>
              </Link>
            </motion.section>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-0">
            {/* Resumo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {/* <Card variant="warm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                    <h3 className="font-display font-semibold text-foreground">
                      Este mês
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Planos criados
                      </span>
                      <span className="text-2xl font-display font-semibold text-foreground">
                        12
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Gerados por IA
                      </span>
                      <span className="text-2xl font-display font-semibold text-[hsl(262,52%,55%)]">
                        7
                      </span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Tempo economizado
                      </span>
                      <span className="text-lg font-semibold text-primary">
                        ~5h
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </motion.div>

            {/* Dica do dia */}
            {/* <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card variant="muted">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-accent" />
                    </div>
                    <h3 className="font-medium text-foreground">Dica pedagógica</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ao planejar atividades de Cultura Digital, considere sempre a
                    realidade de acesso tecnológico dos seus alunos. A BNCC
                    recomenda atividades que possam ser adaptadas para diferentes
                    contextos.
                  </p>
                </CardContent>
              </Card>
            </motion.div> */}

            {/* Últimas unidades */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <h3 className="font-medium text-foreground mb-4">
                Unidades recentes
              </h3>
              <div className="space-y-3">
                {units
                  .slice()
                  .sort((a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0))
                  .slice(0, 3)
                  .map((unit) => {
                    const d = disciplines.find((disc) => disc.id === unit.discipline);
                    const level = d?.level ?? "";
                    return (
                  <Link key={unit.id} to={`/unidades/${unit.id}`}>
                    <div className="group p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-card transition-all">
                      <div className="flex items-start gap-3">
                        {unit.type === "ai" ? (
                          <Badge variant="ai" className="shrink-0">
                            <Sparkles className="w-3 h-3" />
                            IA
                          </Badge>
                        ) : (
                          <Badge variant="muted" className="shrink-0">
                            Manual
                          </Badge>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                {unit.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                                {d?.name ?? ""} {level ? `- ${level}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                    );
                  })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
