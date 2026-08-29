import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiBook,
  FiCode,
  FiTrendingUp,
  FiFileText,
  FiGithub,
  FiLinkedin,
  FiRefreshCw,
  FiExternalLink,
  FiZap,
  FiLayers,
  FiStar,
} from "react-icons/fi";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { problemsApi } from "../api/problems";
import { practiceApi } from "../api/practice";
import { conceptsApi } from "../api/concepts";
import { notesApi } from "../api/notes";

const HomePage = () => {
  const [recentProblems, setRecentProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [contentStats, setContentStats] = useState({
    problems: 0,
    concepts: 0,
    practice: 0,
    notes: 0,
  });

  const isInitialFetchDone = useRef(false);
  const isFetchingRef = useRef(false);

  const fetchProblems = useCallback(async (showLoading = true) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (showLoading) setRefreshing(true);

    try {
      const [problems, practice, concepts, notes] = await Promise.all([
        problemsApi.getAll({ }),
        practiceApi.getAll({ }), 
        conceptsApi.getAll(),
        notesApi.getAll(),
      ]);

      const sortedProblems = [...problems].sort((a, b) => b.id - a.id);
      setRecentProblems(sortedProblems.slice(0, 4));

      setContentStats({
        problems: problems.length,
        concepts: concepts.length,
        practice: practice.length,
        notes: notes.length,
      });
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isInitialFetchDone.current) {
      isInitialFetchDone.current = true;
      fetchProblems(true);
    }
  }, [fetchProblems]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchProblems(false);
    };
    const handleFocus = () => fetchProblems(false);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchProblems]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && !isFetchingRef.current) {
        fetchProblems(false);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchProblems]);

  if (loading) return <LoadingSpinner />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const learningPaths = [
    {
      to: "/problems",
      icon: FiBook,
      title: "LeetCode Problems",
      description: "Solved problems with detailed notes, patterns, and step-by-step algorithms",
      cta: "View Problems",
      color: "from-yellow-50 to-orange-50",
      iconColor: "text-yellow-600",
    },
    {
      to: "/practice",
      icon: FiCode,
      title: "Practice & Learn",
      description: "Coding problems with hints and hidden solutions to test yourself",
      cta: "Start Practice",
      color: "from-blue-50 to-cyan-50",
      iconColor: "text-blue-600",
    },
    {
      to: "/concepts",
      icon: FiTrendingUp,
      title: "Programming Concepts",
      description: "Quick reference for core concepts with definitions and examples",
      cta: "Explore Concepts",
      color: "from-purple-50 to-pink-50",
      iconColor: "text-purple-600",
    },
    {
      to: "/notes",
      icon: FiFileText,
      title: "Notes",
      description: "Structured notes on DSA, web dev, and everything I've learned",
      cta: "Read Notes",
      color: "from-green-50 to-emerald-50",
      iconColor: "text-green-600",
    },
  ];

  const stats = [
    { value: contentStats.problems, label: "Problems Documented", icon: FiStar, color: "text-yellow-600" },
    { value: contentStats.concepts, label: "Concepts Covered", icon: FiLayers, color: "text-purple-600" },
    { value: contentStats.practice, label: "Practice Problems", icon: FiZap, color: "text-blue-600" },
    { value: contentStats.notes, label: "Notes Published", icon: FiFileText, color: "text-green-600" },
  ];

  return (
    <div className="container-custom mx-auto">
      <motion.div
        className="space-y-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Light Hero Section */}
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cream-50 via-white to-beige-50 p-10 md:p-16 shadow-sm border border-beige-200 text-center"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFA116]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFA116]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 text-center">
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-bold text-gray-900 leading-tight max-w-4xl mx-auto">
              Learn DSA, Programming &amp;
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFA116] to-yellow-500"> Practice Smarter</span>
            </h1>
            <p className="text-gray-600 text-xl md:text-1xl mt-4 max-w-2xl mx-auto leading-relaxed">
              Everything here is something I've personally solved, practiced, or studied — 
              organized so it's actually useful to work through.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Link
                to="/problems"
                className="inline-flex items-center gap-2 bg-[#FFA116] text-gray-900 px-8 py-3.5 rounded-full font-semibold hover:bg-yellow-500 transition-all duration-300 shadow-lg hover:shadow-[#FFA116]/25 text-lg"
              >
                Start Learning <FiArrowRight size={20} />
              </Link>
              <a
                href="#stats"
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-8 py-3.5 rounded-full font-medium hover:bg-gray-200 transition-all duration-300 text-lg"
              >
                Explore Content
              </a>
            </div>
          </div>
        </motion.section>

        {/* Stats Grid */}
        <motion.section
          id="stats"
          variants={itemVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#FFA116]/30 text-center hover:-translate-y-1"
            >
              <div className="relative">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-gray-50 group-hover:bg-[#FFA116]/10 flex items-center justify-center transition-all duration-300">
                  <stat.icon size={24} className={stat.color} />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.section>

        {/* Learning Paths */}
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {learningPaths.map((path) => (
            <Link
              key={path.to}
              to={path.to}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#FFA116]/40 hover:-translate-y-1.5"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${path.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <path.icon size={24} className={path.iconColor} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{path.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">{path.description}</p>
              <span className="inline-flex items-center text-[#FFA116] font-medium text-sm group-hover:gap-2 transition-all duration-300">
                {path.cta} <FiArrowRight className="ml-1.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </motion.section>

        {/* Recently Added Section */}
        <motion.section variants={itemVariants}>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FiZap className="text-[#FFA116]" /> Recently Added
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchProblems(true)}
                disabled={refreshing || isFetchingRef.current}
                className={`text-sm flex items-center gap-1.5 text-gray-500 hover:text-[#FFA116] transition-colors ${
                  refreshing || isFetchingRef.current ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FiRefreshCw
                  size={14}
                  className={refreshing || isFetchingRef.current ? "animate-spin" : ""}
                />
                {refreshing || isFetchingRef.current ? "Refreshing..." : "Refresh"}
              </button>
              <Link
                to="/problems"
                className="text-[#FFA116] font-medium hover:underline inline-flex items-center gap-1"
              >
                View All <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProblems.length > 0 ? (
              recentProblems.map((problem) => (
                <Link
                  key={problem.id}
                  to={`/problems/${problem.id}`}
                  className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#FFA116]/40 hover:-translate-y-1"
                >
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono">
                          #{problem.leetcode_id}
                        </span>
                        {problem.concept && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 truncate">
                            {problem.concept}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mt-1 group-hover:text-[#FFA116] transition-colors">
                        {problem.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            problem.difficulty === "EASY"
                              ? "bg-green-100 text-green-700"
                              : problem.difficulty === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                        {problem.java_solution && problem.python_solution && (
                          <div className="flex gap-1">
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-mono">
                              Java
                            </span>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-mono">
                              Python
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <FiArrowRight className="text-gray-300 group-hover:text-[#FFA116] group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <FiBook className="mx-auto text-3xl text-gray-300 mb-2" />
                No problems added yet. Check back soon!
              </div>
            )}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default HomePage;