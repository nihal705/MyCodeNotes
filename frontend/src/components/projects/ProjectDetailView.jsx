import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiFolder,
  FiFile,
  FiGithub,
  FiExternalLink,
  FiImage,
  FiBookOpen,
} from "react-icons/fi";
import CodeBlock from "../notes/CodeBlock";

const ProjectDetailView = ({ project, onBack }) => {
  const [selectedFile, setSelectedFile] = useState(0);

  if (!project) return null;

  // Helper to check if a file is an image
  const isImageFile = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-beige-200 dark:border-dark-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-beige-200 dark:border-dark-700">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-3 transition-colors text-sm"
        >
          <FiArrowLeft size={16} /> Back to Projects
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {project.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {project.tech_stack?.map((tech, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-gray-100 dark:bg-dark-700 px-2 py-0.5 rounded-full text-gray-500 dark:text-gray-400"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            {project.live_demo && (
              <a
                href={project.live_demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-leetcode-yellow text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors text-sm"
              >
                <FiExternalLink size={14} /> Live
              </a>
            )}
            {project.github_link && (
              <a
                href={project.github_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors text-sm"
              >
                <FiGithub size={14} /> GitHub
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Conditionally Render Code Viewer OR Guide */}
      {project.code_files && project.code_files.length > 0 ? (
        // VS Code Style Layout (For projects with code files)
        <div className="flex flex-col md:flex-row h-[500px]">
          {/* File Explorer - Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-50 dark:bg-dark-900 border-r border-beige-200 dark:border-dark-700 overflow-y-auto p-3">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <FiFolder size={14} /> File Structure
            </h4>
            <div className="space-y-1.5">
              {project.file_structure?.map((folder, idx) => (
                <div key={idx} className="mb-1.5">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <FiFolder className="text-blue-400" size={14} />{" "}
                    {folder.folder}
                  </div>
                  <div className="pl-5 space-y-0.5 mt-0.5">
                    {folder.files?.map((file, fileIdx) => {
                      const fileIndex = project.code_files?.findIndex(
                        (cf) => cf.filename === file
                      );
                      const isImage = isImageFile(file);
                      return (
                        <button
                          key={fileIdx}
                          onClick={() =>
                            setSelectedFile(fileIndex >= 0 ? fileIndex : 0)
                          }
                          className={`w-full text-left text-xs px-2 py-0.5 rounded flex items-center gap-1.5 transition-colors ${
                            selectedFile === fileIndex
                              ? "bg-leetcode-yellow/20 text-leetcode-yellow font-medium"
                              : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-700"
                          }`}
                        >
                          {isImage ? (
                            <FiImage size={12} className="text-pink-400" />
                          ) : (
                            <FiFile size={12} className="text-gray-400" />
                          )}
                          <span className="truncate">{file}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Editor / Image Viewer - Main Content */}
          <div className="flex-1 overflow-y-auto p-5 bg-white dark:bg-dark-800">
            {project.code_files && project.code_files[selectedFile] ? (
              <div>
                <div className="mb-3 flex justify-between items-center border-b border-beige-200 dark:border-dark-700 pb-2">
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {project.code_files[selectedFile].filename}
                  </span>
                  <span className="text-[10px] bg-gray-100 dark:bg-dark-700 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">
                    {project.code_files[selectedFile].language}
                  </span>
                </div>

                {/* If it's an image, show it with download instruction */}
                {isImageFile(project.code_files[selectedFile].filename) ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="relative group max-w-full">
                      <a
                        href={project.code_files[selectedFile].code}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={project.code_files[selectedFile].code}
                          alt={project.code_files[selectedFile].filename}
                          className="max-h-[400px] max-w-full rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 object-contain"
                        />
                      </a>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg pointer-events-none"></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      💡 Right-click the image and select "Save Image As..." to
                      download.
                    </p>
                  </div>
                ) : (
                  <CodeBlock
                    language={project.code_files[selectedFile].language}
                    code={project.code_files[selectedFile].code}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-sm text-gray-500">
                Select a file from the sidebar to view.
              </div>
            )}
          </div>
        </div>
      ) : project.guide && project.guide.length > 0 ? (
        // Guide View (For projects with only a GitHub link and guide)
        <div className="p-6 bg-white dark:bg-dark-800">
          <div className="flex items-center gap-2 mb-4">
            <FiBookOpen className="text-leetcode-yellow" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Guide
            </h3>
          </div>
          <div className="space-y-4">
            {project.guide.map((step, index) => (
              <div
                key={index}
                className="border border-gray-100 dark:border-dark-700 rounded-lg p-4 bg-gray-50 dark:bg-dark-900/50"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {step.step}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Fallback (If nothing exists)
        <div className="p-12 text-center text-gray-500">
          <p>No source code or guide available for this project.</p>
          <p className="text-sm mt-2">
            Check the GitHub link above for more details.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ProjectDetailView;