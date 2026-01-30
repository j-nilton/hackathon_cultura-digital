import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Github } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container-editorial py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-2">
            <h4 className="text-foreground font-medium">Institucional</h4>
            <nav className="grid gap-2 text-sm text-muted-foreground">
              <Link to="/sobre" className="hover:text-foreground">Sobre</Link>
              <Link to="/contato" className="hover:text-foreground">Contato</Link>
              <Link to="/privacidade" className="hover:text-foreground">Privacidade</Link>
              <Link to="/termos" className="hover:text-foreground">Termos de uso</Link>
            </nav>
          </div>
          <div className="space-y-2">
            <h4 className="text-foreground font-medium">Redes sociais</h4>
            <div className="flex items-center gap-3">
              <a aria-label="Facebook" href="#" className="p-2 rounded-md border border-border/50 hover:bg-muted">
                <Facebook className="w-4 h-4 text-muted-foreground" />
              </a>
              <a aria-label="Instagram" href="#" className="p-2 rounded-md border border-border/50 hover:bg-muted">
                <Instagram className="w-4 h-4 text-muted-foreground" />
              </a>
              <a aria-label="LinkedIn" href="#" className="p-2 rounded-md border border-border/50 hover:bg-muted">
                <Linkedin className="w-4 h-4 text-muted-foreground" />
              </a>
              <a aria-label="GitHub" href="#" className="p-2 rounded-md border border-border/50 hover:bg-muted">
                <Github className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Cultura Digital. Todos os direitos reservados.</p>
          <p className="text-sm text-muted-foreground">Feito com foco em educação e BNCC.</p>
        </div>
      </div>
    </footer>
  );
}
