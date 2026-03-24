import { Toaster } from "@/components/ui/sonner";
import MeditationLog from "@/pages/MeditationLog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MeditationLog />
      <Toaster />
    </QueryClientProvider>
  );
}
