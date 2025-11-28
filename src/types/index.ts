export interface Challenge {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'html' | 'css' | 'javascript' | 'mixed';
  starter_html: string;
  starter_css: string;
  starter_js: string;
  reference_image_url: string;
  order_index: number;
}

export interface QuizQuestion {
  id: string;
  category: 'html' | 'css' | 'mixed';
  question: string;
  options: string[];
  correct_answer: number;
  order_index: number;
}

export interface UserProgress {
  id: string;
  session_id: string;
  challenge_id?: string;
  quiz_category?: string;
  quiz_score?: number;
  completed: boolean;
  code_html?: string;
  code_css?: string;
  code_js?: string;
}
