import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import CompanyCard from './CompanyCard';

function Dashboard({ onLogout, user, searchState, setSearchState }) {
  const [searchTerms, setSearchTerms] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [savedCompanyNumbers, setSavedCompanyNumbers] = useState(new Set());
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchSearchTerms();
    fetchSavedCompanyNumbers();
  }, []);

  // Apply sorting to results
  useEffect(() => {
    if (searchState.results.length > 0) {
      let sorted = [...searchState.results];
      
      switch (searchState.sortBy) {
        case 'age-asc':
          sorted.sort((a, b) => a.age - b.age);
          break;
        case 'age-desc':
          sorted.sort((a, b) => b.age - a.age);
          break;
        case 'name-asc':
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          sorted.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          // Keep original order
          break;
      }
      
      setFilteredResults(sorted);
    } else {
      setFilteredResults([]);
    }
  }, [searchState.results, searchState.sortBy]);

  const fetchSearchTerms = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/search-terms');
      const data = await response.json();
      setSearchTerms(data.searchTerms || []);
    } catch (err) {
      console.error('Error fetching search terms:', err);
      toast.error('Failed to load search terms');
    }
  };

  const fetchSavedCompanyNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_companies')
        .select('company_number')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const numbers = new Set(data.map(item => item.company_number));
      setSavedCompanyNumbers(numbers);
    } catch (err) {
      console.error('Error fetching saved companies:', err);
    }
  };

  const addToMyList = async (company) => {
    try {
      const { error } = await supabase
        .from('saved_companies')
        .insert([
          {
            user_id: user.id,
            company_number: company.number,
            company_name: company.name,
            company_status: company.status,
            company_address: company.address,
            company_postcode: company.postcode,
            director_name: company.director_name,
            director_age: company.age,
            is_elderly: company.is_elderly,
            link: company.link,
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          toast.error('Company already in your list');
        } else {
          throw error;
        }
      } else {
        toast.success('Added to your list!');
        // Update the saved companies list
        setSavedCompanyNumbers(prev => new Set([...prev, company.number]));
      }
    } catch (err) {
      console.error('Error adding to list:', err);
      toast.error('Failed to add company');
    }
  };

  const handleLogout = async () => {
    onLogout();
    navigate('/login');
  };

  const handleSearch = async () => {
    const term = searchState.customSearch || searchState.selectedTerm;
    
    if (!term) {
      toast.error('Please select or enter a search term');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchState({
      ...searchState,
      results: [],
      searchInfo: null
    });

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      const searchPromise = fetch('http://localhost:3001/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ search_term: term }),
      });

      toast.promise(searchPromise, {
        loading: 'Searching companies...',
        success: 'Search completed!',
        error: 'Search failed',
      });

      const response = await searchPromise;
      const data = await response.json();

      if (response.ok) {
        setSearchState({
          ...searchState,
          results: data.results || [],
          searchInfo: {
            totalFound: data.total_found,
            totalReturned: data.total_returned,
          }
        });
      } else {
        setError(data.error || 'An error occurred while searching');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectedTermChange = (e) => {
    setSearchState({
      ...searchState,
      selectedTerm: e.target.value,
      customSearch: e.target.value ? '' : searchState.customSearch
    });
  };

  const handleCustomSearchChange = (e) => {
    setSearchState({
      ...searchState,
      customSearch: e.target.value,
      selectedTerm: e.target.value ? '' : searchState.selectedTerm
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Lead Generator</h1>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/lists')}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>My Saved Companies</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Box */}
        <div className="bg-white backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-slate-200 hover:shadow-xl transition-shadow duration-300 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Search Companies</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="search_term">
                Search Term
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  id="search_term"
                  value={searchState.selectedTerm}
                  onChange={handleSelectedTermChange}
                  className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white font-medium text-slate-900"
                >
                  <option value="">Select a predefined term</option>
                  {searchTerms.map((term, index) => (
                    <option key={index} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  id="custom_search"
                  placeholder="Or enter custom search term"
                  value={searchState.customSearch}
                  onChange={handleCustomSearchChange}
                  className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
            
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Companies
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sort Options */}
        {searchState.results.length > 0 && (
          <div className="bg-white backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-slate-200 hover:shadow-xl transition-shadow duration-300 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Sort & View Results</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full">{filteredResults.length} companies</span>
                
                {/* View Toggle Buttons */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-purple-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title="List View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white text-purple-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title="Grid View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sort By
              </label>
              <select
                value={searchState.sortBy}
                onChange={(e) => setSearchState({ ...searchState, sortBy: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white font-medium text-slate-900"
              >
                <option value="default">Default Order</option>
                <option value="age-asc">Director Age: Youngest First</option>
                <option value="age-desc">Director Age: Oldest First</option>
                <option value="name-asc">Company Name: A to Z</option>
                <option value="name-desc">Company Name: Z to A</option>
              </select>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div>
          {isSearching && (
            <div className="text-center py-12 animate-fadeIn">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-purple-600"></div>
              <p className="text-slate-600 mt-4 font-medium">Searching for companies...</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 mb-6 animate-fadeIn">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-rose-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-rose-800 font-semibold">{error}</p>
              </div>
            </div>
          )}

          {searchState.searchInfo && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5 mb-6 animate-fadeIn">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-slate-900 font-bold mb-1">Search Results</p>
                  <p className="text-slate-700 text-sm">
                    Found <span className="font-bold text-purple-700">{searchState.searchInfo.totalFound}</span> total companies
                  </p>
                  <p className="text-slate-700 text-sm">
                    <span className="font-bold text-purple-700">{searchState.searchInfo.totalReturned}</span> companies with elderly directors (60+)
                  </p>
                </div>
              </div>
            </div>
          )}

          {filteredResults.length > 0 && (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' 
              : 'space-y-5'
            }>
              {filteredResults.map((company, index) => (
                <CompanyCard 
                  key={index} 
                  company={company} 
                  onAddToList={addToMyList}
                  isInList={savedCompanyNumbers.has(company.number)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {!isSearching && !error && filteredResults.length === 0 && searchState.results.length > 0 && (
            <div className="text-center py-12 animate-fadeIn">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-slate-500 text-lg font-semibold">No companies match your sort criteria</p>
            </div>
          )}

          {!isSearching && !error && filteredResults.length === 0 && searchState.results.length === 0 && searchState.searchInfo && (
            <div className="text-center py-12 animate-fadeIn">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-slate-500 text-lg font-semibold">No companies found with elderly directors</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
