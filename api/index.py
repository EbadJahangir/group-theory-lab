"""
Vercel Python Serverless Function entrypoint for GroupTheory Lab.
Exposes the top-level Flask `app` instance for Vercel's native Python runtime.
"""

from __future__ import annotations
import os
import sys

# Ensure project root is on sys.path so `backend.*` imports resolve in Vercel's runtime
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app import create_flask_app

app = create_flask_app()


if __name__ == "__main__":
    port = int(os.environ.get("PYTHON_BACKEND_PORT", "5050"))
    host = os.environ.get("PYTHON_BACKEND_HOST", "127.0.0.1")
    app.run(host=host, port=port, debug=False, use_reloader=False, threaded=True)
