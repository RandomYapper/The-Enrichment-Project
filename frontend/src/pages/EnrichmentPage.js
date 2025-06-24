import React, { useState } from "react";
import EnrichmentForm from "../components/EnrichmentForm";
import EnrichmentResult from "../components/EnrichmentResult";
import LoadingSpinner from "../components/LoadingSpinner";
import { enrichmentAPI } from "../services/api";

const EnrichmentPage = () => {
  const [enrichmentData, setEnrichmentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEnrichment = async (inputData) => {
    setIsLoading(true);
    setError("");
    setEnrichmentData(null);

    try {
      const result = await enrichmentAPI.enrich(inputData);
      setEnrichmentData(result);
    } catch (err) {
      console.error("Enrichment error:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "An error occurred while enriching the data. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Data Enrichment
        </h1>
        <p className="text-gray-600">
          Enter an email address or company domain to get enriched information
        </p>
      </div>

      {/* Enrichment Form */}
      <EnrichmentForm
        onSubmit={handleEnrichment}
        isLoading={isLoading}
        error={error}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="card max-w-2xl mx-auto">
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Enriching your data..." />
            <p className="text-sm text-gray-500 mt-4">
              This may take a few seconds...
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {enrichmentData && !isLoading && (
        <EnrichmentResult data={enrichmentData} />
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="card max-w-2xl mx-auto">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Enrichment Failed
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={() => setError("")} className="btn-secondary">
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrichmentPage;
