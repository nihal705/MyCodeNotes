import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import NoteDetail from "../components/notes/NoteDetail";
import TableOfContents from "../components/notes/TableOfContents";
import ProjectList from "../components/projects/ProjectList";
import ProjectDetailView from "../components/projects/ProjectDetailView";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { notesApi } from "../api/notes";
import toast from "react-hot-toast";
import { FiCode, FiBox, FiDownload } from "react-icons/fi";
import { downloadNoteAsPDF } from "../utils/pdfGenerator";
import { SiPython } from "react-icons/si";

const NoteDetailPage = () => {
  const { slug } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeTopic, setActiveTopic] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mouse position for 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const data = await notesApi.getBySlug(slug);
        setNote(data);
        console.log("📝 Note data:", data);
        console.log("📝 Content:", data?.content);
        console.log("📝 Has projects:", data?.content?.projects);
        console.log("📝 Has chapters:", data?.content?.chapters);
      } catch (error) {
        console.error("Error fetching note:", error);
        toast.error("Note not found");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [slug]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!note || !note.content?.chapters) return;

      const totalChapters = note.content.chapters.length;
      const totalTopics = note.content.chapters[activeChapter]?.topics?.length || 0;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (activeTopic < totalTopics - 1) {
          setActiveTopic(activeTopic + 1);
        } else if (activeChapter < totalChapters - 1) {
          setActiveChapter(activeChapter + 1);
          setActiveTopic(0);
        }
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (activeTopic > 0) {
          setActiveTopic(activeTopic - 1);
        } else if (activeChapter > 0) {
          setActiveChapter(activeChapter - 1);
          const prevChapterTopics = note.content.chapters[activeChapter - 1]?.topics?.length || 0;
          setActiveTopic(prevChapterTopics - 1);
        }
      }

      if (e.key === "Home") {
        e.preventDefault();
        setActiveChapter(0);
        setActiveTopic(0);
      }

      if (e.key === "End") {
        e.preventDefault();
        setActiveChapter(totalChapters - 1);
        const lastChapterTopics = note.content.chapters[totalChapters - 1]?.topics?.length || 0;
        setActiveTopic(lastChapterTopics - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [note, activeChapter, activeTopic]);

  const handleTopicClick = (chapterIndex, topicIndex) => {
    setActiveChapter(chapterIndex);
    setActiveTopic(topicIndex);
  };

  const handleProjectSelect = (index) => {
    setSelectedProject(index);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const filteredChapters =
    note?.content?.chapters?.map((chapter) => ({
      ...chapter,
      topics: chapter.topics.filter(
        (topic) =>
          topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.content?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    })) || [];

  // 🎯 PROGRESS PERCENTAGE
  const totalChapters = note?.content?.chapters?.length || 0;
  const progressPercentage = totalChapters > 0 ? ((activeChapter + 1) / totalChapters) * 100 : 0;

  if (loading) return <LoadingSpinner />;
  if (!note) return <div className="text-center py-12">Note not found</div>;

  // ✅ FIX: Check if this is a projects note (supports multiple slugs)
  const isProjectsNote = 
    note.content?.projects && 
    Array.isArray(note.content.projects) && 
    note.content.projects.length > 0;

  // ✅ Also check if it has projects in any form
  const hasProjects = note.content?.projects && note.content.projects.length > 0;
  const hasChapters = note.content?.chapters && note.content.chapters.length > 0;

  console.log("📊 isProjectsNote:", isProjectsNote);
  console.log("📊 hasProjects:", hasProjects);
  console.log("📊 hasChapters:", hasChapters);

  return (
    <div className="max-w-7xl mx-auto px-4 py-0 space-y-1 -mt-4 -mb-0">
      {/* 🎯 PROGRESS BAR AT TOP */}
      <motion.div
        className="fixed top-0 left-0 h-1 z-50"
        style={{
          width: `${progressPercentage}%`,
          background: "linear-gradient(90deg, #FFA116, #FF6B35)",
          boxShadow: "0 0 30px rgba(255,161,22,0.3)",
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />

      {/* Back Button */}
      <Link
        to="/notes"
        className="inline-flex items-center text-sm text-leetcode-yellow hover:underline"
      >
        <FiArrowLeft className="mr-1" /> Back
      </Link>

      {/* 🎯 3D TILT CARD - Header */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          perspective: 1000,
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          mouseX.set(x);
          mouseY.set(y);
        }}
        onMouseLeave={() => {
          mouseX.set(0);
          mouseY.set(0);
        }}
        className="bg-gradient-to-r from-cream-50 to-beige-50 dark:from-dark-800 dark:to-dark-900 rounded-xl p-6 border border-gray-200 dark:border-dark-700 transition-shadow duration-300 hover:shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left Side: Icon + Title + Description + Tags */}
          <div className="flex items-center gap-3 flex-1">
            <div className="text-4xl text-leetcode-yellow shrink-0">
              {note.slug === "web-development" ? (
                <FiCode />
              ) : note.slug === "web-projects" ? (
                <FiBox />
              ) : note.slug === "python" ? (
                <SiPython />
              ) : (
                note.icon || "📓"
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                {note.title}
              </h1>
              {note.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  {note.description}
                </p>
              )}
              {note.tags && note.tags.length > 0 && (
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {note.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-gray-100 dark:bg-dark-700 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Search + Download Button */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex items-center bg-white dark:bg-dark-800 rounded-lg px-3 py-2 border border-gray-300 dark:border-dark-600 shadow-sm">
              <FiSearch className="text-gray-400 text-sm mr-2" />
              <input
                type="text"
                placeholder="Search in this note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 min-w-[180px]"
              />
            </div>
            <button
              onClick={() => downloadNoteAsPDF(note)}
              className="flex items-center gap-2 text-sm bg-leetcode-yellow text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors shrink-0 self-start"
            >
              <FiDownload size={16} /> Download PDF
            </button>
          </div>
        </div>
      </motion.div>

      {/* Navigation Hint */}
      <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-4 px-1 py-1">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-700 rounded text-[10px]">←</kbd>
          <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-700 rounded text-[10px]">→</kbd>
          <span>Navigate topics</span>
        </span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-700 rounded text-[10px]">Home</kbd>
          <span>/</span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-700 rounded text-[10px]">End</kbd>
          <span>First/Last</span>
        </span>
      </div>

      {/* 🎯 MAIN CONTENT - Check for projects OR chapters */}
      {isProjectsNote && hasProjects ? (
        // ✅ Show Projects View
        <div>
          {selectedProject === null ? (
            <ProjectList
              projects={note.content.projects}
              onSelectProject={handleProjectSelect}
            />
          ) : (
            <ProjectDetailView
              project={note.content.projects[selectedProject]}
              onBack={handleBackToProjects}
            />
          )}
        </div>
      ) : hasChapters ? (
        // ✅ Show Chapters View
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <TableOfContents
                chapters={filteredChapters}
                activeChapter={activeChapter}
                activeTopic={activeTopic}
                onTopicClick={handleTopicClick}
              />
            </div>
          </div>
          <div className="lg:col-span-3">
            <NoteDetail
              chapters={filteredChapters}
              activeChapter={activeChapter}
              activeTopic={activeTopic}
            />
          </div>
        </div>
      ) : (
        // ✅ Show Fallback Message
        <div className="bg-white dark:bg-dark-800 rounded-xl p-12 text-center border border-beige-200 dark:border-dark-700">
          <p className="text-gray-500 dark:text-gray-400">No content available for this note.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            This note doesn't have any chapters or projects yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default NoteDetailPage;