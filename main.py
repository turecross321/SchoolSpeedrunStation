from __future__ import annotations

import asyncio
from http import HTTPStatus
import json
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict

from nfc_server import websocket_server


BASE_DIR = Path(__file__).resolve().parent
UI_DIR = BASE_DIR / "ui"
CONFIG_PATH = BASE_DIR / "config.yml"


def load_config() -> Dict[str, Any]:
	"""Load YAML config if PyYAML is present, otherwise fall back to a tiny parser for simple key: value lines.

	This keeps the deployment flexible if PyYAML isn't installed.
	"""
	cfg: Dict[str, Any] = {}

	if not CONFIG_PATH.exists():
		return cfg

	try:
		import yaml  # type: ignore

		with CONFIG_PATH.open("r", encoding="utf-8") as f:
			loaded = yaml.safe_load(f)
			if isinstance(loaded, dict):
				cfg = loaded
	except Exception:
		# Minimal fallback parser for very simple YAML (key: value)
		text = CONFIG_PATH.read_text(encoding="utf-8")
		for raw in text.splitlines():
			line = raw.strip()
			if not line or line.startswith("#"):
				continue
			if ":" in line:
				k, v = line.split(":", 1)
				key = k.strip()
				val = v.strip()
				# strip quotes if present
				if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
					val = val[1:-1]
				cfg[key] = val

	return cfg


cfg = load_config()

# Defaults
HTTP_HOST = cfg.get("http_host", "127.0.0.1")
HTTP_PORT = int(cfg.get("http_port", 6768))
WEBSOCKET_HOST = cfg.get("websocket_host", "127.0.0.1")
WEBSOCKET_PORT = int(cfg.get("websocket_port", 6769))
API_BASE_URL = cfg.get("api_base_url", "http://127.0.0.1:5055/")
REGISTRATION_PAGE_URL = cfg.get("registration_page_url", "http://127.0.0.1:5056/")
STATION = int(cfg.get("station", 0))


class UiRequestHandler(SimpleHTTPRequestHandler):
	def do_GET(self) -> None:
		if self.path == "/config.js":
			config = {
				"baseUrl": API_BASE_URL,
				"registrationPageUrl": REGISTRATION_PAGE_URL,
				"station": STATION,
			}
			payload = f"window.APP_CONFIG = {json.dumps(config)};\n"
			encoded = payload.encode("utf-8")
			self.send_response(HTTPStatus.OK)
			self.send_header("Content-Type", "application/javascript; charset=utf-8")
			self.send_header("Content-Length", str(len(encoded)))
			self.end_headers()
			self.wfile.write(encoded)
			return

		super().do_GET()


def start_http_server() -> None:
	handler = partial(UiRequestHandler, directory=str(UI_DIR))
	server = ThreadingHTTPServer((HTTP_HOST, HTTP_PORT), handler)
	print(f"Serving UI on http://{HTTP_HOST}:{HTTP_PORT}")
	try:
		server.serve_forever()
	finally:
		server.server_close()


def start_websocket_server() -> None:
	asyncio.run(websocket_server.main(WEBSOCKET_HOST, str(WEBSOCKET_PORT)))


def main() -> None:
	websocket_thread = threading.Thread(target=start_websocket_server, daemon=True)
	websocket_thread.start()
	start_http_server()


if __name__ == "__main__":
	main()
