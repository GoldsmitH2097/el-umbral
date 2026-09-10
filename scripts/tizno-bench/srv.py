#!/usr/bin/env python3
"""Sirve public/ en :4181 y mapea /tizno/ → tizno-ai.html (como Netlify).
Con ?v=<nombre> sirve scripts/tizno-bench/variantes/<nombre>.html en su lugar:
copias del rig con un filtro distinto, para medirlas con bench.mjs.
Uso: python3 scripts/tizno-bench/srv.py   (Ctrl-C para parar)"""
import http.server, functools, urllib.parse, os
AQUI = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(AQUI, '..', '..', 'public'))
class H(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        p, _, q = path.partition('?')
        if p in ('/tizno', '/tizno/', '/en/tizno', '/en/tizno/'):
            v = urllib.parse.parse_qs(q).get('v', [None])[0]
            return os.path.join(AQUI, 'variantes', v + '.html') if v else ROOT + '/tizno-ai.html'
        return super().translate_path(path)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def log_message(self, *a): pass
print('sirviendo', ROOT, 'en http://127.0.0.1:4181/tizno/')
http.server.ThreadingHTTPServer(('127.0.0.1', 4181), functools.partial(H, directory=ROOT)).serve_forever()
