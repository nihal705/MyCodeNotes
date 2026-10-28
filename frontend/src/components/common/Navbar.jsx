import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiUser as FiUserIcon,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import NextraLogo from "../ai/NextraLogo";
import { notesApi } from "../../api/notes";
import { useUser } from "../../contexts/AuthContext";
import { useAIChat } from "../../contexts/AIContext";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [notes, setNotes] = useState([]);
  const [userDropdown, setUserDropdown] = useState(false);

  const { user, isAuthenticated, logout } = useUser();
  const { openDrawer } = useAIChat();

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  useEffect(() => {
    const cached = sessionStorage.getItem("navbar_notes");
    if (cached) {
      try {
        setNotes(JSON.parse(cached));
        return;
      } catch (e) {}
    }
    notesApi
      .getAll()
      .then((data) => {
        setNotes(data);
        sessionStorage.setItem("navbar_notes", JSON.stringify(data));
      })
      .catch((error) => console.error("Error fetching notes:", error));
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (userDropdown && !e.target.closest(".user-dropdown-area")) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [userDropdown]);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/problems", label: "LeetCode" },
    { path: "/practice", label: "Practice" },
    { path: "/concepts", label: "Concepts" },
    { path: "/notes", label: "Notes" },
  ];

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => {
    setIsOpen(false);
    setActiveMenu(null);
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdown(false);
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 md:py-4 shadow-lg max-w-5xl rounded-full mx-auto w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] bg-white/90 dark:bg-dark-800/95 backdrop-blur-md mt-3 sm:mt-4 border border-beige-200 dark:border-dark-700 sticky top-3 sm:top-4 z-[90]">
        <Link
          to="/"
          className="flex items-center flex-shrink-0"
          onClick={closeMenu}
        >
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8 overflow-hidden">
          <nav className="flex items-center gap-6 lg:gap-8 text-sm font-normal">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`hover:text-leetcode-yellow transition-colors duration-200 whitespace-nowrap ${
                  isActive(link.path)
                    ? "text-leetcode-yellow font-semibold"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="relative w-[52px] h-[28px] rounded-full transition-colors duration-300 focus:outline-none shrink-0"
            style={{
              backgroundColor: theme === "dark" ? "#1F2937" : "#FCD34D",
            }}
          >
            <motion.div
              className="absolute top-[2px] w-[24px] h-[24px] rounded-full flex items-center justify-center shadow-md"
              animate={{
                left: theme === "dark" ? "26px" : "2px",
                backgroundColor: theme === "dark" ? "#374151" : "#FFFFFF",
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === "dark" ? (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiMoon size={14} className="text-blue-300" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiSun size={14} className="text-yellow-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </button>

          {/* User area */}
          {isAuthenticated ? (
            <div className="relative user-dropdown-area">
              <button
                onClick={() => setUserDropdown((v) => !v)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-leetcode-yellow text-gray-900 flex items-center justify-center text-xs font-bold overflow-hidden">
                  {user?.avatar_url ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || ""}${user.avatar_url}`}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.[0]?.toUpperCase() || "U"
                  )}
                </span>
                <span className="hidden sm:inline text-xs font-medium text-gray-800 dark:text-gray-200 max-w-[80px] truncate">
                  {user?.name?.split(" ")[0] || "User"}
                </span>
                <FiChevronDown size={12} className="text-gray-500" />
              </button>

              <AnimatePresence>
                {userDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-dark-800 shadow-xl border border-beige-200 dark:border-dark-700 overflow-hidden z-50"
                  >
                    <div className="px-3 py-2.5 border-b border-beige-200 dark:border-dark-700">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-leetcode-yellow/20 text-leetcode-yellow font-medium capitalize">
                        {user?.tier || "free"}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdown(false)}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors flex items-center gap-2"
                    >
                      <FiUserIcon size={12} /> My Profile
                    </Link>

                    <button
                      onClick={() => {
                        openDrawer();
                        setUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors flex items-center gap-2"
                    >
                      <NextraLogo size={12} /> Open NextraAI
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                      <FiLogOut size={12} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={openDrawer}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-leetcode-yellow text-gray-900 text-xs font-medium hover:bg-yellow-500 transition-colors"
            >
              <FiUser size={12} />
              Login
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 p-1"
          >
            <FiMenu size={26} />
          </button>
        </div>
      </header>

      {/* Mobile menu portal */}
      {createPortal(
        <div
          className={`md:hidden fixed inset-0 z-[100] bg-white/95 dark:bg-dark-900/95 backdrop-blur-md transition-all duration-300 ease-in-out ${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={closeMenu}
            className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 p-2"
          >
            <FiX size={32} />
          </button>

          <div className="flex flex-col items-center justify-center h-full gap-6 text-xl font-medium">
            {activeMenu === null ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMenu}
                    className={`hover:text-leetcode-yellow transition-colors duration-200 ${
                      isActive(link.path)
                        ? "text-leetcode-yellow font-bold"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {!isAuthenticated && (
                  <button
                    onClick={() => {
                      closeMenu();
                      openDrawer();
                    }}
                    className="px-6 py-2 bg-leetcode-yellow text-gray-900 rounded-full text-base font-semibold"
                  >
                    Login / Signup
                  </button>
                )}

                {isAuthenticated && (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className={`hover:text-leetcode-yellow transition-colors duration-200 ${
                        isActive("/profile")
                          ? "text-leetcode-yellow font-bold"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        closeMenu();
                        openDrawer();
                      }}
                      className="px-6 py-2 bg-leetcode-yellow text-gray-900 rounded-full text-base font-semibold flex items-center gap-2"
                    >
                      <NextraLogo size={16} /> Ask NextraAI
                    </button>
                  </>
                )}

                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 mt-4 px-6 py-3 bg-gray-100 dark:bg-dark-700 rounded-full text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                >
                  {theme === "dark" ? (
                    <>
                      <FiSun size={20} className="text-yellow-500" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <FiMoon size={20} className="text-blue-500" />
                      Dark Mode
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveMenu(null)}
                  className="hover:text-leetcode-yellow transition-colors duration-200 text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2"
                >
                  ← Back
                </button>
                <Link
                  to="/notes"
                  onClick={closeMenu}
                  className={`hover:text-leetcode-yellow transition-colors duration-200 ${
                    location.pathname === "/notes"
                      ? "text-leetcode-yellow font-bold"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Notes
                </Link>

                {notes.map((note) => (
                  <Link
                    key={note.id}
                    to={`/notes/${note.slug}`}
                    onClick={closeMenu}
                    className={`hover:text-leetcode-yellow transition-colors duration-200 ${
                      location.pathname === `/notes/${note.slug}`
                        ? "text-leetcode-yellow font-bold"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {note.icon || "📓"} {note.title}
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default Navbar;
