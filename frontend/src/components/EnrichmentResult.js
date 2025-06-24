import React from "react";

const EnrichmentResult = ({ data }) => {
  if (!data) return null;

  const { person, company, input_data, message, timestamp } = data;

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

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
                  <span className="text-sm text-gray-900">
                    {company.domain}
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

              {company.website && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Website
                  </span>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Visit Website
                  </a>
                </div>
              )}

              {company.founded && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Founded
                  </span>
                  <span className="text-sm text-gray-900">
                    {company.founded}
                  </span>
                </div>
              )}

              {company.linkedin_url && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    LinkedIn
                  </span>
                  <a
                    href={company.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View Company
                  </a>
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
