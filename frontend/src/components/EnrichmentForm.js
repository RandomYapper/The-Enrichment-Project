import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

const EnrichmentForm = ({ onSubmit, isLoading, error }) => {
  const [inputData, setInputData] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationError("");

    // Basic validation
    if (!inputData.trim()) {
      setValidationError("Please enter an email address or domain");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const domainRegex =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(inputData) && !domainRegex.test(inputData)) {
      setValidationError("Please enter a valid email address or domain");
      return;
    }

    onSubmit(inputData.trim());
  };

  const handleInputChange = (e) => {
    setInputData(e.target.value);
    // Clear validation error when user starts typing
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
          Enter an email address or company domain to get enriched information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="inputData"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address or Domain
          </label>
          <input
            type="text"
            id="inputData"
            value={inputData}
            onChange={handleInputChange}
            placeholder="e.g., john.doe@example.com or example.com"
            className="input-field"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a valid email address or company domain
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
              <span>Enriching Data...</span>
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
              <span>Enrich Data</span>
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
            <h3 className="text-sm font-medium text-blue-900">How it works</h3>
            <p className="text-sm text-blue-700 mt-1">
              Our system uses People Data Lab API to enrich your data. If no API
              key is configured, we'll show you mock data for demonstration
              purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrichmentForm;
