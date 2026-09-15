import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiMenu, FiX, FiSun, FiMoon } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import { notesApi } from "../../api/notes";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [notes, setNotes] = useState([]);

  // Theme state
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

    const fetchNotes = async () => {
      try {
        const data = await notesApi.getAll();
        setNotes(data);
        sessionStorage.setItem("navbar_notes", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
    fetchNotes();
  }, []);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/problems", label: "LeetCode" },
    { path: "/practice", label: "Practice" },
    { path: "/concepts", label: "Concepts" },
    { path: "/notes", label: "Notes" },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => setIsOpen(!isOpen);

  const closeMenu = () => {
    setIsOpen(false);
    setActiveMenu(null);
  };

  const handleBack = () => setActiveMenu(null);

  const mainNavVariants = {
    visible: { x: 0, opacity: 1 },
    hidden: { x: -20, opacity: 0 },
  };

  const subNavVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 md:py-4 shadow-lg max-w-5xl rounded-full mx-auto w-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-md mt-4 border border-beige-200 dark:border-dark-700 relative">
        <Link to="/" className="flex items-center flex-shrink-0" onClick={closeMenu}>
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeMenu === null ? (
              <motion.nav
                key="main-nav"
                initial="visible"
                animate="visible"
                exit="hidden"
                variants={mainNavVariants}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex items-center gap-6 lg:gap-8 text-gray-900 dark:text-gray-100 text-sm font-normal"
              >
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
              </motion.nav>
            ) : (
              <motion.nav
                key="sub-nav"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={subNavVariants}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex items-center gap-4 lg:gap-6 text-gray-900 dark:text-gray-100 text-sm font-normal"
              >
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  ←<span>Back</span>
                </button>
                <div className="h-5 w-px bg-gray-300 dark:bg-dark-600" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">Notes</span>
                <div className="h-5 w-px bg-gray-300 dark:bg-dark-600" />
                <div className="flex items-center gap-4 lg:gap-6"></div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center space-x-3 md:space-x-4">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="relative w-[52px] h-[28px] rounded-full transition-colors duration-300 focus:outline-none shrink-0"
            style={{ backgroundColor: theme === "dark" ? "#1F2937" : "#FCD34D" }}
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

          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 p-1"
          >
            <FiMenu size={28} />
          </button>
        </div>
      </header>

      {createPortal(
        <div
          className={`md:hidden fixed inset-0 z-50 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md transition-all duration-300 ease-in-out ${
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
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
                  onClick={handleBack}
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