import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  FiArrowLeft,
  FiSearch,
  FiMenu,
  FiX,
  FiCode,
  FiBox,
  FiDownload,
} from "react-icons/fi";
import NoteDetail from "../components/notes/NoteDetail";
import TableOfContents from "../components/notes/TableOfContents";
import ProjectList from "../components/projects/ProjectList";
import ProjectDetailView from "../components/projects/ProjectDetailView";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { notesApi } from "../api/notes";
import toast from "react-hot-toast";
import { downloadNoteAsPDF } from "../utils/pdfGenerator";
import { SiPython, SiDocker, SiGithub, SiReact, SiRedux } from "react-icons/si";

const NoteDetailPage = () => {
  const { slug } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeTopic, setActiveTopic] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTocOpen, setIsTocOpen] = useState(false);

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
      } catch (error) {
        toast.error("Note not found");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [slug]);

  // Shared navigation logic
  const navigateTopic = (direction) => {
    if (!note || !note.content?.chapters) return;

    const chapters = note.content.chapters;
    const totalChapters = chapters.length;
    const totalTopics = chapters[activeChapter]?.topics?.length || 0;

    if (direction === "next") {
      if (activeTopic < totalTopics - 1) {
        setActiveTopic(activeTopic + 1);
      } else if (activeChapter < totalChapters - 1) {
        setActiveChapter(activeChapter + 1);
        setActiveTopic(0);
      }
    } else if (direction === "prev") {
      if (activeTopic > 0) {
        setActiveTopic(activeTopic - 1);
      } else if (activeChapter > 0) {
        setActiveChapter(activeChapter - 1);
        const prevChapterTopics =
          chapters[activeChapter - 1]?.topics?.length || 0;
        setActiveTopic(prevChapterTopics - 1);
      }
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!note || !note.content?.chapters) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateTopic("next");
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateTopic("prev");
      }

      if (e.key === "Home") {
        e.preventDefault();
        setActiveChapter(0);
        setActiveTopic(0);
      }

      if (e.key === "End") {
        e.preventDefault();
        const totalChapters = note.content.chapters.length;
        setActiveChapter(totalChapters - 1);
        const lastChapterTopics =
          note.content.chapters[totalChapters - 1]?.topics?.length || 0;
        setActiveTopic(lastChapterTopics - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [note, activeChapter, activeTopic]);

  const handleTopicClick = (chapterIndex, topicIndex) => {
    setActiveChapter(chapterIndex);
    setActiveTopic(topicIndex);
    setIsTocOpen(false); // Close drawer on mobile after selection
  };

  const handleProjectSelect = (index) => {
    setSelectedProject(index);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  // Calculate total topics across all chapters
  const getTotalTopics = () => {
    if (!note?.content?.chapters) return 0;
    return note.content.chapters.reduce(
      (acc, ch) => acc + (ch.topics?.length || 0),
      0,
    );
  };

  // Calculate current topic index across all chapters
  const getCurrentTopicIndex = () => {
    if (!note?.content?.chapters) return 0;
    let index = 0;
    for (let i = 0; i < activeChapter; i++) {
      index += note.content.chapters[i]?.topics?.length || 0;
    }
    index += activeTopic;
    return index;
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

  const totalChapters = note?.content?.chapters?.length || 0;
  const progressPercentage =
    totalChapters > 0 ? ((activeChapter + 1) / totalChapters) * 100 : 0;
  const totalTopics = getTotalTopics();
  const currentTopicIndex = getCurrentTopicIndex();

  if (loading) return <LoadingSpinner />;
  if (!note) return <div className="text-center py-12">Note not found</div>;

  const isProjectsNote =
    note.content?.projects &&
    Array.isArray(note.content.projects) &&
    note.content.projects.length > 0;
  const hasProjects =
    note.content?.projects && note.content.projects.length > 0;
  const hasChapters =
    note.content?.chapters && note.content.chapters.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-0 space-y-1 -mt-4 -mb-0">
      {/* Progress Bar */}
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

      {/* 3D TILT CARD - Header */}
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
              ) : note.slug === "docker-guide" ? (
                <SiDocker />
              ) : note.slug === "git-github-guide" ? (
                <SiGithub />
              ) : note.slug === "react-basics" ||
                note.slug === "react-projects" ? ( 
                <SiReact />
              ) : note.slug === "react-redux" ? (
                <SiRedux />
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

          {/* Right Side: Search + Download + TOC Toggle */}
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
              className="flex items-center gap-2 text-sm bg-leetcode-yellow text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors shrink-0"
            >
              <FiDownload size={16} /> Download PDF
            </button>
            {/* TOC Toggle Button */}
            {hasChapters && (
              <button
                onClick={() => setIsTocOpen(!isTocOpen)}
                className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors lg:hidden"
              >
                {isTocOpen ? <FiX size={16} /> : <FiMenu size={16} />}
                {isTocOpen ? "Close" : "Contents"}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Breadcrumb + Chapter Tabs Strip */}
      {hasChapters && (
        <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-beige-200 dark:border-dark-700">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">
                Chapter {activeChapter + 1}:
              </span>
              <span className="ml-1">
                {note.content.chapters[activeChapter]?.title}
              </span>
              <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
              <span className="text-gray-500 dark:text-gray-400">
                Topic {activeTopic + 1} of{" "}
                {note.content.chapters[activeChapter]?.topics?.length || 0}
              </span>
              <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs">
                Page {currentTopicIndex + 1} of {totalTopics}
              </span>
            </div>
          </div>

          {/* Chapter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-dark-600">
            {note.content.chapters.map((chapter, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveChapter(index);
                  setActiveTopic(0);
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeChapter === index
                    ? "bg-leetcode-yellow text-gray-900 shadow-md"
                    : "bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600"
                }`}
              >
                {chapter.title || `Chapter ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      {isProjectsNote && hasProjects ? (
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
        <div className="relative">
          {/* TOC Drawer - Mobile */}
          {isTocOpen && (
            <div
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsTocOpen(false)}
            >
              <div
                className="fixed right-0 top-0 h-full w-[320px] max-w-[85vw] bg-white dark:bg-dark-800 shadow-2xl p-4 overflow-y-auto z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Contents
                  </h3>
                  <button
                    onClick={() => setIsTocOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
                  >
                    <FiX
                      size={20}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  </button>
                </div>
                <TableOfContents
                  chapters={filteredChapters}
                  activeChapter={activeChapter}
                  activeTopic={activeTopic}
                  onTopicClick={handleTopicClick}
                />
              </div>
            </div>
          )}

          {/* Desktop: Sidebar + Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Desktop TOC - Persistent */}
            <div className="hidden lg:block lg:col-span-1">
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
                onNavigate={navigateTopic}
                totalTopics={totalTopics}
                currentTopicIndex={currentTopicIndex}
              />
            </div>
          </div>

          {/* Floating TOC Button - Mobile */}
          {!isTocOpen && (
            <button
              onClick={() => setIsTocOpen(true)}
              className="lg:hidden fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-leetcode-yellow text-gray-900 px-5 py-3 rounded-full shadow-lg hover:bg-yellow-500 transition-all duration-200 font-medium"
            >
              <FiMenu size={18} />
              Contents
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-800 rounded-xl p-12 text-center border border-beige-200 dark:border-dark-700">
          <p className="text-gray-500 dark:text-gray-400">
            No content available for this note.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            This note doesn't have any chapters or projects yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default NoteDetailPage;
