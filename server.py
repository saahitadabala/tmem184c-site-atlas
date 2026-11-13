"""Minimal static server for the TMEM184C Site Atlas.

The Atlas is entirely client-side - no database, no sessions, no state on the
server. All this does is hand out the files in public/ and set the few content
types Python's defaults get wrong for this app.

Deliberately matched to the stack already in use (Flask + gunicorn + Procfile) so
there is nothing new to learn or maintain.
"""
import os

from flask import Flask, send_from_directory

PUBLIC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")

app = Flask(__name__, static_folder=None)


@app.after_request
def headers(resp):
    # the structure files never change between deploys; the code might
    path = resp.headers.get("Content-Disposition", "")
    resp.headers.setdefault("X-Content-Type-Options", "nosniff")
    return resp


@app.route("/")
def index():
    return send_from_directory(PUBLIC, "index.html")


@app.route("/healthz")
def healthz():
    return {"ok": True, "app": "tmem184c-site-atlas"}


@app.route("/<path:path>")
def static_file(path):
    """Serve anything under public/. Unknown paths fall back to the page itself,
    so a link like /#W334 still works if the hash is ever dropped."""
    full = os.path.join(PUBLIC, path)
    if os.path.isfile(full):
        # .pdb is not a type Python knows; without this it downloads instead of
        # being fetched as text by js/geometry.js
        if path.endswith(".pdb"):
            return send_from_directory(PUBLIC, path, mimetype="text/plain")
        return send_from_directory(PUBLIC, path)
    return send_from_directory(PUBLIC, "index.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)
