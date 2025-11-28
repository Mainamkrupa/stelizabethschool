import { useState, useEffect } from 'react';
import { Trophy, Code, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase, getSessionId } from '../lib/supabase';
import { Challenge } from '../types';
import EditorPage from './EditorPage';

type Level = 'beginner' | 'intermediate' | 'advanced';

export default function ChallengesPage() {
  const [selectedLevel, setSelectedLevel] = useState<Level>('beginner');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    loadChallenges();
    loadCompletedChallenges();
  }, [selectedLevel]);

  const loadChallenges = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('level', selectedLevel)
      .order('order_index');

    if (error) {
      console.error('Error loading challenges:', error);
    } else {
      setChallenges(data || []);
    }
    setLoading(false);
  };

  const loadCompletedChallenges = async () => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('challenge_id')
      .eq('session_id', getSessionId())
      .eq('completed', true);

    if (error) {
      console.error('Error loading completed challenges:', error);
    } else {
      const completed = data?.map(item => item.challenge_id).filter(Boolean) || [];
      setCompletedChallenges(completed);
      setCompletedCount(completed.length);
    }
  };

  if (selectedChallenge) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => {
            setSelectedChallenge(null);
            loadCompletedChallenges();
          }}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
          <span>Back to Challenges</span>
        </button>
        <div className="bg-white rounded-lg p-6 shadow-md mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedChallenge.title}
              </h2>
              <p className="text-gray-600">{selectedChallenge.description}</p>
            </div>
            {completedChallenges.includes(selectedChallenge.id) && (
              <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">Completed</span>
              </div>
            )}
          </div>
        </div>
        <EditorPage initialChallenge={selectedChallenge} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-800">Coding Challenges</h1>
        <p className="text-lg text-gray-600">
          Practice with progressive challenges to improve your skills
        </p>
        <div className="inline-block bg-blue-100 text-blue-700 px-6 py-2 rounded-full font-semibold">
          Total Completed: {completedCount}
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setSelectedLevel('beginner')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            selectedLevel === 'beginner'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-green-50'
          }`}
        >
          Beginner
        </button>
        <button
          onClick={() => setSelectedLevel('intermediate')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            selectedLevel === 'intermediate'
              ? 'bg-yellow-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-yellow-50'
          }`}
        >
          Intermediate
        </button>
        <button
          onClick={() => setSelectedLevel('advanced')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            selectedLevel === 'advanced'
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-red-50'
          }`}
        >
          Advanced
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading challenges...</p>
        </div>
      ) : challenges.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No challenges available yet
          </h3>
          <p className="text-gray-600">
            Challenges for this level will be added soon!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge, index) => {
            const isCompleted = completedChallenges.includes(challenge.id);
            return (
              <div
                key={challenge.id}
                className={`rounded-lg p-6 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 ${
                  isCompleted
                    ? 'bg-green-50 border-2 border-green-300 shadow-md'
                    : 'bg-white shadow-md'
                }`}
                onClick={() => setSelectedChallenge(challenge)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-200' : 'bg-blue-100'}`}>
                      <Code className={`w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`} />
                    </div>
                    <span className="text-sm font-semibold text-gray-500">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        challenge.category === 'html'
                          ? 'bg-orange-100 text-orange-700'
                          : challenge.category === 'css'
                          ? 'bg-blue-100 text-blue-700'
                          : challenge.category === 'javascript'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {challenge.category.toUpperCase()}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {challenge.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {challenge.description}
                </p>
                <button className={`w-full py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 font-semibold ${
                  isCompleted
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                  <span>{isCompleted ? 'Review Challenge' : 'Start Challenge'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
