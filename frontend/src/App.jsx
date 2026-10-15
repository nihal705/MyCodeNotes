import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useState, useEffect, useRef } from "react";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import LoadingWithRetry from "./components/common/LoadingWithRetry";
import OfflineBanner from "./components/common/OfflineBanner";
import NextraAIFAB from "./components/ai/NextraAIFAB";
import NextraAIDrawer from "./components/ai/NextraAIDrawer";
import NextraAIFullScreen from "./components/ai/NextraAIFullScreen";
import ContextPicker from "./components/ai/ContextPicker";
import InviteRedeemModal from "./components/ai/InviteRedeemModal";

import { AuthProvider } from "./contexts/AuthContext";
import { AIProvider, useAIChat } from "./contexts/AIContext";
import { ProgressProvider } from "./contexts/ProgressContext";

import { notesApi } from "./api/notes";

import HomePage from "./pages/HomePage";
import ProblemsPage from "./pages/ProblemsPage";
import PracticePage from "./pages/PracticePage";
import ConceptsPage from "./pages/ConceptsPage";
import NotesPage from "./pages/NotesPage";
import NoteDetailPage from "./pages/NoteDetailPage";
import ProblemDetailPage from "./pages/ProblemDetailPage";
import PracticeDetailPage from "./pages/PracticeDetailPage";
import ConceptDetailPage from "./pages/ConceptDetailPage";
import AdminPage from "./pages/AdminPage";
import TermsPrivacyPage from "./pages/TermsPrivacyPage";
import NotFoundPage from "./pages/NotFoundPage";
import AboutPage from "./pages/AboutPage";
import ProfilePage from "./pages/ProfilePage";

function AppShell() {
  const { isFullScreen, showPicker, setShowPicker, showInvite, setShowInvite } = useAIChat();

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 dark:bg-black">
      {!isFullScreen && <Navbar />}
      {!isFullScreen && <OfflineBanner />}
      <main className={`flex-grow w-full ${isFullScreen ? "hidden" : "py-8"}`}>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/problems" element={<ProblemsPage />} />
          <Route path="/problems/:id" element={<ProblemDetailPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/practice/:id" element={<PracticeDetailPage />} />
          <Route path="/concepts" element={<ConceptsPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notes/:slug" element={<NoteDetailPage />} />
          <Route path="/concepts/:id" element={<ConceptDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/terms-privacy" element={<TermsPrivacyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isFullScreen && <Footer />}
      <Toaster position="top-right" />

      <NextraAIFAB />
      <NextraAIDrawer />
      <NextraAIFullScreen />

      {/* Global modals — one instance, shared by drawer and full-screen */}
      <ContextPicker open={showPicker} onClose={() => setShowPicker(false)} />
      <InviteRedeemModal open={showInvite} onClose={() => setShowInvite(false)} />
    </div>
  );
}

function LoadingScreen({ onRetry, retryCount, isRetrying }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50 dark:bg-dark-900">
      <Navbar />
      <OfflineBanner />
      <LoadingWithRetry
        onRetry={onRetry}
        retryCount={retryCount}
        isRetrying={isRetrying}
      />
      <Footer />
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const isBackendInitialized = sessionStorage.getItem("backendInitialized") === "true";

  const checkBackendHealth = async () => {
    try {
      if (isBackendInitialized) return true;
      abortControllerRef.current = new AbortController();
      const timeoutPromise = new Promise((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error("Request timeout - backend might be sleeping"));
        }, 15000);
      });
      const fetchPromise = notesApi.getAll({ signal: abortControllerRef.current.signal });
      await Promise.race([fetchPromise, timeoutPromise]);
      clearTimeout(timeoutRef.current);
      sessionStorage.setItem("backendInitialized", "true");
      return true;
    } catch (error) {
      console.error("Backend not responding:", error);
      clearTimeout(timeoutRef.current);
      if (error.name === "AbortError") return false;
      return false;
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const success = await checkBackendHealth();
    if (success) setLoading(false);
    setIsRetrying(false);
  };

  useEffect(() => {
    const initializeApp = async () => {
      if (isBackendInitialized) {
        setLoading(false);
        return;
      }
      const success = await checkBackendHealth();
      if (success) setLoading(false);
    };
    initializeApp();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [isBackendInitialized]);

  useEffect(() => {
    if (!loading || isBackendInitialized) return;
    const autoRetryInterval = setInterval(async () => {
      const success = await checkBackendHealth();
      if (success) {
        setLoading(false);
        clearInterval(autoRetryInterval);
      }
    }, 5000);
    return () => clearInterval(autoRetryInterval);
  }, [loading, isBackendInitialized]);

  const showLoadingScreen = loading && !isBackendInitialized;

  return (
    <AuthProvider>
      <ProgressProvider>
        <AIProvider>
          <Router>
            {showLoadingScreen ? (
              <LoadingScreen
                onRetry={handleRetry}
                retryCount={retryCount}
                isRetrying={isRetrying}
              />
            ) : (
              <AppShell />
            )}
          </Router>
        </AIProvider>
      </ProgressProvider>
    </AuthProvider>
  );
}

export default App;