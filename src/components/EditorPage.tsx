import { useState, useEffect } from 'react';
import { Play, RotateCcw, CheckCircle } from 'lucide-react';
import { supabase, getSessionId } from '../lib/supabase';
import { Challenge } from '../types';

interface EditorPageProps {
  initialChallenge?: Challenge;
}

export default function EditorPage({ initialChallenge }: EditorPageProps) {
  const [html, setHtml] = useState(initialChallenge?.starter_html || '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>');
  const [css, setCss] = useState(initialChallenge?.starter_css || 'body {\n  font-family: Arial, sans-serif;\n  margin: 20px;\n}\n\nh1 {\n  color: #333;\n}');
  const [js, setJs] = useState(initialChallenge?.starter_js || '// Write your JavaScript here\nconsole.log("Hello from JavaScript!");');
  const [output, setOutput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [runCount, setRunCount] = useState(0);

  useEffect(() => {
    if (initialChallenge) {
      setHtml(initialChallenge.starter_html || '');
      setCss(initialChallenge.starter_css || '');
      setJs(initialChallenge.starter_js || '');
      setSubmitted(false);
      setScore(0);
      setMistakes(0);
      setRunCount(0);
    }
  }, [initialChallenge]);

  const calculateScore = () => {
    let calculatedScore = 100;
    if (mistakes > 0) {
      calculatedScore -= mistakes * 5;
    }
    if (runCount > 3) {
      calculatedScore -= (runCount - 3) * 2;
    }
    return Math.max(0, calculatedScore);
  };

  const submitChallenge = async () => {
    if (!initialChallenge) return;

    setSubmitting(true);
    const finalScore = calculateScore();
    try {
      const { error } = await supabase.from('user_progress').insert([
        {
          session_id: getSessionId(),
          challenge_id: initialChallenge.id,
          code_html: html,
          code_css: css,
          code_js: js,
          completed: true,
          score: finalScore,
          mistakes: mistakes,
          attempts: runCount,
        },
      ]);

      if (error) {
        console.error('Error submitting challenge:', error);
      } else {
        setScore(finalScore);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const runCode = () => {
    setRunCount(runCount + 1);
    let errorCount = 0;

    const htmlCode = html;
    const cssCode = `<style>${css}</style>`;

    const hasHtmlErrors = html.includes('<script') && !html.includes('</script>');
    const hasCssErrors = css.includes('{') && !css.includes('}');

    if (hasHtmlErrors || hasCssErrors) {
      errorCount++;
    }

    const jsCode = `<script>
      try {
        ${js}
      } catch (error) {
        console.error('Error:', error);
        document.body.innerHTML += '<div style="color: red; padding: 10px; background: #fee; border: 1px solid red; margin: 10px;">Error: ' + error.message + '</div>';
      }
    </script>`;

    const fullCode = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${cssCode}
        </head>
        <body>
          ${htmlCode}
          ${jsCode}
        </body>
      </html>
    `;

    setOutput(fullCode);
    if (errorCount > 0) {
      setMistakes(mistakes + errorCount);
    }
  };

  const resetCode = () => {
    if (initialChallenge) {
      setHtml(initialChallenge.starter_html || '');
      setCss(initialChallenge.starter_css || '');
      setJs(initialChallenge.starter_js || '');
    } else {
      setHtml('<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>');
      setCss('body {\n  font-family: Arial, sans-serif;\n  margin: 20px;\n}\n\nh1 {\n  color: #333;\n}');
      setJs('// Write your JavaScript here\nconsole.log("Hello from JavaScript!");');
    }
    setOutput('');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runCode();
    }, 1000);

    return () => clearTimeout(timer);
  }, [html, css, js]);

  return (
    <div className="space-y-4">
      {!initialChallenge && (
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-800">Live Code Editor</h1>
          <p className="text-lg text-gray-600">
            Write HTML, CSS, and JavaScript to see instant results
          </p>
        </div>
      )}

      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex space-x-3 items-center">
          <button
            onClick={resetCode}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={runCode}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Run Code</span>
          </button>
        </div>

        {initialChallenge && (
          <div className="flex items-center space-x-4">
            <div className="flex space-x-6 text-sm font-semibold">
              <div className="flex flex-col items-center bg-yellow-100 px-4 py-2 rounded-lg">
                <span className="text-gray-600">Attempts</span>
                <span className="text-2xl text-yellow-700">{runCount}</span>
              </div>
              <div className="flex flex-col items-center bg-red-100 px-4 py-2 rounded-lg">
                <span className="text-gray-600">Mistakes</span>
                <span className="text-2xl text-red-700">{mistakes}</span>
              </div>
              {submitted && (
                <div className="flex flex-col items-center bg-blue-100 px-4 py-2 rounded-lg">
                  <span className="text-gray-600">Score</span>
                  <span className="text-2xl text-blue-700">{score}/100</span>
                </div>
              )}
            </div>
            <button
              onClick={submitChallenge}
              disabled={submitting || submitted}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold transition-all ${
                submitted
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } ${submitting ? 'opacity-75 cursor-wait' : ''}`}
            >
              {submitted ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submitted</span>
                </>
              ) : (
                <>
                  <span>{submitting ? 'Submitting...' : 'Submit Challenge'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-orange-600 text-white px-4 py-2 font-semibold">
              HTML
            </div>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="w-full h-48 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              spellCheck={false}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-600 text-white px-4 py-2 font-semibold">
              CSS
            </div>
            <textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              className="w-full h-48 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              spellCheck={false}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-yellow-600 text-white px-4 py-2 font-semibold">
              JavaScript
            </div>
            <textarea
              value={js}
              onChange={(e) => setJs(e.target.value)}
              className="w-full h-48 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden lg:sticky lg:top-20" style={{ height: 'fit-content' }}>
          <div className="bg-green-600 text-white px-4 py-2 font-semibold">
            Output
          </div>
          <div className="border-t border-gray-200" style={{ height: '600px' }}>
            {output ? (
              <iframe
                srcDoc={output}
                title="output"
                sandbox="allow-scripts"
                className="w-full h-full border-0"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Click "Run Code" to see the output</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
