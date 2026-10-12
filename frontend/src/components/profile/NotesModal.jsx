import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";
import { userProgressApi } from "../../api/userProgress";

export default function NotesModal({ open, onClose, problemType, problemId, problemTitle, initialNotes }) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setNotes(initialNotes || ""); }, [initialNotes, open]);

  const save = async () => {
    setSaving(true);
    try {
      await userProgressApi.updateNotes(problemType, problemId, notes);
      toast.success("Notes saved");
      onClose?.();
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[210] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-5 border border-beige-200 dark:border-dark-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Your notes</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{problemTitle}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700"><FiX size={14} /></button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={10}
              placeholder="Your approach, key insights, edge cases, complexity notes…"
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-leetcode-yellow font-mono resize-none"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700">Cancel</button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-leetcode-yellow text-gray-900 text-xs font-medium hover:bg-yellow-500 disabled:opacity-50"
              >
                <FiSave size={12} /> {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}