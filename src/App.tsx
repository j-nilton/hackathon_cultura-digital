import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CadastroPage from "./pages/CadastroPage";
import DashboardPage from "./pages/DashboardPage";
import DisciplinasPage from "./pages/DisciplinasPage";
import NovaDisciplinaPage from "./pages/NovaDisciplinaPage";
import UnidadesPage from "./pages/UnidadesPage";
import NovaUnidadePage from "./pages/NovaUnidadePage";
import ConteudoUnidadePage from "./pages/ConteudoUnidadePage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import IAGeradorPage from "./pages/IAGeradorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redireciona a raiz para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Autenticação */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Disciplinas */}
          <Route path="/disciplinas" element={<DisciplinasPage />} />
          <Route path="/disciplinas/nova" element={<NovaDisciplinaPage />} />
          <Route path="/disciplinas/:disciplinaId/unidades" element={<UnidadesPage />} />
          <Route path="/disciplinas/:disciplinaId/nova-unidade" element={<NovaUnidadePage />} />
          
          {/* Unidades */}
          <Route path="/unidades/:unidadeId" element={<ConteudoUnidadePage />} />
          
          {/* Configurações e IA */}
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          <Route path="/gerador-ia" element={<IAGeradorPage />} />
          <Route path="/gerador" element={<IAGeradorPage />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
