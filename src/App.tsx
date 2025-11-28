import { useState, useEffect } from 'react';
import { Home, Code, BookOpen, Award, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import HomePage from './components/HomePage';
import ChallengesPage from './components/ChallengesPage';
import QuizzesPage from './components/QuizzesPage';
import EditorPage from './components/EditorPage';
import LoginPage from './components/LoginPage';

type Page = 'home' | 'challenges' | 'quizzes' | 'editor';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser({ id: session.user.id, email: session.user.email || '' });
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={(id, email) => setUser({ id, email })} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'challenges':
        return <ChallengesPage />;
      case 'quizzes':
        return <QuizzesPage />;
      case 'editor':
        return <EditorPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Code className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">Web Learning Hub</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">
                  Welcome, <span className="font-semibold">{user.email.split('@')[0]}</span>
                </span>
              </div>
              <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
              <button
                onClick={() => setCurrentPage('home')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  currentPage === 'home'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-blue-50'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <button
                onClick={() => setCurrentPage('challenges')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  currentPage === 'challenges'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-blue-50'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="hidden sm:inline">Challenges</span>
              </button>
              <button
                onClick={() => setCurrentPage('quizzes')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  currentPage === 'quizzes'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-blue-50'
                }`}
              >
                <Award className="w-5 h-5" />
                <span className="hidden sm:inline">Quizzes</span>
              </button>
              <button
                onClick={() => setCurrentPage('editor')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  currentPage === 'editor'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-blue-50'
                }`}
              >
                <Code className="w-5 h-5" />
                <span className="hidden sm:inline">Editor</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
