function CompanyCard({ company, onAddToList, isInList, viewMode = 'list' }) {
  // Grid view - more compact card layout
  if (viewMode === 'grid') {
    return (
      <div className="animate-fadeIn hover-lift h-full">
        <div className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border h-full flex flex-col ${company.is_elderly ? 'border-purple-300 bg-purple-50/30' : 'border-slate-200'}`}>
          <div className="p-5 flex-1 flex flex-col">
            {/* Company Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                {company.is_elderly && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    60+
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{company.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {company.number}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  company.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${company.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                  {company.status}
                </span>
              </div>
            </div>

            {/* Director Information */}
            <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-200 flex-1">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 mb-2 text-sm">Director</h4>
                  {company.director_name && company.age ? (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-700 truncate">
                        <span className="font-semibold">{company.director_name}</span>
                      </p>
                      <p className="text-xs text-slate-600">
                        Age: <span className="font-medium">{company.age}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">N/A</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-4 text-xs text-slate-600 line-clamp-2">
              <span className="font-semibold">Location:</span> {company.postcode || 'N/A'}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-auto">
              <a
                href={company.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-xs transition-all py-2 px-3 rounded-lg hover:bg-purple-50"
              >
                <span>View Details</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              
              {onAddToList && (
                <button
                  onClick={() => onAddToList(company)}
                  disabled={isInList}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
                    isInList 
                      ? 'bg-slate-200 text-slate-600 cursor-not-allowed opacity-75' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isInList ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Saved
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add to List
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view - original full layout
  return (
    <div className="animate-fadeIn hover-lift">
      <div className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${company.is_elderly ? 'border-purple-300 bg-purple-50/30' : 'border-slate-200'}`}>
        <div className="p-6">
          {/* Company Header */}
          <div className="flex justify-between items-start mb-5">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 hover:text-purple-600 transition-colors duration-200">{company.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
                      {company.number}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      company.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${company.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                      {company.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {company.is_elderly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border-2 border-purple-300 shadow-md animate-pulse">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                60+ Director
              </span>
            )}
          </div>

          {/* Company Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 pb-5 border-b border-slate-200">
            <div className="flex items-start gap-3 group">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wide">Address</p>
                <p className="text-sm text-slate-900 font-medium">{company.address || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 group">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wide">Postcode</p>
                <p className="text-sm text-slate-900 font-medium">{company.postcode || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Director Information */}
          <div className="bg-slate-50 rounded-xl p-5 mb-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 mb-3 text-base">Director Information</h4>
                {company.director_name && company.age ? (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold text-slate-600">Name:</span> 
                      <span className="ml-2 text-slate-900 font-medium">{company.director_name}</span>
                    </p>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold text-slate-600">Age:</span> 
                      <span className="ml-2 text-slate-900 font-medium">{company.age} years old</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No director information available</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <a
              href={company.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm transition-all duration-200 hover:gap-3 group"
            >
              <span>View on Companies House</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            {onAddToList && (
              <button
                onClick={() => onAddToList(company)}
                disabled={isInList}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md ${
                  isInList 
                    ? 'bg-slate-200 text-slate-600 cursor-not-allowed opacity-75 border border-slate-300' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isInList ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Already Saved
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add to List
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyCard;
