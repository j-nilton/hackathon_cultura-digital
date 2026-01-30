import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { signOutUser } from "@/infra/services/firebase";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { setUserProfile } from "@/infra/services/firebase/profiles";
import { Sun, Moon } from "lucide-react";

export default function ConfiguracoesPage() {
  const [theme, setTheme] = useState<"light" | "dark">((localStorage.getItem("theme") as any) ?? "light");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userId, profile } = useUserProfile();
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [school, setSchool] = useState(profile?.school ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast({ title: "Sessão encerrada", description: "Até breve!" });
      navigate("/login");
    } catch {
      toast({ title: "Falha ao sair", description: "Tente novamente." });
    }
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    setName(profile?.name ?? "");
    setEmail(profile?.email ?? "");
    setSchool(profile?.school ?? "");
    setCity(profile?.city ?? "");
  }, [profile]);

  const isValidEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

  const onSaveProfile = async () => {
    if (!userId) return;
    if (!name.trim() || !isValidEmail(email)) {
      toast({ title: "Dados inválidos", description: "Verifique nome e e-mail." });
      return;
    }
    try {
      setSaving(true);
      await setUserProfile(userId, { name: name.trim(), email: email.trim(), school: school.trim(), city: city.trim() });
      toast({ title: "Perfil atualizado", description: "Suas informações foram salvas." });
    } catch {
      toast({ title: "Falha ao salvar perfil", description: "Tente novamente." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout showIllustrations={false}>
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-foreground mb-2">Configurações</h1>
          <p className="text-muted-foreground">Gerencie preferências da sua conta e do aplicativo</p>
        </motion.div>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card variant="editorial">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Tema visual</Label>
                  <p className="text-sm text-muted-foreground">Escolha entre Claro e Escuro</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    aria-label="Tema claro"
                    className="w-10 h-10 flex items-center justify-center"
                  >
                    <Sun className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    aria-label="Tema escuro"
                    className="w-10 h-10 flex items-center justify-center"
                  >
                    <Moon className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              {/* <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Conta</Label>
                  <p className="text-sm text-muted-foreground">Encerrar sessão atual</p>
                </div>
                <Button variant="outline" onClick={handleLogout}>Sair</Button>
              </div> */}
              <div className="h-px bg-border" />
              <div>
                <Label className="block mb-2">Perfil do usuário</Label>
                <div className="grid gap-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Nome completo</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>E-mail</Label>
                      <Input type="email" value={email} readOnly aria-readonly />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Instituição de ensino</Label>
                      <Input value={school} onChange={(e) => setSchool(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Cidade / Estado</Label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="institutional" onClick={onSaveProfile} disabled={saving}>
                      {saving ? "Salvando..." : "Salvar perfil"}
                    </Button>
                  </div>
                </div>
              </div>
              {/* <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Termos e Privacidade</Label>
                  <p className="text-sm text-muted-foreground">Consulte nossas políticas</p>
                </div>
                <div className="flex gap-2">
                  <Link to="/termos" className="text-primary hover:underline text-sm">Termos de Uso</Link>
                  <Link to="/privacidade" className="text-primary hover:underline text-sm">Privacidade</Link>
                </div>
              </div> */}
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </AppLayout>
  );
}
