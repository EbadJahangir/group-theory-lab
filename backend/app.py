"""
GroupTheory Lab Python Backend Server.
Supports Flask when installed, with a zero-dependency stdlib ThreadingHTTPServer fallback
so the Python math engine runs cleanly in restricted environments as well.
"""

from __future__ import annotations
import json
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

# Ensure project root is on sys.path when invoked as `python3 backend/app.py`
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.services.math_service import dispatch_endpoint


def run_stdlib_server(host: str = "127.0.0.1", port: int = 5050) -> None:
    class SymmetryHandler(BaseHTTPRequestHandler):
        def _send_json(self, status: int, body: dict) -> None:
            encoded = json.dumps(body).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(encoded)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.end_headers()
            self.wfile.write(encoded)

        def do_OPTIONS(self) -> None:
            self._send_json(204, {})

        def do_GET(self) -> None:
            parsed = urlparse(self.path)
            status, body = dispatch_endpoint(parsed.path, "GET", None)
            self._send_json(status, body)

        def do_POST(self) -> None:
            parsed = urlparse(self.path)
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length) if length > 0 else b"{}"
            try:
                payload = json.loads(raw.decode("utf-8")) if raw else {}
                if not isinstance(payload, dict):
                    payload = {}
            except json.JSONDecodeError:
                self._send_json(400, {"ok": False, "error": "Invalid JSON request body."})
                return
            status, body = dispatch_endpoint(parsed.path, "POST", payload)
            self._send_json(status, body)

        def log_message(self, format: str, *args) -> None:
            # Quiet clean logging
            pass

    server = ThreadingHTTPServer((host, port), SymmetryHandler)
    print(f"GroupTheory Lab Python Math Engine listening on http://{host}:{port} (stdlib HTTP)", flush=True)
    server.serve_forever()


def create_flask_app():
    from flask import Flask, jsonify, request

    app = Flask(__name__)

    @app.route("/api", methods=["GET", "POST"])
    @app.route("/api/", methods=["GET", "POST"])
    def handle_api_root():
        status, body = dispatch_endpoint("/api", request.method, None)
        return jsonify(body), status

    @app.route("/api/<path:subpath>", methods=["GET", "POST"])
    def handle_api(subpath: str):
        if request.method == "POST":
            raw_body = request.get_data(cache=True)
            if raw_body and raw_body.strip():
                payload = request.get_json(silent=True)
                if payload is None:
                    return jsonify({"ok": False, "error": "Invalid JSON request body."}), 400
                if not isinstance(payload, dict):
                    payload = {}
            else:
                payload = {}
        else:
            payload = None

        status, body = dispatch_endpoint(f"/api/{subpath}", request.method, payload)
        return jsonify(body), status

    return app


if __name__ == "__main__":
    port = int(os.environ.get("PYTHON_BACKEND_PORT", "5050"))
    host = os.environ.get("PYTHON_BACKEND_HOST", "127.0.0.1")
    use_flask = os.environ.get("USE_FLASK", "auto")

    if use_flask != "0":
        try:
            import flask  # noqa: F401
            flask_app = create_flask_app()
            print(f"GroupTheory Lab Python Math Engine listening on http://{host}:{port} (Flask)", flush=True)
            flask_app.run(host=host, port=port, debug=False, use_reloader=False, threaded=True)
            sys.exit(0)
        except ImportError:
            pass

    run_stdlib_server(host=host, port=port)
