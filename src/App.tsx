import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import AddPatient from "./pages/AddPatient";
import BookAppointment from "./pages/BookAppointment";
import NewAppointment from "./pages/NewAppointment";
import Balance from "./pages/Balance";
import ClinicConfig from "./pages/ClinicConfig";
import VideoHistory from "./pages/VideoHistory";
import ShareLink from "./pages/ShareLink";
import AppSettings from "./pages/AppSettings";
import ReportProblem from "./pages/ReportProblem";
import ChatSupport from "./pages/ChatSupport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="animated-bg" />
        <div className="glass-card rounded-2xl p-8 text-center space-y-4 animate-scale-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg font-medium text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="animated-bg" />
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
          <Route path="/" element={user ? <Index /> : <Navigate to="/auth" replace />} />
          <Route path="/add-patient" element={user ? <AddPatient /> : <Navigate to="/auth" replace />} />
          <Route path="/book-appointment" element={user ? <BookAppointment /> : <Navigate to="/auth" replace />} />
          <Route path="/new-appointment" element={user ? <NewAppointment /> : <Navigate to="/auth" replace />} />
          <Route path="/analytics" element={user ? <Analytics /> : <Navigate to="/auth" replace />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" replace />} />
          <Route path="/balance" element={user ? <Balance /> : <Navigate to="/auth" replace />} />
          <Route path="/clinic-config" element={user ? <ClinicConfig /> : <Navigate to="/auth" replace />} />
          <Route path="/video-history" element={user ? <VideoHistory /> : <Navigate to="/auth" replace />} />
          <Route path="/share-link" element={user ? <ShareLink /> : <Navigate to="/auth" replace />} />
          <Route path="/settings" element={user ? <AppSettings /> : <Navigate to="/auth" replace />} />
          <Route path="/report-problem" element={user ? <ReportProblem /> : <Navigate to="/auth" replace />} />
          <Route path="/chat-support" element={user ? <ChatSupport /> : <Navigate to="/auth" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
