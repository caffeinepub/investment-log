import { Toaster } from "@/components/ui/sonner";
import { useRecordVisit } from "@/hooks/useQueries";
import { LanguageProvider } from "@/i18n";
import AdminPage from "@/pages/AdminPage";
import MeditationLog from "@/pages/MeditationLog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function AppInner() {
  // Fire-and-forget: record this visit once per session
  useRecordVisit();

  const isAdmin = window.location.pathname === "/admin";
  return isAdmin ? <AdminPage /> : <MeditationLog />;
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
