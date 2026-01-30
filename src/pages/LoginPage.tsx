import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IllustrationWrapper } from "@/components/layout/IllustrationWrapper";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import heroPattern from "@/assets/hero-pattern.png";
import { useToast } from "@/hooks/use-toast";
import { signIn, observeAuth } from "@/infra/services/firebase";
import logo from "@/assets/logo.png";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsub = observeAuth((user) => {
      if (user) {
        navigate("/dashboard");
      }
    });
    return () => unsub();
  }, [navigate]);

  const mapError = (code?: string) => {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Credenciais inválidas. Verifique seu e-mail e senha.";
      case "auth/user-not-found":
        return "Usuário não encontrado. Cadastre-se para continuar.";
      case "auth/too-many-requests":
        return "Muitas tentativas. Tente novamente mais tarde.";
      default:
        return "Falha ao realizar login. Tente novamente.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast({ title: "Login realizado", description: "Bem-vindo(a)!" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Erro no login", description: mapError(err?.code) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IllustrationWrapper>
      <div className="min-h-screen flex">
        {/* Painel esquerdo - Visual institucional */}
        <div className="hidden lg:flex lg:w-[55%] relative bg-primary overflow-hidden">
          {/* Pattern de fundo */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url(${heroPattern})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          
          {/* Gradiente overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-[hsl(174,50%,28%)]" />
          
          {/* Conteúdo */}
          <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={logo} alt="CulturaDigital" className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white backdrop-blur-sm" />
              <div>
                <span className="font-display text-2xl font-semibold text-white">
                  Cultura
                </span>
                <span className="font-display text-2xl font-semibold text-white/70">
                  Digital
                </span>
              </div>
            </div>

            {/* Mensagem central */}
            <div className="max-w-lg">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-display text-4xl lg:text-5xl font-semibold text-white leading-tight mb-6"
              >
                Planejamento pedagógico que inspira aprendizado
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-white/80 leading-relaxed"
              >
                Planos de aula, atividades e materiais didáticos de Cultura Digital 
                alinhados à BNCC — tudo com apoio de inteligência artificial.
              </motion.p>
            </div>

            {/* Rodapé */}
            <div className="flex items-center gap-8 text-sm text-white/60">
              <span>© 2026 Cultura Digital</span>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span>Feito para professores</span>
            </div>
          </div>

          {/* Formas decorativas */}
          <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -right-16 top-1/2 w-64 h-64 rounded-full bg-white/5" />
        </div>

        {/* Painel direito - Formulário */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Header mobile */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <img src={logo} alt="CulturaDigital" className="w-12 h-12 rounded-xl object-contain" />
              <div>
                <span className="font-display text-xl font-semibold text-foreground">
                  Cultura
                </span>
                <span className="font-display text-xl font-semibold text-primary">
                  Digital
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
                Bem-vindo(a) de volta
              </h2>
              <p className="text-muted-foreground">
                Entre com suas credenciais para acessar sua conta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com.br"
                    variant="editorial"
                    inputSize="lg"
                    className="pl-11"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <Link
                    to="/recuperar-senha"
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    variant="editorial"
                    inputSize="lg"
                    className="pl-11 pr-11"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="institutional"
                size="xl"
                className="w-full"
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
                    Entrar
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Ainda não tem uma conta?{" "}
                <Link
                  to="/cadastro"
                  className="text-primary font-medium hover:underline"
                >
                  Cadastre-se gratuitamente
                </Link>
              </p>
            </div>

            {/* Selo BNCC */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">BNCC</span>
                  </div>
                  <span>Alinhado à Base Nacional</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </IllustrationWrapper>
  );
}
