import { motion } from 'framer-motion'
import { FiShield, FiFileText, FiLock, FiUser, FiMail, FiGithub } from 'react-icons/fi'

const TermsPrivacyPage = () => {
  return (
    <div className="container-custom mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-leetcode-yellow/10 text-leetcode-yellow mb-4">
            <FiShield size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Terms & Privacy Policy
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Section 1: Introduction */}
          <section className="bg-white dark:bg-dark-800 rounded-xl p-6 -mt-6 shadow-sm border border-beige-200 dark:border-dark-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <FiFileText className="text-leetcode-yellow" />
              Introduction
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Welcome to MyCodeNotes. This page explains our terms of use and privacy practices. 
              By using this website, you agree to the terms outlined below. This is a personal 
              learning journal and knowledge base, not a commercial service.
            </p>
          </section>

          {/* Section 2: Terms of Use */}
          <section className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm border border-beige-200 dark:border-dark-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <FiLock className="text-leetcode-yellow" />
              Terms of Use
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>• This website is a personal learning journal and knowledge base.</p>
              <p>• All content (problems, solutions, notes, concepts) is my personal work.</p>
              <p>• You may use this site for learning and reference purposes.</p>
              <p>• You may not copy, redistribute, or claim the content as your own.</p>
              <p>• The code is open source (MIT License) — the content is All Rights Reserved.</p>
              <p>• This site is provided "as is" without any warranties.</p>
              <p>• We reserve the right to update these terms at any time.</p>
            </div>
          </section>

          {/* Section 3: Privacy Policy */}
          <section className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm border border-beige-200 dark:border-dark-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <FiShield className="text-leetcode-yellow" />
              Privacy Policy
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p><strong className="text-gray-800 dark:text-gray-200">Data Collection:</strong> We collect minimal data — only what's necessary for the website to function.</p>
              <p><strong className="text-gray-800 dark:text-gray-200">Local Storage:</strong> We use localStorage to remember your preferences and session data.</p>
              <p><strong className="text-gray-800 dark:text-gray-200">No Tracking:</strong> We do not use tracking cookies, analytics, or third-party trackers.</p>
              <p><strong className="text-gray-800 dark:text-gray-200">No Data Sharing:</strong> Your data stays on your device. We don't sell or share any data.</p>
              <p><strong className="text-gray-800 dark:text-gray-200">Admin Authentication:</strong> Admin login uses JWT tokens stored in localStorage.</p>
              <p><strong className="text-gray-800 dark:text-gray-200">Contact:</strong> If you have questions, email us at nihalmohammad705@gmail.com</p>
            </div>
          </section>

          {/* Section 4: Open Source */}
          <section className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm border border-beige-200 dark:border-dark-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <FiGithub className="text-leetcode-yellow" />
              Open Source
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p><strong className="text-gray-800 dark:text-gray-200">Code:</strong> The source code is open source under the MIT License.</p>
              <p><strong className="text-gray-800 dark:text-gray-200">Content:</strong> The content (problems, solutions, notes) is All Rights Reserved.</p>
              <p><strong className="text-gray-800 dark:text-gray-200">Repository:</strong> View the source code on GitHub: <a 
                href="https://github.com/nihal705/MyCodeNotes" 
                target="_blank" 
                rel="noopener noreferrer"
                className=" text-gray-700 hover:text-leetcode-yellow transition-all duration-200 hover:underline"
              >
                github.com/nihal705/MyCodeNotes
              </a></p>
              <p><strong className="text-gray-800 dark:text-gray-200">Learn & Build:</strong> Feel free to learn from the code and build your own version!</p>
            </div>
          </section>

          {/* Section 5: Contact */}
          <section className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm border border-beige-200 dark:border-dark-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <FiMail className="text-leetcode-yellow" />
              Contact
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>If you have any questions about these terms or privacy practices:</p>
              <div className="flex flex-wrap gap-4 mt-2">
                <a 
                  href="mailto:nihalmohammad705@gmail.com"
                  className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-leetcode-yellow transition-all duration-200 hover:underline"
                >
                  <FiMail size={16} />
                  nihalmohammad705@gmail.com
                </a>
                <a 
                  href="https://github.com/nihal705"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-leetcode-yellow transition-all duration-200 hover:underline"
                >
                  <FiGithub size={16} />
                  github.com/nihal705
                </a>
                <a
                  href="https://linkedin.com/in/gnihal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-leetcode-yellow transition-all duration-200 hover:underline"
                >
                  <FiUser size={16} />
                  LinkedIn
                </a>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  )
}

export default TermsPrivacyPage