import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { userProgressApi } from "../api/userProgress";
import { useUser } from "./AuthContext";

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const { isAuthenticated } = useUser();
  const [solved, setSolved] = useState({ leetcode: new Set(), practice: new Set() });
  const [stats, setStats] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setSolved({ leetcode: new Set(), practice: new Set() });
      setStats(null);
      return;
    }
    try {
      const [list, st] = await Promise.all([
        userProgressApi.list(),
        userProgressApi.stats(),
      ]);
      const lc = new Set();
      const pr = new Set();
      list.forEach((p) => {
        if (p.problem_type === "leetcode") lc.add(p.problem_id);
        if (p.problem_type === "practice") pr.add(p.problem_id);
      });
      setSolved({ leetcode: lc, practice: pr });
      setStats(st);
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isSolved = useCallback(
    (type, id) => solved[type]?.has(id) || false,
    [solved]
  );

  const toggle = useCallback(
    async (type, id) => {
      const next = !isSolved(type, id);
      // optimistic
      setSolved((prev) => {
        const nextSet = new Set(prev[type]);
        if (next) nextSet.add(id);
        else nextSet.delete(id);
        return { ...prev, [type]: nextSet };
      });
      try {
        await userProgressApi.toggle(type, id, next);
        const st = await userProgressApi.stats();
        setStats(st);
      } catch {
        // revert on error
        setSolved((prev) => {
          const nextSet = new Set(prev[type]);
          if (!next) nextSet.add(id);
          else nextSet.delete(id);
          return { ...prev, [type]: nextSet };
        });
      }
    },
    [isSolved]
  );

  return (
    <ProgressContext.Provider value={{ solved, stats, isSolved, toggle, refresh }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}