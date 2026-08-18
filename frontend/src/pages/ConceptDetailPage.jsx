import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { conceptsApi } from "../api/concepts";
import toast from "react-hot-toast";

const ConceptDetailPage = () => {
  const { id } = useParams();
  const [concept, setConcept] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConcept = async () => {
      try {
        const data = await conceptsApi.getById(id);
        setConcept(data);
      } catch (error) {
        console.error("Error fetching concept:", error);
        toast.error("Concept not found");
      } finally {
        setLoading(false);
      }
    };
    fetchConcept();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!concept)
    return <div className="text-center py-12">Concept not found</div>;

  return (
    <div className="container-custom mx-auto">
      <div className="space-y-0">
        <Link
          to="/concepts"
          className="inline-flex items-center text-leetcode-yellow hover:underline"
        >
          <FiArrowLeft className="mr-2" /> Back to Concepts
        </Link>

        <Card>
          <CardHeader>
            <h1 className="text-2xl md:text-3xl font-bold">{concept.name}</h1>
          </CardHeader>

          <CardBody className="space-y-6">
            {/* Definition */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Definition:</h2>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-700 border border-gray-200">
                {concept.definition}
              </div>
            </div>

            {/* Example */}
            {concept.example && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Example:</h2>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-700 border border-gray-200 whitespace-pre-wrap">
                  {concept.example}
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
