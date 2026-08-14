#!/usr/bin/env bash
# Local preview server.
#
#   ./serve.sh            -> http://127.0.0.1:4000  (rebuilds on save)
#   ./serve.sh --build    -> one-off build into _site/, no server
#
# Notes on why this script exists rather than a bare `bundle exec jekyll serve`:
#
#  * Ruby 3.1, not 3.3. `github-pages` pins Jekyll 3.9 / Liquid 4.0.3, and
#    Liquid 4.0.3 calls `Object#tainted?`, which Ruby 3.2 removed. Building
#    under Ruby 3.3 dies with "undefined method `tainted?'".
#  * PAGES_REPO_NWO. The `github-pages` gem resolves site metadata from the
#    GitHub API. Locally there is no API token, so the build aborts with
#    "No repo name found" unless the repo is named explicitly.
#  * JEKYLL_ENV=production. Search is disabled in development, so this is the
#    only way to preview it. It also matches what GitHub Pages builds.

set -euo pipefail

RUBY_BIN="${RUBY_BIN:-/c/Ruby31-x64/bin}"
[ -d "$RUBY_BIN" ] || { echo "Ruby not found at $RUBY_BIN — set RUBY_BIN to your Ruby 3.1 bin directory." >&2; exit 1; }
export PATH="$RUBY_BIN:$PATH"

export PAGES_REPO_NWO="${PAGES_REPO_NWO:-praked/praked.github.io}"
export JEKYLL_ENV="${JEKYLL_ENV:-production}"

cd "$(dirname "$0")"

if [ "${1:-}" = "--build" ]; then
  exec bundle exec jekyll build
fi

exec bundle exec jekyll serve --host 127.0.0.1 --port 4000 --livereload
