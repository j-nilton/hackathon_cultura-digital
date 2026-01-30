import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IllustrationWrapper } from "@/components/layout/IllustrationWrapper";
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  User,
  School,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { signUp, observeAuth } from "@/infra/services/firebase";
import { setUserProfile } from "@/infra/services/firebase/profiles";

const steps = [
  { id: 1, title: "Dados pessoais" },
  { id: 2, title: "Escola" },
  { id: 3, title: "Senha" },
];

export default function CadastroPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      case "auth/email-already-in-use":
        return "E-mail já cadastrado. Faça login ou recupere sua senha.";
      case "auth/weak-password":
        return "Senha fraca. Use ao menos 6 caracteres.";
      default:
        return "Falha ao criar conta. Tente novamente.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      if (password !== confirmPassword) {
        toast({ title: "Senhas diferentes", description: "Verifique e tente novamente." });
        return;
      }
      setIsLoading(true);
      try {
        const user = await signUp(email, password);
        await setUserProfile(user.uid, { name, email, school, city });
        toast({ title: "Conta criada", description: "Bem-vindo(a)!" });
        navigate("/dashboard");
      } catch (err: any) {
        toast({ title: "Erro no cadastro", description: mapError(err?.code) });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <IllustrationWrapper>
      <div className="min-h-screen flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          {/* Card do formulário */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-[hsl(174,50%,28%)] p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="font-display text-2xl font-semibold text-white mb-2">
                Crie sua conta
              </h1>
              <p className="text-white/80 text-sm">
                Comece a planejar aulas incríveis de Cultura Digital
              </p>
            </div>

            {/* Progress Steps */}
            <div className="px-8 pt-6">
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          currentStep > step.id
                            ? "bg-primary text-primary-foreground"
                            : currentStep === step.id
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {currentStep > step.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium ${
                          currentStep >= step.id
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-16 md:w-24 h-0.5 mx-2 transition-colors ${
                          currentStep > step.id ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pb-8">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {currentStep === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="Maria Paula Silva"
                          variant="editorial"
                          inputSize="lg"
                          className="pl-11"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
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
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="school">Nome da escola</Label>
                      <div className="relative">
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="school"
                          placeholder="E.E. Professor João da Silva"
                          variant="editorial"
                          inputSize="lg"
                          className="pl-11"
                          required
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade / Estado</Label>
                      <Input
                        id="city"
                        placeholder="São Paulo, SP"
                        variant="editorial"
                        inputSize="lg"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nível de ensino</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Fundamental I", "Fundamental II", "Ensino Médio", "Todos"].map(
                          (level) => (
                            <label
                              key={level}
                              className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all"
                            >
                              <input
                                type="checkbox"
                                name="level"
                                value={level}
                                className="sr-only"
                              />
                              <div className="w-4 h-4 rounded border-2 border-muted-foreground flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary opacity-0 [input:checked~&]:opacity-100" />
                              </div>
                              <span className="text-sm font-medium">{level}</span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
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
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          variant="editorial"
                          inputSize="lg"
                          className="pl-11"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm text-muted-foreground">
                        Ao criar sua conta, você concorda com os{" "}
                        <Link to="/termos" className="text-primary hover:underline">
                          Termos de Uso
                        </Link>{" "}
                        e{" "}
                        <Link to="/privacidade" className="text-primary hover:underline">
                          Política de Privacidade
                        </Link>
                        .
                      </p>
                    </div>
                  </>
                )}
              </motion.div>

              {/* Buttons */}
              <div className="flex items-center gap-3 mt-8">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="institutional"
                  size="lg"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : currentStep < 3 ? (
                    <>
                      Continuar
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Criar conta
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </motion.div>
      </div>
    </IllustrationWrapper>
  );
}
