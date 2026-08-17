import { useState, useEffect } from "react";
import ConceptList from "../components/concepts/ConceptList";
import SearchBar from "../components/common/SearchBar";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { conceptsApi } from "../api/concepts";

const ConceptsPage = () => {
  const [concepts, setConcepts] = useState([]);
  const [filteredConcepts, setFilteredConcepts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConcepts = async () => {
      try {
        const data = await conceptsApi.getAll();
        setConcepts(data);
        setFilteredConcepts(data);
      } catch (error) {
        console.error("Error fetching concepts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConcepts();
  }, []);

  const handleSearch = (query) => {
    if (!query) {
      setFilteredConcepts(concepts);
      return;
    }
    const searchLower = query.toLowerCase();
    const filtered = concepts.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.definition.toLowerCase().includes(searchLower),
    );
    setFilteredConcepts(filtered);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-custom mx-auto">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Programming Fundamentals & Concepts
            </h1>
            <p className="text-gray-600 mt-1">
              Quick reference for programming concepts with examples
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {filteredConcepts.length} concepts found
          </div>
        </div>

        <SearchBar
          onSearch={handleSearch}
          placeholder="Search concepts by name or definition..."
        />

        <ConceptList concepts={filteredConcepts} />
      </div>
    </div>
  );
};

export default ConceptsPage;
