#!/usr/bin/env bash
# Local preview server.
#
#   ./serve.sh            -> http://127.0.0.1:4000  (rebuilds on save)
#   ./serve.sh --build    -> one-off build into _site/, no server
#
# This script used to hard-code a Ruby 3.1 path and export PAGES_REPO_NWO,
# both of which were workarounds for the `github-pages` gem:
#
#  * The Ruby pin existed because `github-pages` pinned Liquid 4.0.3, which
#    called `Object#tainted?` — removed in Ruby 3.2. Jekyll 4 ships Liquid
#    4.0.4 and runs fine on current Ruby, so the pin is gone.
#  * PAGES_REPO_NWO existed because `github-pages` resolved site metadata from
#    the GitHub API and aborted locally without a token. Jekyll 4 does not, and
#    `url:`/`baseurl:` are set explicitly in _config.yml anyway.
#
# Set RUBY_BIN only if the Ruby you want is not already first on PATH, e.g.
#   RUBY_BIN=/c/Ruby33-x64/bin ./serve.sh

set -euo pipefail

cd "$(dirname "$0")"

if [ -n "${RUBY_BIN:-}" ]; then
  export PATH="$RUBY_BIN:$PATH"
fi

# Matches what CI builds. Also the only way to preview production-only output.
export JEKYLL_ENV="${JEKYLL_ENV:-production}"

if [ "${1:-}" = "--build" ]; then
  exec bundle exec jekyll build
fi

exec bundle exec jekyll serve --host 127.0.0.1 --port 4000 --livereload
