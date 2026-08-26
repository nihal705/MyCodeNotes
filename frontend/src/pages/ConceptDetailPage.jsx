import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiArrowUp, FiBook } from "react-icons/fi";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { conceptsApi } from "../api/concepts";
import toast from "react-hot-toast";

const ConceptDetailPage = () => {
  const { id } = useParams();
  const [concept, setConcept] = useState(null);
  const [relatedConcepts, setRelatedConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchConcept = async () => {
      try {
        const data = await conceptsApi.getById(id);
        setConcept(data);
        
        // Fetch related concepts (similar names or categories)
        if (data.name) {
          const allConcepts = await conceptsApi.getAll();
          const related = allConcepts.filter(c => 
            c.id !== parseInt(id) && 
            (c.name.toLowerCase().includes(data.name.split(' ')[0]?.toLowerCase() || '') ||
             data.name.toLowerCase().includes(c.name.split(' ')[0]?.toLowerCase() || ''))
          );
          setRelatedConcepts(related.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching concept:", error);
        toast.error("Concept not found");
      } finally {
        setLoading(false);
      }
    };
    fetchConcept();
  }, [id]);

  // Scroll handler for back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <LoadingSpinner />;
  if (!concept) return <div className="text-center py-12 text-gray-600 dark:text-gray-400">Concept not found</div>;

  return (
    <div className="container-custom mx-auto px-4 sm:px-6 pb-20" ref={contentRef}>
      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-[#FFA116] text-gray-900 rounded-full shadow-lg hover:bg-yellow-500 transition-all duration-300 hover:scale-110"
          aria-label="Back to top"
        >
          <FiArrowUp size={20} />
        </button>
      )}

      <div className="space-y-0">
        <Link
          to="/concepts"
          className="inline-flex items-center text-leetcode-yellow hover:underline"
        >
          <FiArrowLeft className="mr-2" /> Back to Concepts
        </Link>

        <Card className="overflow-hidden">
          <CardHeader>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{concept.name}</h1>
          </CardHeader>

          <CardBody className="space-y-6 p-4 sm:p-6">
            {/* Definition */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Definition:</h2>
              <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-700 leading-relaxed">
                {concept.definition}
              </div>
            </div>

            {/* Example */}
            {concept.example && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Example:</h2>
                <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-700 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {concept.example}
                </div>
              </div>
            )}

            {/* Related Concepts */}
            {relatedConcepts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiBook size={18} className="text-[#FFA116]" /> Related Concepts
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedConcepts.map((related) => (
                    <Link
                      key={related.id}
                      to={`/concepts/${related.id}`}
                      className="group p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 hover:border-[#FFA116] hover:shadow-md transition-all duration-300"
                    >
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-[#FFA116] transition-colors">
                        {related.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {related.definition?.substring(0, 100)}...
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ConceptDetailPage;