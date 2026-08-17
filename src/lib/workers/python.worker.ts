import { loadPyodide, version, type PyodideInterface } from 'pyodide';

let pyodide: PyodideInterface | null = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

const OUTPUT_LIMIT = 50000;
let outputLength = 0;
let outputExceeded = false;

self.onmessage = async (e: MessageEvent) => {
  const { id, type, code, stdin } = e.data;
  
  if (type === 'init') {
      try {
       if (!pyodide) {
         if (!isInitializing) {
           isInitializing = true;
           initPromise = (async () => {
             const indexURL = `https://cdn.jsdelivr.net/pyodide/v${version}/full/`;
             
             pyodide = await loadPyodide({
               indexURL,
             });
           })();
         }
         await initPromise;
       }
       self.postMessage({ id, type: 'init_success' });
     } catch (err: any) {
       self.postMessage({ id, type: 'init_error', error: err.message || String(err) });
     }
     return;
  }

  if (type === 'run') {
    try {
      if (!pyodide) {
        throw new Error("Pyodide is not initialized");
      }

      outputLength = 0;
      outputExceeded = false;
      let stdoutBuffer = '';
      let stderrBuffer = '';

      pyodide.setStdout({
        batched: (msg) => {
          if (outputExceeded) return;
          outputLength += msg.length;
          if (outputLength > OUTPUT_LIMIT) {
            outputExceeded = true;
            stdoutBuffer += msg.substring(0, OUTPUT_LIMIT - (outputLength - msg.length)) + '\n\n[Output limit exceeded]';
          } else {
            stdoutBuffer += msg + '\n';
          }
        }
      });

      pyodide.setStderr({
        batched: (msg) => {
          if (outputExceeded) return;
          outputLength += msg.length;
          if (outputLength > OUTPUT_LIMIT) {
            outputExceeded = true;
            stderrBuffer += msg.substring(0, OUTPUT_LIMIT - (outputLength - msg.length)) + '\n\n[Output limit exceeded]';
          } else {
            stderrBuffer += msg + '\n';
          }
        }
      });

      // Provide stdin safely
      pyodide.globals.set("__custom_stdin", stdin || "");
      await pyodide.runPythonAsync(`
import sys
import io
sys.stdin = io.StringIO(__custom_stdin)
del __custom_stdin
`);

      // Run the code
      await pyodide.runPythonAsync(code);
      
      self.postMessage({ id, type: 'success', stdout: stdoutBuffer.trimEnd(), stderr: stderrBuffer.trimEnd() });
    } catch (error: any) {
      // Python exceptions will be caught here
      self.postMessage({ id, type: 'error', error: error.message || String(error) });
    }
  }
};
