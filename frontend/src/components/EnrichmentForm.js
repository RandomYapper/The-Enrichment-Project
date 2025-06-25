import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

const EnrichmentForm = ({ onSubmit, isLoading, error }) => {
  const [inputData, setInputData] = useState("");
  const [useAIAgent, setUseAIAgent] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationError("");

    // Basic validation
    if (!inputData.trim()) {
      setValidationError(
        "Please enter an email address, domain, or natural language query"
      );
      return;
    }

    // If AI agent is disabled, validate as email/domain
    if (!useAIAgent) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const domainRegex =
        /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

      if (!emailRegex.test(inputData) && !domainRegex.test(inputData)) {
        setValidationError("Please enter a valid email address or domain");
        return;
      }
    }

    onSubmit(inputData.trim(), useAIAgent);
  };

  const handleInputChange = (e) => {
    setInputData(e.target.value);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
  };

  const handleAIToggle = () => {
    setUseAIAgent(!useAIAgent);
    // Clear validation error when switching modes
    if (validationError) {
      setValidationError("");
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Enrich Customer Data
        </h2>
        <p className="text-gray-600">
          {useAIAgent
            ? "Use natural language to find and enrich contact information"
            : "Enter an email address or company domain to get enriched information"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* AI Agent Toggle */}
        <div className="flex items-center justify-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Basic Mode</span>
          <button
            type="button"
            onClick={handleAIToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              useAIAgent ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                useAIAgent ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-700">AI Agent</span>
        </div>

        <div>
          <label
            htmlFor="inputData"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {useAIAgent ? "Natural Language Query" : "Email Address or Domain"}
          </label>
          <input
            type="text"
            id="inputData"
            value={inputData}
            onChange={handleInputChange}
            placeholder={
              useAIAgent
                ? "e.g., I want to contact CTOs at fintech startups in India"
                : "e.g., john.doe@example.com or example.com"
            }
            className="input-field"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            {useAIAgent
              ? "Describe what you're looking for in natural language"
              : "Enter a valid email address or company domain"}
          </p>
        </div>

        {/* Error Messages */}
        {(validationError || error) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{validationError || error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !inputData.trim()}
          className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" text="" />
              <span>
                {useAIAgent ? "Processing with AI..." : "Enriching Data..."}
              </span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>{useAIAgent ? "Search with AI" : "Enrich Data"}</span>
            </>
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              {useAIAgent ? "AI Agent Mode" : "Basic Mode"}
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              {useAIAgent
                ? "Our AI agent uses OpenAI to understand your query and searches multiple data sources including People Data Labs, FullEnrich, and more to find relevant contacts."
                : "Our system uses People Data Lab API to enrich your data. If no API key is configured or no data was found, we'll show you mock data for demonstration purposes."}
            </p>
          </div>
        </div>
      </div>

      {/* AI Examples */}
      {useAIAgent && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-2">
            Example Queries:
          </h4>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• "Find CTOs at fintech startups in India"</li>
            <li>• "Marketing directors at enterprise companies in the US"</li>
            <li>• "Sales managers in the healthcare industry"</li>
            <li>• "Product managers at SaaS companies in Europe"</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default EnrichmentForm;
