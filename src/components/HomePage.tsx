import { BookOpen, Award, Code, Zap } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: 'challenges' | 'quizzes' | 'editor') => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
          Welcome to Web Learning Hub
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
          A hands-on practice platform for 8th-class students to master HTML, CSS, and JavaScript
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div
          onClick={() => onNavigate('challenges')}
          className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
            Challenges
          </h2>
          <p className="text-gray-600 text-center mb-4">
            Practice with 150 progressive coding challenges across three difficulty levels
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <Zap className="w-4 h-4 text-green-500 mr-2" />
              50 Beginner tasks
            </li>
            <li className="flex items-center">
              <Zap className="w-4 h-4 text-yellow-500 mr-2" />
              50 Intermediate tasks
            </li>
            <li className="flex items-center">
              <Zap className="w-4 h-4 text-red-500 mr-2" />
              50 Advanced tasks
            </li>
          </ul>
          <button className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Start Challenges
          </button>
        </div>

        <div
          onClick={() => onNavigate('quizzes')}
          className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <Award className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
            Quizzes
          </h2>
          <p className="text-gray-600 text-center mb-4">
            Test your knowledge with 150 multiple-choice questions and earn badges
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <Zap className="w-4 h-4 text-orange-500 mr-2" />
              50 HTML questions
            </li>
            <li className="flex items-center">
              <Zap className="w-4 h-4 text-blue-500 mr-2" />
              50 CSS questions
            </li>
            <li className="flex items-center">
              <Zap className="w-4 h-4 text-yellow-500 mr-2" />
              50 Mixed questions
            </li>
          </ul>
          <button className="w-full mt-6 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
            Take Quiz
          </button>
        </div>

        <div
          onClick={() => onNavigate('editor')}
          className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-cyan-100 p-4 rounded-full">
              <Code className="w-12 h-12 text-cyan-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
            Live Editor
          </h2>
          <p className="text-gray-600 text-center mb-4">
            Write and test your HTML, CSS, and JavaScript code instantly
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <Zap className="w-4 h-4 text-cyan-500 mr-2" />
              Real-time preview
            </li>
            <li className="flex items-center">
              <Zap className="w-4 h-4 text-cyan-500 mr-2" />
              No installation needed
            </li>
            <li className="flex items-center">
              <Zap className="w-4 h-4 text-cyan-500 mr-2" />
              Practice anywhere
            </li>
          </ul>
          <button className="w-full mt-6 bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition-colors">
            Open Editor
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Why Web Learning Hub?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
            <div className="text-gray-600">Coding Challenges</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">150+</div>
            <div className="text-gray-600">Quiz Questions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-600 mb-2">24/7</div>
            <div className="text-gray-600">Practice Access</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
            <div className="text-gray-600">Hands-on Learning</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-lg p-8 border border-blue-100">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Author</h3>
            <p className="text-gray-700 font-semibold">Krupa Mainam</p>
            <p className="text-gray-700 font-semibold">AI Instructor</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Subject</h3>
            <p className="text-gray-700 font-semibold">Web Development </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Organization</h3>
            <p className="text-gray-700 font-semibold">SR Edu Technologies Pvt Ltd</p>
          </div>
          
          
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">School</h3>
            <p className="text-gray-700 font-semibold">St. Elizabeth Convent High School, Bhongir</p>
          </div>
        </div>
      </div>
    </div>
  );
}
