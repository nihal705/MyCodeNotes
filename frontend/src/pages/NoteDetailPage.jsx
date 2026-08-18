import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const data = await notesApi.getBySlug(slug);
        setNote(data);
      } catch (error) {
        console.error("Error fetching note:", error);
        toast.error("Note not found");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [slug]);

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

  // SEARCH FILTER LOGIC INSIDE THE NOTE
  const filteredChapters =
    note?.content?.chapters?.map((chapter) => ({
      ...chapter,
      topics: chapter.topics.filter(
        (topic) =>
          topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.content?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    })) || [];

  if (loading) return <LoadingSpinner />;
  if (!note) return <div className="text-center py-12">Note not found</div>;

  const isProjectsNote =
    note.slug === "web-projects" || (note.content && note.content.projects);

  return (
    <div className="max-w-7xl mx-auto px-4 py-0 space-y-1 -mt-4 -mb-0">
      {/* Back Button */}
      <Link
        to="/notes"
        className="inline-flex items-center text-sm text-leetcode-yellow hover:underline"
      >
        <FiArrowLeft className="mr-1" /> Back
      </Link>

      {/* Header with Search Bar inside */}
      <div className="bg-gradient-to-r from-cream-50 to-beige-50 dark:from-dark-800 dark:to-dark-900 rounded-xl p-6 border border-gray-200 dark:border-dark-700">
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
            {/* SEARCH BAR INSIDE THE NOTE HEADER */}
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
      </div>

      {/* Main Content */}
      {isProjectsNote ? (
        <div>
          {selectedProject === null ? (
            <ProjectList
              projects={note.content.projects || []}
              onSelectProject={handleProjectSelect}
            />
          ) : (
            <ProjectDetailView
              project={note.content.projects[selectedProject]}
              onBack={handleBackToProjects}
            />
          )}
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default NoteDetailPage;
