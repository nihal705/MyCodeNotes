import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useAIChat } from "../../contexts/AIContext";
import NextraLogo from "./NextraLogo";

const HIDE_ON = ["/admin"];

export default function NextraAIFAB() {
  const location = useLocation();
  const { isOpen, isFullScreen, toggleDrawer } = useAIChat();

  if (HIDE_ON.some((p) => location.pathname.startsWith(p))) return null;
  if (isOpen || isFullScreen) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={toggleDrawer}
      className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-br from-gray-900 to-gray-800 dark:from-[#1A1D21] dark:to-[#0B0F17] text-white font-semibold shadow-xl hover:shadow-2xl transition-all border border-gray-700 dark:border-[#26292E]"
      aria-label="Open NextraAI"
    >
      <span className="relative flex items-center justify-center">
        <NextraLogo size={22} glow />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </span>
      <span className="text-sm hidden sm:inline">Ask NextraAI</span>
    </motion.button>
  );
}