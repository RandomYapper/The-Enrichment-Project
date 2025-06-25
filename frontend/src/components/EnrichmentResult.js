import React from "react";

const EnrichmentResult = ({ data }) => {
  if (!data) return null;

  // Check if this is an AI agent response
  const isAIAgentResponse = data.query && data.extracted_data;
  const {
    person,
    company,
    input_data,
    message,
    timestamp,
    query,
    extracted_data,
    results,
    total_results,
    sources_used,
  } = data;

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // AI Agent Response
  if (isAIAgentResponse) {
    return (
      <div className="card max-w-6xl mx-auto animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI Agent Results
          </h2>
          <p className="text-gray-600">
            Query: <span className="font-medium text-primary-600">{query}</span>
          </p>
          {total_results && (
            <p className="text-sm text-green-600 mt-1">
              Found {total_results} matching contacts
            </p>
          )}
          {sources_used && sources_used.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Sources: {sources_used.join(", ")}
            </p>
          )}
        </div>

        {/* Extracted Data Summary */}
        {extracted_data && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Query Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {extracted_data.target_roles &&
                extracted_data.target_roles.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-blue-700">
                      Target Roles:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {extracted_data.target_roles.map((role, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              {extracted_data.industries &&
                extracted_data.industries.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-blue-700">
                      Industries:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {extracted_data.industries.map((industry, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              {extracted_data.region && (
                <div>
                  <span className="text-sm font-medium text-blue-700">
                    Region:
                  </span>
                  <span className="text-sm text-blue-800 ml-2">
                    {extracted_data.region}
                  </span>
                </div>
              )}
              {extracted_data.intent && (
                <div>
                  <span className="text-sm font-medium text-blue-700">
                    Intent:
                  </span>
                  <span className="text-sm text-blue-800 ml-2">
                    {extracted_data.intent}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results List */}
        {results && results.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Found Contacts
            </h3>
            <div className="grid gap-4">
              {results.map((contact, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {contact.full_name || contact.name || "Unknown Name"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {contact.job_title || contact.title || "Unknown Title"}
                      </p>
                      {contact.company && (
                        <p className="text-sm text-gray-600">
                          {contact.company}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          Email
                        </a>
                      )}
                      {contact.linkedin_profile && (
                        <a
                          href={contact.linkedin_profile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                  {contact.location && (
                    <p className="text-xs text-gray-500 mt-2">
                      📍 {contact.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No contacts found matching your criteria.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Basic Enrichment Response (existing format)
  return (
    <div className="card max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Enrichment Results
        </h2>
        <p className="text-gray-600">
          Enriched data for:{" "}
          <span className="font-medium text-primary-600">{input_data}</span>
        </p>
        {message && <p className="text-sm text-green-600 mt-1">{message}</p>}
        {timestamp && (
          <p className="text-xs text-gray-500 mt-1">
            Retrieved on: {formatTimestamp(timestamp)}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Person Information */}
        {person && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Person Information
              </h3>
            </div>

            <div className="space-y-3">
              {person.full_name && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Full Name
                  </span>
                  <span className="text-sm text-gray-900">
                    {person.full_name}
                  </span>
                </div>
              )}

              {person.job_title && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Job Title
                  </span>
                  <span className="text-sm text-gray-900">
                    {person.job_title}
                  </span>
                </div>
              )}

              {person.email && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Email
                  </span>
                  <a
                    href={`mailto:${person.email}`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {person.email}
                  </a>
                </div>
              )}

              {person.linkedin_profile && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    LinkedIn
                  </span>
                  <a
                    href={person.linkedin_profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View Profile
                  </a>
                </div>
              )}

              {person.company && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Company
                  </span>
                  <span className="text-sm text-gray-900">
                    {person.company}
                  </span>
                </div>
              )}

              {person.location && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Location
                  </span>
                  <span className="text-sm text-gray-900">
                    {person.location}
                  </span>
                </div>
              )}

              {person.skills && person.skills.length > 0 && (
                <div className="flex justify-between items-start py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Skills
                  </span>
                  <div className="text-sm text-gray-900 text-right">
                    {person.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {person.education && person.education.length > 0 && (
                <div className="flex justify-between items-start py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Education
                  </span>
                  <div className="text-sm text-gray-900 text-right">
                    {person.education.map((edu, index) => (
                      <div key={index} className="mb-1">
                        <div className="font-medium">{edu.school}</div>
                        <div className="text-xs text-gray-600">
                          {edu.degree} {edu.year && `(${edu.year})`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Company Information */}
        {company && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Company Information
              </h3>
            </div>

            <div className="space-y-3">
              {company.name && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Company Name
                  </span>
                  <span className="text-sm text-gray-900">{company.name}</span>
                </div>
              )}

              {company.domain && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Domain
                  </span>
                  <a
                    href={`https://${company.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {company.domain}
                  </a>
                </div>
              )}

              {company.industry && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Industry
                  </span>
                  <span className="text-sm text-gray-900">
                    {company.industry}
                  </span>
                </div>
              )}

              {company.size && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Company Size
                  </span>
                  <span className="text-sm text-gray-900">{company.size}</span>
                </div>
              )}

              {company.location && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Location
                  </span>
                  <span className="text-sm text-gray-900">
                    {company.location}
                  </span>
                </div>
              )}

              {company.description && (
                <div className="flex justify-between items-start py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Description
                  </span>
                  <span className="text-sm text-gray-900 text-right max-w-xs">
                    {company.description}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrichmentResult;
