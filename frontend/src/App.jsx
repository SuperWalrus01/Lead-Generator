import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MyLists from './components/MyLists';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Persistent search state
  const [searchState, setSearchState] = useState({
    selectedTerm: '',
    customSearch: '',
    results: [],
    searchInfo: null,
    sortBy: 'default'
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    // Session will be updated by onAuthStateChange
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    // Clear search state on logout
    setSearchState({
      selectedTerm: '',
      customSearch: '',
      results: [],
      searchInfo: null,
      sortBy: 'default'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              session ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              session ? (
                <Dashboard 
                  onLogout={handleLogout} 
                  user={session.user}
                  searchState={searchState}
                  setSearchState={setSearchState}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/lists" 
            element={
              session ? (
                <MyLists onLogout={handleLogout} user={session.user} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
