import { useState } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { problemsApi } from "../../api/problems";
import toast from "react-hot-toast";

const AddProblemForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leetcode_id: "",
    title: "",
    difficulty: "",
    statement: "",
    description: "",
    concept: "",
    pattern: "",
    algorithm: "",
    java_solution: "",
    python_solution: "",
  });

  const difficulties = [
    { value: "Easy", label: "Easy" },
    { value: "Medium", label: "Medium" },
    { value: "Hard", label: "Hard" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await problemsApi.create({
        ...formData,
        leetcode_id: parseInt(formData.leetcode_id),
      });
      toast.success("Problem added successfully!");
      setFormData({
        leetcode_id: "",
        title: "",
        difficulty: "",
        statement: "",
        description: "",
        concept: "",
        pattern: "",
        algorithm: "",
        java_solution: "",
        python_solution: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to add problem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LeetCode ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="leetcode_id"
              placeholder="1464"
              value={formData.leetcode_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="Maximum Product of Two Elements"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Difficulty <span className="text-red-500">*</span>
          </label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          >
            <option value="">Select Difficulty</option>
            {difficulties.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Statement <span className="text-red-500">*</span>
          </label>
          <textarea
            name="statement"
            rows={3}
            placeholder="Given an array of integers... "
            value={formData.statement}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="Detailed explanation of the problem..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Concept
          </label>
          <input
            type="text"
            name="concept"
            placeholder="Hash Map, Sorting, Two Pointers..."
            value={formData.concept}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pattern
          </label>
          <input
            type="text"
            name="pattern"
            placeholder="One-pass Hash Table, Two-pointer..."
            value={formData.pattern}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Algorithm
          </label>
          <textarea
            name="algorithm"
            rows={4}
            placeholder="1. Create hash map\n2. Iterate through array\n3. ..."
            value={formData.algorithm}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Java Solution
          </label>
          <textarea
            name="java_solution"
            rows={6}
            placeholder="class Solution {\n    public int[] twoSum...\n}"
            value={formData.java_solution}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white font-mono text-sm"
          />
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Python Solution
          </label>
          <textarea
            name="python_solution"
            rows={6}
            placeholder="class Solution:\n    def twoSum...\n"
            value={formData.python_solution}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white font-mono text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-leetcode-yellow text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add Problem"}
        </button>
      </form>
    </div>
  );
};

export default AddProblemForm;
