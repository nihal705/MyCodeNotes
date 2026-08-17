import { motion } from 'framer-motion'
import { FiGithub, FiExternalLink, FiFolder } from 'react-icons/fi'

const ProjectList = ({ projects, onSelectProject }) => {
  if (!projects || projects.length === 0) {
    return <div className="text-center py-10 text-gray-500">No projects found.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((project, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelectProject(index)}
          className="bg-white dark:bg-dark-800 rounded-xl p-5 shadow-sm border border-beige-200 dark:border-dark-700 hover:shadow-md hover:border-leetcode-yellow cursor-pointer transition-all duration-200 flex flex-col h-[230px]"
        >
          <div className="flex flex-col h-full">
            {/* Title & Tech Stack - With proper truncation */}
            <div className="flex justify-between items-start gap-2 mb-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate flex-1">
                {project.name}
              </h3>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                {project.tech_stack?.join(' · ') || 'Web'}
              </span>
            </div>
            
            {/* Description - Prevents breaking with line-clamp */}
            <p className="text-sm text-gray-500 dark:text-gray-400 flex-1 line-clamp-2 break-words">
              {project.description}
            </p>

            {/* Footer - Only show if links exist */}
            <div className="flex gap-3 mt-3 pt-3 border-t border-beige-200 dark:border-dark-700 text-sm">
              {project.live_demo && (
                <a 
                  href={project.live_demo} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => e.stopPropagation()} 
                  className="flex items-center gap-1 text-leetcode-yellow hover:underline"
                >
                  <FiExternalLink size={14} /> Live
                </a>
              )}
              
              {project.github_link && (
                <a 
                  href={project.github_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => e.stopPropagation()} 
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <FiGithub size={14} /> GitHub
                </a>
              )}
              
              {/* Folder count is ALWAYS shown */}
              <span className="text-gray-400 flex items-center gap-1 ml-auto">
                <FiFolder size={14} /> {project.file_structure?.length || 0}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default ProjectList