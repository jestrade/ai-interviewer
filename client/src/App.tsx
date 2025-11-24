import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/auth";
import Root from "./pages/root/root";
import { initSentry } from "@/services/sentry";

const queryClient = new QueryClient();

initSentry();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <Root />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
