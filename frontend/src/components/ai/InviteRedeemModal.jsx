import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiGift } from "react-icons/fi";
import toast from "react-hot-toast";
import { inviteApi } from "../../api/ai";
import { useUser } from "../../contexts/AuthContext";
import { useAIChat } from "../../contexts/AIContext";

export default function InviteRedeemModal({ open, onClose }) {
  const { refresh } = useUser();
  const { refreshUsage } = useAIChat();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRedeem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await inviteApi.redeem(code.trim().toUpperCase());
      toast.success(res.message || "Upgraded!");
      setCode("");

      // Refresh user (updates tier badge in navbar)
      await refresh?.();

      // Refresh usage (updates the X/Y counter in the drawer)
      await refreshUsage?.();

      // Close modal
      onClose();

      // Tiny delay then hard refresh so nothing is stale
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      toast.error(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[250] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-6 border border-beige-200 dark:border-dark-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-leetcode-yellow/15 flex items-center justify-center">
                  <FiGift className="text-leetcode-yellow" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Redeem invite code
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Unlock premium NextraAI features
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleRedeem} className="space-y-3">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="NXTA-XXXX-XXXX"
                className="w-full text-center text-lg tracking-widest font-mono py-3 rounded-xl bg-gray-100 dark:bg-dark-700 border border-transparent focus:border-leetcode-yellow focus:outline-none text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading || code.length < 8}
                className="w-full bg-leetcode-yellow text-gray-900 py-2.5 rounded-xl font-medium text-sm hover:bg-yellow-500 disabled:opacity-50 transition-colors"
              >
                {loading ? "Redeeming…" : "Redeem"}
              </button>
            </form>

            <p className="text-[10px] text-gray-400 text-center mt-3">
              After redeeming, the page will refresh to apply your new plan.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}