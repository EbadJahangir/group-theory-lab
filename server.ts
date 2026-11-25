import { spawn, type ChildProcess } from 'child_process';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_PORT = Number(process.env.PYTHON_BACKEND_PORT || 5050);
const PYTHON_URL = `http://127.0.0.1:${PYTHON_PORT}`;
const PORT = Number(process.env.PORT || 3000);

let pythonProc: ChildProcess | null = null;

function startPythonBackend(): void {
  const scriptPath = path.join(__dirname, 'backend', 'app.py');
  pythonProc = spawn('python3', [scriptPath], {
    cwd: __dirname,
    env: {
      ...process.env,
      PYTHON_BACKEND_PORT: String(PYTHON_PORT),
      PYTHON_BACKEND_HOST: '127.0.0.1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  pythonProc.stdout?.on('data', (chunk) => {
    process.stdout.write(`[python] ${chunk}`);
  });
  pythonProc.stderr?.on('data', (chunk) => {
    process.stderr.write(`[python] ${chunk}`);
  });

  pythonProc.on('exit', (code, signal) => {
    console.error(`[python] backend exited (code=${code}, signal=${signal})`);
    pythonProc = null;
  });
}

async function waitForPythonHealth(timeoutMs = 8000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${PYTHON_URL}/api/health`);
      if (res.ok) return;
    } catch {
      // Wait for Python server startup
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error('Python mathematical engine did not become ready in time.');
}

async function startServer(): Promise<void> {
  startPythonBackend();
  await waitForPythonHealth();

  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Proxy all /api/* requests directly to the Python Mathematical Engine
  app.use('/api', async (req, res) => {
    try {
      const targetUrl = `${PYTHON_URL}${req.originalUrl}`;
      const init: RequestInit = {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        init.body = JSON.stringify(req.body ?? {});
      }

      const upstream = await fetch(targetUrl, init);
      const text = await upstream.text();
      res.status(upstream.status);
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
      res.send(text);
    } catch (err) {
      console.error('Error proxying to Python backend:', err);
      res.status(502).json({
        ok: false,
        error: 'Mathematical engine is temporarily unavailable.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`GroupTheory Lab server listening on http://0.0.0.0:${PORT}`);
  });

  const cleanup = () => {
    if (pythonProc && !pythonProc.killed) {
      pythonProc.kill('SIGTERM');
    }
    server.close();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

startServer().catch((err) => {
  console.error('Failed to start GroupTheory Lab server:', err);
  if (pythonProc && !pythonProc.killed) {
    pythonProc.kill('SIGTERM');
  }
  process.exit(1);
});
