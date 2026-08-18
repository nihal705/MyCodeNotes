import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiBook,
  FiCode,
  FiTrendingUp,
  FiGithub,
  FiLinkedin,
  FiAward,
  FiCalendar,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import { SiLeetcode } from "react-icons/si";
import { profileApi } from "../api/profile";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { problemsApi } from "../api/problems";
import { practiceApi } from "../api/practice";

const HomePage = () => {
  const [recentProblems, setRecentProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Loading...",
    title: "",
    bio: "",
    github: "#",
    linkedin: "#",
    leetcode: "#",
    totalSolved: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    totalSubmissions: 0,
    activeDays: 0,
    maxStreak: 0,
    languages: {},
  });

  // ✅ Use refs to prevent multiple calls
  const isInitialFetchDone = useRef(false);
  const isFetchingRef = useRef(false);

  // Fetch profile data from database
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.getAll();
        setProfile({
          name: data.name || "G Nihal",
          title: data.title || "Full Stack Developer | DSA Enthusiast",
          bio: data.bio || "Building solutions one problem at a time.",
          github: data.github || "#",
          linkedin: data.linkedin || "#",
          leetcode: data.leetcode || "#",
          totalSolved: parseInt(data.totalSolved) || 0,
          easy: parseInt(data.easy) || 0,
          medium: parseInt(data.medium) || 0,
          hard: parseInt(data.hard) || 0,
          totalSubmissions: parseInt(data.totalSubmissions) || 0,
          activeDays: parseInt(data.activeDays) || 0,
          maxStreak: parseInt(data.maxStreak) || 0,
          languages: data.languages || {},
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // ✅ Stable fetch function - doesn't change on re-renders
  const fetchProblems = useCallback(async (showLoading = true) => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log("⏳ Fetch already in progress, skipping...");
      return;
    }

    isFetchingRef.current = true;
    if (showLoading) setRefreshing(true);

    try {
      console.log("📤 Fetching problems...");
      const [problems, practice] = await Promise.all([
        problemsApi.getAll({ limit: 100 }), // 🔥 Fetch ALL problems
        practiceApi.getAll({ limit: 5 }),
      ]);

      // Sort by ID descending (newest first)
      const sortedProblems = [...problems].sort((a, b) => b.id - a.id);

      // Take only the 4 most recent for display
      setRecentProblems(sortedProblems.slice(0, 4));

      console.log(
        `✅ Total problems: ${problems.length}, Showing: ${Math.min(4, problems.length)} most recent`,
      );
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  // ✅ Initial fetch - only runs once
  useEffect(() => {
    if (!isInitialFetchDone.current) {
      isInitialFetchDone.current = true;
      fetchProblems(true);
    }
  }, [fetchProblems]);

  // ✅ Auto-refresh when user focuses on the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchProblems(false);
      }
    };

    const handleFocus = () => {
      fetchProblems(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchProblems]);

  // ✅ Auto-refresh every 60 seconds (only if not already fetching)
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
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const stats = {
    totalSolved: profile.totalSolved,
    easy: profile.easy,
    medium: profile.medium,
    hard: profile.hard,
    totalSubmissions: profile.totalSubmissions,
    activeDays: profile.activeDays,
    maxStreak: profile.maxStreak,
    languages: profile.languages,
  };

  return (
    <div className="container-custom mx-auto">
      <motion.div
        className="space-y-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section - Profile from Database */}
        <motion.section
          variants={itemVariants}
          className="bg-gradient-to-br from-cream-50 via-white to-beige-50 rounded-3xl p-8 md:p-12 shadow-sm border border-beige-200"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-leetcode-yellow to-yellow-400 flex items-center justify-center text-4xl font-bold text-white shadow-lg flex-shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg flex-shrink-0 border-2 border-leetcode-yellow bg-leetcode-yellow">
                <img
                  src="/images/profile.png"
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                Hello, I'm {profile.name}
              </h1>
              <p className="text-gray-500 mt-3 max-w-2xl">{profile.bio}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener"
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <FiGithub size={20} />
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener"
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <FiLinkedin size={20} />
                </a>
                <a
                  href={profile.leetcode}
                  target="_blank"
                  rel="noopener"
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <SiLeetcode size={20} className="text-leetcode-yellow" />
                </a>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Quick Stats */}
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-beige-200 text-center">
            <div className="text-3xl font-bold text-leetcode-yellow">
              {stats.totalSolved}
            </div>
            <div className="text-sm text-gray-600">Problems Solved</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-beige-200 text-center">
            <div className="text-3xl font-bold text-leetcode-yellow">
              {stats.maxStreak}
            </div>
            <div className="text-sm text-gray-600">Max Streak</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-beige-200 text-center">
            <div className="text-3xl font-bold text-leetcode-yellow">
              {stats.activeDays}
            </div>
            <div className="text-sm text-gray-600">Active Days</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-beige-200 text-center">
            <div className="text-3xl font-bold text-leetcode-yellow">
              {stats.totalSubmissions}
            </div>
            <div className="text-sm text-gray-600">Submissions</div>
          </div>
        </motion.section>

        {/* LeetCode Progress */}
        <motion.section
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-sm border border-beige-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <FiAward className="text-leetcode-yellow" size={24} />
            <h2 className="text-xl font-bold text-gray-900">
              LeetCode Progress
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {stats.easy}
              </div>
              <div className="text-sm text-green-700">Easy</div>
              <div className="text-xs text-gray-500">
                / {stats.easy + stats.medium + stats.hard} total
              </div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.medium}
              </div>
              <div className="text-sm text-yellow-700">Medium</div>
              <div className="text-xs text-gray-500">
                / {stats.easy + stats.medium + stats.hard} total
              </div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {stats.hard}
              </div>
              <div className="text-sm text-red-700">Hard</div>
              <div className="text-xs text-gray-500">
                / {stats.easy + stats.medium + stats.hard} total
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-beige-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Languages:</span>
                {Object.entries(stats.languages).map(([lang, count]) => (
                  <span
                    key={lang}
                    className="text-sm bg-gray-100 px-3 py-1 rounded-full"
                  >
                    {lang} ({count})
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiCalendar /> {stats.activeDays} active days
                <span className="mx-2">|</span>
                <FiClock /> {stats.maxStreak} max streak
              </div>
            </div>
          </div>
        </motion.section>

        {/* Quick Links */}
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Link
            to="/problems"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-beige-200 hover:shadow-lg transition-all duration-300 hover:border-leetcode-yellow"
          >
            <FiBook className="text-3xl text-leetcode-yellow mb-3" />
            <h3 className="text-xl font-semibold mb-2">LeetCode Problems</h3>
            <p className="text-gray-600 text-sm mb-3">
              Access all my solved problems with detailed notes
            </p>
            <span className="inline-flex items-center text-leetcode-yellow font-medium group-hover:translate-x-2 transition-transform">
              View Problems <FiArrowRight className="ml-2" />
            </span>
          </Link>

          <Link
            to="/practice"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-beige-200 hover:shadow-lg transition-all duration-300 hover:border-leetcode-yellow"
          >
            <FiCode className="text-3xl text-leetcode-yellow mb-3" />
            <h3 className="text-xl font-semibold mb-2">Practice & Learn</h3>
            <p className="text-gray-600 text-sm mb-3">
              Practice coding and general programming problems with hints and
              hidden solutions
            </p>
            <span className="inline-flex items-center text-leetcode-yellow font-medium group-hover:translate-x-2 transition-transform">
              Start Practice <FiArrowRight className="ml-2" />
            </span>
          </Link>

          <Link
            to="/concepts"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-beige-200 hover:shadow-lg transition-all duration-300 hover:border-leetcode-yellow"
          >
            <FiTrendingUp className="text-3xl text-leetcode-yellow mb-3" />
            <h3 className="text-xl font-semibold mb-2">Programming Concepts</h3>
            <p className="text-gray-600 text-sm mb-3">
              Quick reference for programming concepts with examples
            </p>
            <span className="inline-flex items-center text-leetcode-yellow font-medium group-hover:translate-x-2 transition-transform">
              Explore Concepts <FiArrowRight className="ml-2" />
            </span>
          </Link>
        </motion.section>

        {/* Recent Problems */}
        <motion.section variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Problems
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchProblems(true)}
                disabled={refreshing || isFetchingRef.current}
                className={`text-sm flex items-center gap-1.5 text-gray-500 hover:text-leetcode-yellow transition-colors ${
                  refreshing || isFetchingRef.current
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <FiRefreshCw
                  size={14}
                  className={
                    refreshing || isFetchingRef.current ? "animate-spin" : ""
                  }
                />
                {refreshing || isFetchingRef.current
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
              <Link
                to="/problems"
                className="text-leetcode-yellow hover:underline"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProblems.length > 0 ? (
              recentProblems.map((problem) => (
                <Link
                  key={problem.id}
                  to={`/problems/${problem.id}`}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-beige-200 hover:shadow-lg transition-all duration-300 hover:border-leetcode-yellow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-gray-500">
                        #{problem.leetcode_id}
                      </div>
                      <h3 className="font-semibold text-lg">{problem.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            problem.difficulty === "EASY"
                              ? "bg-green-100 text-green-700"
                              : problem.difficulty === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                        {problem.concept && (
                          <span className="text-xs text-gray-500">
                            • {problem.concept}
                          </span>
                        )}
                      </div>
                    </div>
                    {problem.java_solution && problem.python_solution && (
                      <div className="flex gap-1">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          Java
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          Python3
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No problems added yet. Go to Admin panel to add your first
                problem!
              </div>
            )}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default HomePage;
