import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Plus,
  Search,
  ChevronRight,
  FileText,
  Clock,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDisciplines } from "@/hooks/useDisciplines";
import { removeDiscipline } from "@/infra/services/firebase/disciplineService";
import { useUnits } from "@/hooks/useUnits";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

const levelFilters = [
  { label: "Todos", value: "all" },
  { label: "Fundamental I", value: "fundamental1" },
  { label: "Fundamental II", value: "fundamental2" },
  { label: "Ensino Médio", value: "medio" },
];

export default function DisciplinasPage() {
  const { toast } = useToast();
  const { userId } = useUserProfile();
  const { items, loading } = useDisciplines(userId);
  const { items: units } = useUnits(userId);
  const navigate = useNavigate();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const base = items;
    const byFilter =
      filter === "all" ? base : base.filter((d) => d.levelVariant === filter);
    const bySearch = search
      ? byFilter.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
      : byFilter;
    return bySearch;
  }, [items, search, filter]);

  const countsByDiscipline = useMemo(() => {
    const map = new Map<string, { completed: number; total: number; lessons: number }>();
    for (const u of units) {
      const d = u.discipline;
      const current = map.get(d) ?? { completed: 0, total: 0, lessons: 0 };
      if (u.status === "concluida") {
        current.completed += 1;
      }
      current.total += 1;
      current.lessons += (u.lessonsCount ?? (u.plan?.length ?? 0));
      map.set(d, current);
    }
    return map;
  }, [units]);

  const onDelete = async (id: string) => {
    try {
      await removeDiscipline(id);
      toast({ title: "Disciplina removida", description: "A lista foi atualizada." });
    } catch {
      toast({ title: "Falha ao remover", description: "Tente novamente mais tarde." });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-foreground mb-1">Disciplinas</h1>
            <p className="text-muted-foreground">
              Gerencie suas disciplinas e acesse os planos de aula
            </p>
          </div>
          <Link to="/disciplinas/nova">
            <Button variant="institutional" size="lg">
              <Plus className="w-4 h-4" />
              Nova disciplina
            </Button>
          </Link>
        </motion.div>

        {/* Filtros e Busca */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4"
        >
          {/* Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar disciplina..."
              variant="editorial"
              className="pl-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filtros de nível */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            {levelFilters.map((opt) => (
              <Button
                key={opt.value}
                variant={opt.value === filter ? "institutional" : "outline"}
                size="sm"
                className="shrink-0 transition-colors duration-200"
                aria-pressed={opt.value === filter}
                onClick={() => setFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Grid de Disciplinas - Layout Visual Diferenciado */}
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((discipline, index) => (
            <motion.div
              key={discipline.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Link to={`/disciplinas/${discipline.id}/unidades`}>
                <Card variant="editorial" className="group h-full overflow-hidden">
                  {/* Barra de progresso decorativa no topo */}
                  <div className="h-1.5 bg-muted">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-[hsl(174,50%,28%)] transition-all duration-500"
                      style={{
                        width: `${
                          (() => {
                            const c = countsByDiscipline.get(discipline.id);
                            if (!c || c.total === 0) return 0;
                            return Math.round((c.completed / c.total) * 100);
                          })()
                        }%`,
                      }}
                    />
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Ícone com gradiente */}
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-display text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {discipline.name}
                          </h3>
                          <Badge variant={discipline.levelVariant}>
                            {discipline.level}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {discipline.description ?? ""}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          <span>Aulas nas unidades: {countsByDiscipline.get(discipline.id)?.lessons ?? 0}</span>
                          {typeof (discipline as any).weekly === "number" && (
                            <span>Aulas/semana: {(discipline as any).weekly}</span>
                          )}
                        </div>

                        {/* Metadados */}
                        <div className="flex items-center gap-5 text-sm">
                          <span className="flex items-center gap-1.5 text-foreground">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <strong>{countsByDiscipline.get(discipline.id)?.completed ?? 0}</strong>
                            <span className="text-muted-foreground">
                              / {countsByDiscipline.get(discipline.id)?.total ?? 0} unidades
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {discipline.lastAccess ?? ""}
                          </span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.preventDefault()}
                              aria-label="Ações da disciplina"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                navigate("/disciplinas/nova", { state: { discipline } });
                              }}
                            >
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                setConfirmDeleteId(discipline.id);
                              }}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="col-span-2 text-sm text-muted-foreground">
              Nenhuma disciplina encontrada.
            </div>
          )}
          {loading && (
            <div className="col-span-2 text-sm text-muted-foreground">
              Carregando disciplinas...
            </div>
          )}
        </div>

        {/* Card de Nova Disciplina */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Link to="/disciplinas/nova">
            <Card
              variant="outlined"
              className="group border-dashed border-2 hover:border-primary/40 cursor-pointer"
            >
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  Adicionar nova disciplina
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure uma nova disciplina para começar a planejar
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <div className="text-sm text-foreground">Deseja realmente excluir esta disciplina?</div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmDeleteId) {
                  await onDelete(confirmDeleteId);
                }
                setConfirmDeleteId(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
