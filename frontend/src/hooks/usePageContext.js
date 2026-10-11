import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAIChat } from "../contexts/AIContext";

/**
 * Automatically derives page context (source_type / source_id / title)
 * and pushes it into AIContext so NextraAI knows what the user is viewing.
 */
export function usePageContext() {
  const location = useLocation();
  const params = useParams();
  const { setPageContext } = useAIChat();

  useEffect(() => {
    const path = location.pathname;
    let ctx = null;

    if (path.startsWith("/problems/") && params.id) {
      ctx = { source_type: "leetcode", source_id: Number(params.id), url: path };
    } else if (path === "/problems") {
      ctx = { source_type: "leetcode", title: "LeetCode problems list" };
    } else if (path.startsWith("/practice/") && params.id) {
      ctx = { source_type: "practice", source_id: Number(params.id), url: path };
    } else if (path === "/practice") {
      ctx = { source_type: "practice", title: "Practice problems list" };
    } else if (path.startsWith("/concepts/") && params.id) {
      ctx = { source_type: "concept", source_id: Number(params.id), url: path };
    } else if (path === "/concepts") {
      ctx = { source_type: "concept", title: "Concepts list" };
    } else if (path.startsWith("/notes/") && params.slug) {
      ctx = { source_type: "note", slug: params.slug, url: path };
    } else if (path === "/notes") {
      ctx = { source_type: "note", title: "Notes list" };
    }

    setPageContext(ctx);
  }, [location.pathname, params.id, params.slug, setPageContext]);
}