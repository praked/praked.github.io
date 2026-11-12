#!/usr/bin/env bash
# Regenerate `tools/urls-baseline.txt` — the frozen list of every path this
# site publishes, which `check-links.sh` asserts against after every change.
#
#   ./tools/make-baseline.sh          # build, then snapshot
#   ./tools/make-baseline.sh --no-build   # snapshot the existing _site/
#
# Run this ONLY to establish the contract, or to deliberately add newly created
# URLs to it. Never run it to "fix" a failing check — that silently discards
# the very breakage the check exists to catch.

set -euo pipefail

cd "$(dirname "$0")/.."
# shellcheck source=tools/lib-urls.sh
. tools/lib-urls.sh

BASELINE='tools/urls-baseline.txt'

if [ "${1:-}" != '--no-build' ]; then
  echo '==> Building site'
  ./serve.sh --build >/dev/null
fi

[ -d _site ] || { echo 'No _site/ — build first.' >&2; exit 1; }

echo "==> Snapshotting published paths to $BASELINE"

{
  cat <<'EOF'
# Published-path contract for praked.github.io — DO NOT EDIT BY HAND.
#
# Regenerate with `./tools/make-baseline.sh`, and only when you have
# deliberately added a URL. `./tools/check-links.sh` fails if any path listed
# here stops being published, which is what keeps old links working across
# the theme replacement and build-pipeline change.
#
# Paths are normalised: "/foo/index.html" is recorded as "/foo/", because that
# is what the server serves. Publication pages keep their ".html" because
# their permalinks have no trailing slash — "/publications/GIS_paper" is
# served by "GIS_paper.html" existing.
#
# Theme-internal assets (assets/css, assets/js, assets/icons, assets/icomoon,
# assets/bower_components) are excluded on purpose: they belong to whatever
# theme is installed, and replacing the theme is supposed to change them.
EOF
  printf '#\n# Generated: %s\n#\n' "$(date -u '+%Y-%m-%d %H:%M UTC')"
  list_urls _site
} > "$BASELINE"

count=$(grep -vc '^#' "$BASELINE" || true)
echo "==> Recorded $count published paths"
