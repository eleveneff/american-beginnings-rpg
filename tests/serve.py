"""Local test server with HTTP Range support, so audio and video can seek like on GitHub Pages
(python -m http.server cannot). Usage, from the repo root: python3 tests/serve.py [port]"""
import http.server, os, re, sys

class H(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        rng = self.headers.get("Range"); path = self.translate_path(self.path)
        if not rng or os.path.isdir(path) or not os.path.isfile(path):
            return super().send_head()
        m = re.match(r"bytes=(\d*)-(\d*)", rng); size = os.path.getsize(path)
        if not m:
            return super().send_head()
        a, b = m.group(1), m.group(2)
        start = int(a) if a else max(0, size - int(b)); end = int(b) if a and b else size - 1
        if start >= size:
            self.send_error(416); return None
        end = min(end, size - 1); f = open(path, "rb"); f.seek(start); self._left = end - start + 1
        self.send_response(206); self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}"); self.send_header("Content-Length", str(self._left))
        self.send_header("Accept-Ranges", "bytes"); self.end_headers(); return f

    def copyfile(self, src, dst):
        left = getattr(self, "_left", None)
        if left is None:
            return super().copyfile(src, dst)
        while left > 0:
            buf = src.read(min(65536, left))
            if not buf: break
            dst.write(buf); left -= len(buf)
        self._left = None

    def end_headers(self):
        if not getattr(self, "_left", None): self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("", int(sys.argv[1]) if len(sys.argv) > 1 else 8765), H).serve_forever()
