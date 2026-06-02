#!/usr/bin/env python3
"""本地预览：所有响应带 no-cache，避免浏览器一直显示旧页面。"""
import http.server
import socketserver
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PORT = 5500


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
        print(f"本地预览（禁用缓存）: http://localhost:{PORT}/")
        print("按 Ctrl+C 停止")
        httpd.serve_forever()
