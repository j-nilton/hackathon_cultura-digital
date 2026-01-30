import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";
import { IllustrationWrapper } from "./IllustrationWrapper";

interface AppLayoutProps {
  children: React.ReactNode;
  showIllustrations?: boolean;
}

export function AppLayout({ children, showIllustrations = true }: AppLayoutProps) {
  return (
    <IllustrationWrapper showLeft={showIllustrations} showRight={showIllustrations}>
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1">
          <div className="container-editorial py-8 md:py-12">
            {children}
          </div>
        </main>
        <AppFooter />
      </div>
    </IllustrationWrapper>
  );
}
