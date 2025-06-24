import React, { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { historyAPI } from "../services/api";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = async () => {
    try {
      const result = await historyAPI.getHistory();
      setHistory(result.items || []);
    } catch (err) {
      console.error("Error loading history:", err);
      setError("Failed to load history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await historyAPI.getStats();
      setStats(result);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const handleClearHistory = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear all history? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await historyAPI.clearHistory();
      setHistory([]);
      setStats({
        total_items: 0,
        max_history_size: stats?.max_history_size || 100,
      });
    } catch (err) {
      console.error("Error clearing history:", err);
      setError("Failed to clear history. Please try again.");
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" text="Loading history..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enrichment History
        </h1>
        <p className="text-gray-600">
          View all your previous enrichment requests and results
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="card max-w-2xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {stats.total_items}
              </div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {stats.max_history_size}
              </div>
              <div className="text-sm text-gray-600">Max History Size</div>
            </div>
            <button
              onClick={handleClearHistory}
              className="btn-secondary text-sm"
              disabled={history.length === 0}
            >
              Clear History
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="card max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* History List */}
      {history.length === 0 ? (
        <div className="card max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No History Yet
            </h3>
            <p className="text-gray-600">
              Start enriching data to see your history here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="card animate-fade-in">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {item.input_data}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatTimestamp(item.timestamp)}
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  ID: {item.id.slice(0, 8)}...
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Person Information */}
                {item.person && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <svg
                        className="w-4 h-4 text-primary-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Person</span>
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {item.person.full_name && (
                        <div>
                          <span className="font-medium">Name:</span>{" "}
                          {item.person.full_name}
                        </div>
                      )}
                      {item.person.job_title && (
                        <div>
                          <span className="font-medium">Title:</span>{" "}
                          {item.person.job_title}
                        </div>
                      )}
                      {item.person.company && (
                        <div>
                          <span className="font-medium">Company:</span>{" "}
                          {item.person.company}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Company Information */}
                {item.company && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Company</span>
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {item.company.name && (
                        <div>
                          <span className="font-medium">Name:</span>{" "}
                          {item.company.name}
                        </div>
                      )}
                      {item.company.size && (
                        <div>
                          <span className="font-medium">Size:</span>{" "}
                          {item.company.size}
                        </div>
                      )}
                      {item.company.location && (
                        <div>
                          <span className="font-medium">Location:</span>{" "}
                          {item.company.location}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* No Data Message */}
              {!item.person && !item.company && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    No enriched data available
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
