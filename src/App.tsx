import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnimatePresence, motion } from "framer-motion";
import WelcomePage from "./pages/WelcomePage";
import IntakePage from "./pages/IntakePage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import FAQPage from "./pages/FAQPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const pageVariants = {
  initial: {
    opacity: 0,
    y: 16,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -16,
  },
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.16, 1, 0.3, 1] as const,
  duration: 0.4,
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-screen"
      >
        <Routes location={location}>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/intake" element={<IntakePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
              <AnimatedRoutes />
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;