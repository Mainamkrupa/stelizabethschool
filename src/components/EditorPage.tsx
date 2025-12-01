import { useState, useEffect, useRef } from 'react';
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
  const [diagnostics, setDiagnostics] = useState<null | { message: string; line?: number; column?: number; stack?: string }>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const diagnosticsRef = useRef<null | { message: string; line?: number; column?: number; stack?: string }>(null);

  useEffect(() => {
    if (initialChallenge) {
      setHtml(initialChallenge.starter_html || '');
      setCss(initialChallenge.starter_css || '');
      setJs(initialChallenge.starter_js || '');
      setSubmitted(false);
      setScore(0);
      setMistakes(0);
      setRunCount(0);
      setDiagnostics(null);
      diagnosticsRef.current = null;
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

    // Validate code before submitting: check JS syntax and any runtime diagnostics
    setSubmitting(true);
    setDiagnostics(null);
    diagnosticsRef.current = null;

    // Quick JS syntax check
    try {
      // eslint-disable-next-line no-new-func
      new Function(js);
    } catch (err: any) {
      const diag = { message: err.message || 'JavaScript syntax error' };
      setDiagnostics(diag);
      diagnosticsRef.current = diag;
      setSubmitting(false);
      return;
    }

    // Run the code to surface immediate errors (HTML/CSS/JS syntax). runCode
    // now returns a boolean indicating immediate errors.
    const hadImmediateErrors = runCode();
    if (hadImmediateErrors) {
      // immediate errors found (HTML/CSS/JS syntax)
      setSubmitting(false);
      return;
    }

    // Wait briefly for runtime diagnostics (from iframe) to appear
    const waitForDiagnostics = (timeout = 2000) =>
      new Promise<null | { message: string; line?: number; column?: number; stack?: string }>((resolve) => {
        const start = Date.now();
        const check = () => {
          if (diagnosticsRef.current) return resolve(diagnosticsRef.current);
          if (Date.now() - start > timeout) return resolve(null);
          setTimeout(check, 50);
        };
        check();
      });

    const diag = await waitForDiagnostics(2000);
    if (diag) {
      setDiagnostics(diag);
      setSubmitting(false);
      return;
    }

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

  const runCode = (): boolean => {
    setDiagnostics(null);
    diagnosticsRef.current = null;
    setRunCount((c) => c + 1);
    let errorCount = 0;

    const htmlCode = html;
    const cssCode = `<style>${css}</style>`;

    const checkCssErrors = (cssText: string) => {
      const open = (cssText.match(/{/g) || []).length;
      const close = (cssText.match(/}/g) || []).length;
      return open !== close;
    };

    const checkHtmlErrors = (htmlText: string) => {
      // very small heuristic: basic tag stack matching ignoring void elements
      const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
      const tagRe = /<\s*\/?\s*([a-zA-Z0-9-]+)([^>]*)>/g;
      const stack: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = tagRe.exec(htmlText)) !== null) {
        const raw = m[0];
        const name = m[1].toLowerCase();
        const isClosing = raw.startsWith('</') || raw.endsWith('/>');
        const selfClosing = /\/.+>$/.test(raw) || raw.endsWith('/>');
        if (isClosing) {
          if (stack.length === 0) return true;
          const last = stack.pop();
          if (last !== name) return true;
        } else if (!selfClosing && !VOID.has(name)) {
          stack.push(name);
        }
      }
      return stack.length > 0;
    };

    const hasHtmlErrors = checkHtmlErrors(html);
    const hasCssErrors = checkCssErrors(css);

    if (hasHtmlErrors || hasCssErrors) {
      errorCount++;
      const diag = { message: hasHtmlErrors ? 'Possible HTML tag mismatch detected' : 'Possible CSS brace mismatch detected' };
      setDiagnostics(diag);
      diagnosticsRef.current = diag;
    }

    // Quick syntax check for JS
    try {
      // new Function will throw for syntax errors
      // eslint-disable-next-line no-new-func
      new Function(js);
    } catch (err: any) {
      const diag = { message: err.message || 'JavaScript syntax error' };
      setDiagnostics(diag);
      diagnosticsRef.current = diag;
      setMistakes((m) => m + 1);
      return true;
    }

    const jsCode = `<script>
      (function(){
        const origConsoleError = console.error;
        console.error = function(...args) {
          try { parent.postMessage({ type: 'playground_error', message: args.map(String).join(' '), stack: '' }, '*'); } catch (e) {}
          origConsoleError.apply(console, args);
        };
        window.addEventListener('error', function(e) {
          try {
            const payload = { type: 'playground_error', message: e.message || String(e), stack: e.error && e.error.stack ? e.error.stack : (e.filename ? e.filename + ':' + e.lineno + ':' + e.colno : '') };
            parent.postMessage(payload, '*');
          } catch (ex) {
            parent.postMessage({ type: 'playground_error', message: String(ex), stack: ''}, '*');
          }
        });
        window.addEventListener('unhandledrejection', function(e) {
          try {
            const reason = e.reason || 'Unhandled rejection';
            parent.postMessage({ type: 'playground_error', message: reason.message || String(reason), stack: reason.stack || '' }, '*');
          } catch (ex) {
            parent.postMessage({ type: 'playground_error', message: String(ex), stack: '' }, '*');
          }
        });
        try {
          ${js}
        } catch (err) {
          try { parent.postMessage({ type: 'playground_error', message: err.message || String(err), stack: err.stack || '' }, '*'); } catch (ex) { /* ignore */ }
        }
      })();
      //# sourceURL=playground.js
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
      setMistakes((m) => m + errorCount);
    }

    return errorCount > 0;
  };

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // Only accept messages from our iframe
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) return;
      const data = e.data || {};
      if (data.type === 'playground_error') {
        const stack: string = data.stack || '';
        const message: string = data.message || 'Runtime error';
        const m = /playground\.js:(\d+):(\d+)/.exec(stack);
        if (m) {
          const line = parseInt(m[1], 10);
          const column = parseInt(m[2], 10);
          const diag = { message, line, column, stack };
          setDiagnostics(diag);
          diagnosticsRef.current = diag;
          setMistakes((m) => m + 1);
          // scroll JS textarea to the error line
          const textarea = document.querySelector('textarea[aria-label="js-editor"]') as HTMLTextAreaElement | null;
          if (textarea && line > 0) {
            const lines = textarea.value.split('\n');
            let pos = 0;
            for (let i = 0; i < Math.min(line - 1, lines.length); i++) pos += lines[i].length + 1;
            textarea.focus();
            textarea.selectionStart = pos;
            textarea.selectionEnd = pos + (lines[line - 1] ? lines[line - 1].length : 0);
          }
        } else {
          const diag = { message, stack };
          setDiagnostics(diag);
          diagnosticsRef.current = diag;
          setMistakes((m) => m + 1);
        }
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

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
    setDiagnostics(null);
    diagnosticsRef.current = null;
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

      {diagnostics && (
        <div className="mt-4 bg-red-50 border border-red-300 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-red-600 font-semibold">Error</div>
            <div className="text-sm text-red-700">
              <div>{diagnostics.message}</div>
              {typeof diagnostics.line === 'number' && (
                <div>Line: {diagnostics.line}, Column: {diagnostics.column ?? '-'} </div>
              )}
              {diagnostics.stack && (
                <details className="mt-2 text-xs text-red-600">
                  <summary>Stack trace</summary>
                  <pre className="whitespace-pre-wrap">{diagnostics.stack}</pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

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
              aria-label="js-editor"
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
                ref={iframeRef}
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
