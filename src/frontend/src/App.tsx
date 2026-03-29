import { Toaster } from "@/components/ui/sonner";
import { useRecordVisit } from "@/hooks/useQueries";
import { LanguageProvider } from "@/i18n";
import AdminPage from "@/pages/AdminPage";
import FontPreview from "@/pages/FontPreview";
import MeditationLog from "@/pages/MeditationLog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function AppInner() {
  useRecordVisit();

  const path = window.location.pathname;
  if (path === "/admin") return <AdminPage />;
  if (path === "/fonts") return <FontPreview />;
  return <MeditationLog />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AppInner />
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
