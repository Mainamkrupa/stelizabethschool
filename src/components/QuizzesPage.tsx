import { useState, useEffect } from 'react';
import { Award, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { QuizQuestion } from '../types';

type Category = 'html' | 'css' | 'mixed';

export default function QuizzesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const startQuiz = async (category: Category) => {
    setLoading(true);
    setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizCompleted(false);

    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('category', category)
      .order('order_index');

    if (error) {
      console.error('Error loading questions:', error);
    } else {
      setQuestions(data || []);
      setAnsweredQuestions(new Array(data?.length || 0).fill(false));
    }
    setLoading(false);
  };

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (answerIndex === questions[currentQuestionIndex].correct_answer) {
      setScore(score + 1);
    }

    const newAnswered = [...answeredQuestions];
    newAnswered[currentQuestionIndex] = true;
    setAnsweredQuestions(newAnswered);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setSelectedCategory(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions([]);
    setQuizCompleted(false);
  };

  const getBadge = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return { name: 'Pro', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 60) return { name: 'Intermediate', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { name: 'Beginner', color: 'text-green-600', bg: 'bg-green-100' };
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 mt-4">Loading quiz...</p>
      </div>
    );
  }

  if (quizCompleted) {
    const badge = getBadge();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className={`${badge.bg} p-6 rounded-full`}>
              <Trophy className={`w-16 h-16 ${badge.color}`} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Quiz Completed!
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            You scored {score} out of {questions.length}
          </p>
          <div className="text-6xl font-bold text-blue-600 mb-4">
            {percentage}%
          </div>
          <div className={`inline-block px-6 py-3 rounded-full ${badge.bg} ${badge.color} font-bold text-lg mb-6`}>
            {badge.name} Badge
          </div>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => startQuiz(selectedCategory!)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retake Quiz
            </button>
            <button
              onClick={resetQuiz}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Choose Another Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCategory && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-semibold text-blue-600">
              Score: {score}/{questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            {currentQuestion.question}
          </h3>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correct_answer;
              const showCorrect = showResult && isCorrect;
              const showIncorrect = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    showCorrect
                      ? 'bg-green-100 border-green-500'
                      : showIncorrect
                      ? 'bg-red-100 border-red-500'
                      : isSelected
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-white border-gray-300 hover:border-blue-400'
                  } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">{option}</span>
                    {showCorrect && <CheckCircle className="w-6 h-6 text-green-600" />}
                    {showIncorrect && <XCircle className="w-6 h-6 text-red-600" />}
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <button
              onClick={handleNext}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-800">Quizzes</h1>
        <p className="text-lg text-gray-600">
          Test your knowledge and earn badges based on your performance
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div
          onClick={() => startQuiz('html')}
          className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-4 rounded-full">
              <Award className="w-12 h-12 text-orange-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
            HTML Quiz
          </h2>
          <p className="text-gray-600 text-center mb-4">
            50 questions covering HTML elements, attributes, and structure
          </p>
          <button className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors">
            Start Quiz
          </button>
        </div>

        <div
          onClick={() => startQuiz('css')}
          className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Award className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
            CSS Quiz
          </h2>
          <p className="text-gray-600 text-center mb-4">
            50 questions about styling, layouts, and CSS properties
          </p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Start Quiz
          </button>
        </div>

        <div
          onClick={() => startQuiz('mixed')}
          className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 p-4 rounded-full">
              <Award className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
            Mixed Quiz
          </h2>
          <p className="text-gray-600 text-center mb-4">
            50 questions combining HTML, CSS, and JavaScript concepts
          </p>
          <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
