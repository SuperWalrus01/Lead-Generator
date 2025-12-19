import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';

function MyLists({ onLogout, user }) {
  const [savedCompanies, setSavedCompanies] = useState([]);
  
  // Email generation modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEmailSaved, setIsEmailSaved] = useState(false);
  const [savedEmails, setSavedEmails] = useState([]);
  const [savedEmailCounts, setSavedEmailCounts] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedCompanies();
    fetchSavedEmailCounts();
  }, []);

  const fetchSavedCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_companies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedCompanies(data || []);
    } catch (err) {
      console.error('Error fetching saved companies:', err);
      toast.error('Failed to load saved companies');
    }
  };

  const fetchSavedEmailCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_emails')
        .select('company_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Count emails per company
      const counts = {};
      data.forEach(email => {
        if (email.company_id) {
          counts[email.company_id] = (counts[email.company_id] || 0) + 1;
        }
      });
      setSavedEmailCounts(counts);
    } catch (err) {
      console.error('Error fetching email counts:', err);
    }
  };

  const fetchSavedEmailsForCompany = async (companyId) => {
    try {
      const { data, error } = await supabase
        .from('generated_emails')
        .select('*')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedEmails(data || []);
    } catch (err) {
      console.error('Error fetching saved emails:', err);
    }
  };

  const removeFromList = async (id) => {
    try {
      const { error } = await supabase
        .from('saved_companies')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchSavedCompanies();
      toast.success('Company removed');
    } catch (err) {
      console.error('Error removing from list:', err);
      toast.error('Failed to remove company');
    }
  };

  const handleLogout = async () => {
    onLogout();
    navigate('/login');
  };

  const openEmailModal = (company) => {
    setSelectedCompany(company);
    setShowEmailModal(true);
    setGeneratedEmail(null);
    setCustomInstructions('');
    setIsEmailSaved(false);
    fetchSavedEmailsForCompany(company.id);
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setSelectedCompany(null);
    setGeneratedEmail(null);
    setCustomInstructions('');
    setIsEmailSaved(false);
    setSavedEmails([]);
  };

  const generateEmail = async () => {
    if (!selectedCompany) return;

    setIsGenerating(true);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      const generatePromise = fetch('http://localhost:3001/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          companyName: selectedCompany.company_name,
          companyNumber: selectedCompany.company_number,
          directorName: selectedCompany.director_name,
          directorAge: selectedCompany.director_age,
          address: selectedCompany.company_address,
          customInstructions: customInstructions,
        }),
      });

      toast.promise(generatePromise, {
        loading: 'Generating email...',
        success: 'Email generated!',
        error: 'Failed to generate email',
      });

      const response = await generatePromise;
      const data = await response.json();

      if (response.ok) {
        setGeneratedEmail(data);
      } else {
        toast.error(data.error || 'Failed to generate email');
      }
    } catch (err) {
      console.error('Error generating email:', err);
      toast.error('Failed to generate email');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveGeneratedEmail = async () => {
    if (!generatedEmail || !selectedCompany) return;

    try {
      const { error } = await supabase
        .from('generated_emails')
        .insert([
          {
            user_id: user.id,
            company_id: selectedCompany.id,
            company_name: selectedCompany.company_name,
            company_number: selectedCompany.company_number,
            director_name: selectedCompany.director_name,
            subject: generatedEmail.subject,
            body: generatedEmail.body,
            custom_instructions: customInstructions,
          }
        ]);

      if (error) throw error;

      setIsEmailSaved(true);
      toast.success('Email saved successfully!');
      
      // Refresh saved emails and counts
      await fetchSavedEmailsForCompany(selectedCompany.id);
      await fetchSavedEmailCounts();
    } catch (err) {
      console.error('Error saving email:', err);
      toast.error('Failed to save email');
    }
  };

  const deleteSavedEmail = async (emailId) => {
    try {
      const { error } = await supabase
        .from('generated_emails')
        .delete()
        .eq('id', emailId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Email deleted');
      await fetchSavedEmailsForCompany(selectedCompany.id);
      await fetchSavedEmailCounts();
    } catch (err) {
      console.error('Error deleting email:', err);
      toast.error('Failed to delete email');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">My Saved Companies</h1>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
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
        {/* Saved Companies List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="bg-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h2 className="text-2xl font-bold text-white">Your Saved Companies</h2>
              </div>
              <span className="text-white text-sm bg-white/20 px-3 py-1 rounded-full">
                {savedCompanies.length} companies
              </span>
            </div>
          </div>
          
          <div className="p-6">
            {savedCompanies.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-500 text-lg font-semibold">No companies saved yet</p>
                <p className="text-slate-400 text-sm mt-2">Go to search page to add companies!</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
                >
                  Search Companies
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedCompanies.map((item) => (
                  <div key={item.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">{item.company_name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-slate-500 min-w-[100px]">Company No:</span>
                            <span className="text-slate-900">{item.company_number}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-slate-500 min-w-[100px]">Director:</span>
                            <span className="text-slate-900">{item.director_name} ({item.director_age})</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-slate-500 min-w-[100px]">Address:</span>
                            <span className="text-slate-900">{item.company_address}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-slate-500 min-w-[100px]">Postcode:</span>
                            <span className="text-slate-900">{item.company_postcode}</span>
                          </div>
                        </div>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium mt-3"
                        >
                          View on Companies House
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => openEmailModal(item)}
                          className="relative flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-600 font-medium py-2 px-3 rounded-xl text-sm transition-colors whitespace-nowrap"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Generate Email
                          {savedEmailCounts[item.id] > 0 && (
                            <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {savedEmailCounts[item.id]}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => removeFromList(item.id)}
                          className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium py-2 px-3 rounded-xl text-sm transition-colors whitespace-nowrap"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Generation Modal */}
      {showEmailModal && selectedCompany && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-purple-600 px-6 py-4 flex justify-between items-center sticky top-0 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h2 className="text-xl font-bold text-white">Generate Email</h2>
              </div>
              <button
                onClick={closeEmailModal}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Company Details */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Company Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="font-medium text-slate-600 min-w-[120px]">Company:</span>
                    <span className="text-slate-900">{selectedCompany.company_name}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-slate-600 min-w-[120px]">Director:</span>
                    <span className="text-slate-900">{selectedCompany.director_name} ({selectedCompany.director_age} years old)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-slate-600 min-w-[120px]">Address:</span>
                    <span className="text-slate-900">{selectedCompany.company_address}</span>
                  </div>
                </div>
              </div>

              {/* Custom Instructions */}
              {!generatedEmail && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Custom Instructions (Optional)
                  </label>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g., Mention our 25 years of experience, Focus on pension planning..."
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 resize-none text-slate-900 placeholder:text-slate-400 bg-white"
                    rows="4"
                  />
                </div>
              )}

              {/* Generate Button */}
              {!generatedEmail && (
                <button
                  onClick={generateEmail}
                  disabled={isGenerating}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Generate Email
                    </>
                  )}
                </button>
              )}

              {/* Generated Email */}
              {generatedEmail && (
                <div className="space-y-4">
                  {/* Subject */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-slate-700">Subject Line</label>
                      <button
                        onClick={() => copyToClipboard(generatedEmail.subject, 'Subject')}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </button>
                    </div>
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                      <p className="text-slate-900 font-medium">{generatedEmail.subject}</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-slate-700">Email Body</label>
                      <button
                        onClick={() => copyToClipboard(generatedEmail.body, 'Email body')}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </button>
                    </div>
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
                      <p className="text-slate-900 whitespace-pre-wrap">{generatedEmail.body}</p>
                    </div>
                  </div>

                  {/* Token Usage */}
                  {generatedEmail.tokens_used && (
                    <div className="text-xs text-slate-500 text-center">
                      Tokens used: {generatedEmail.tokens_used}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => copyToClipboard(`${generatedEmail.subject}\n\n${generatedEmail.body}`, 'Complete email')}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy All
                    </button>
                    <button
                      onClick={saveGeneratedEmail}
                      disabled={isEmailSaved}
                      className={`flex-1 font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                        isEmailSaved 
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {isEmailSaved ? 'Email Saved' : 'Save Email'}
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedEmail(null);
                        setCustomInstructions('');
                        setIsEmailSaved(false);
                      }}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Generate New
                    </button>
                  </div>
                </div>
              )}

              {/* Saved Emails Section */}
              {savedEmails.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Saved Emails ({savedEmails.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {savedEmails.map((email) => (
                      <div key={email.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-sm mb-1">{email.subject}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(email.created_at).toLocaleDateString()} at {new Date(email.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteSavedEmail(email.id)}
                            className="text-rose-600 hover:text-rose-700 p-1"
                            title="Delete email"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="bg-white rounded-lg p-3 mb-2">
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{email.body}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(`${email.subject}\n\n${email.body}`, 'Email')}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Email
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyLists;