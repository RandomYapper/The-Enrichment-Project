import React, { useState } from "react";
import EnrichmentForm from "../components/EnrichmentForm";
import EnrichmentResult from "../components/EnrichmentResult";
import LoadingSpinner from "../components/LoadingSpinner";
import { enrichmentAPI, aiAgentAPI, fullenrichAPI } from "../services/api";

const EnrichmentPage = () => {
  const [enrichmentData, setEnrichmentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiAgentStatus, setAiAgentStatus] = useState(null);
  const [polling, setPolling] = useState(false);
  const [pollingMessage, setPollingMessage] = useState("");

  // Check AI agent status on component mount
  React.useEffect(() => {
    checkAIAgentStatus();
  }, []);

  const checkAIAgentStatus = async () => {
    try {
      const status = await aiAgentAPI.health();
      setAiAgentStatus(status);
    } catch (err) {
      console.log("AI agent status check failed:", err);
      setAiAgentStatus({ ai_agent_enabled: false });
    }
  };

  // Poll for FullEnrich results by enrichment_id
  const pollFullEnrichResult = async (
    enrichmentId,
    maxAttempts = 20,
    interval = 3000
  ) => {
    setPolling(true);
    setPollingMessage("Waiting for FullEnrich to return results...");
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        const result = await fullenrichAPI.getResult(enrichmentId);
        if (result && result.status !== "pending") {
          setEnrichmentData(result);
          setPolling(false);
          setPollingMessage("");
          return;
        }
      } catch (err) {
        // Ignore errors during polling
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
      attempts++;
    }
    setPolling(false);
    setPollingMessage("");
    setError(
      "Timed out waiting for FullEnrich results. Please try again later."
    );
  };

  const handleEnrichment = async (inputData, useAIAgent = false) => {
    setIsLoading(true);
    setError("");
    setEnrichmentData(null);
    setPolling(false);
    setPollingMessage("");

    try {
      let result;

      if (useAIAgent) {
        // Use AI agent enrichment
        result = await enrichmentAPI.aiEnrich(inputData, true);
        // If result contains enrichment_id, start polling for FullEnrich results
        if (result && result.enrichment_id) {
          pollFullEnrichResult(result.enrichment_id);
        } else {
          setEnrichmentData(result);
        }
      } else {
        // Use basic enrichment
        result = await enrichmentAPI.enrich(inputData);
        setEnrichmentData(result);
      }
    } catch (err) {
      console.error("Enrichment error:", err);

      // Provide more specific error messages
      let errorMessage =
        "An error occurred while enriching the data. Please try again.";

      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Special handling for AI agent errors
      if (useAIAgent && err.response?.status === 500) {
        errorMessage =
          "AI agent processing failed. Please check your OpenAI API key configuration or try basic mode.";
      }

      setError(errorMessage);
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
          Enter an email address, domain, or use natural language to find and
          enrich contact information
        </p>
      </div>

      {/* AI Agent Status */}
      {aiAgentStatus && (
        <div className="max-w-2xl mx-auto">
          {aiAgentStatus.ai_agent_enabled ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-green-900">
                  AI Agent Ready
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Natural language processing is available. You can use queries
                like "Find CTOs at fintech startups in India".
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-yellow-900">
                  AI Agent Unavailable
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                {aiAgentStatus.message ||
                  "OpenAI API key not configured. Basic enrichment mode is still available."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Enrichment Form */}
      <EnrichmentForm
        onSubmit={handleEnrichment}
        isLoading={isLoading || polling}
        error={error}
      />

      {/* Loading State */}
      {(isLoading || polling) && (
        <div className="card max-w-2xl mx-auto">
          <div className="text-center py-12">
            <LoadingSpinner
              size="lg"
              text={polling ? pollingMessage : "Processing your request..."}
            />
            <p className="text-sm text-gray-500 mt-4">
              This may take a few seconds...
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {enrichmentData && !isLoading && !polling && (
        <EnrichmentResult data={enrichmentData} />
      )}

      {/* Error State */}
      {error && !isLoading && !polling && (
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
