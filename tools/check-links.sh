#!/usr/bin/env bash
# Link-preservation check for praked.github.io.
#
#   ./tools/check-links.sh              # build, then check
#   ./tools/check-links.sh --no-build   # check the existing _site/
#
# Three assertions, any of which fails the run:
#
#   1. Every path in `tools/urls-baseline.txt` is still published.
#      This is what stops the theme replacement and the Jekyll 4 move from
#      quietly dropping a URL someone else links to.
#   2. Every legacy redirect in `tools/redirects-expected.txt` still exists
#      and still points at the right target.
#   3. No internal link in the built HTML points at a path that is not
#      published, beyond the ones recorded in
#      `tools/broken-links-baseline.txt`.
#
# Newly added URLs are reported but never fail the run — growth is fine,
# loss is not.

set -uo pipefail

cd "$(dirname "$0")/.."
# shellcheck source=tools/lib-urls.sh
. tools/lib-urls.sh

BASELINE='tools/urls-baseline.txt'
REDIRECTS='tools/redirects-expected.txt'
KNOWN_BROKEN='tools/broken-links-baseline.txt'

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

failures=0
note()  { printf '     %s\n' "$*"; }
fail()  { printf '  FAIL %s\n' "$*"; failures=$((failures + 1)); }
ok()    { printf '    ok %s\n' "$*"; }

if [ "${1:-}" != '--no-build' ]; then
  echo '==> Building site'
  if ! ./serve.sh --build >"$WORK/build.log" 2>&1; then
    echo 'Build failed:' >&2
    tail -30 "$WORK/build.log" >&2
    exit 1
  fi
fi

[ -d _site ] || { echo 'No _site/ — run without --no-build.' >&2; exit 1; }
[ -f "$BASELINE" ] || { echo "Missing $BASELINE — run ./tools/make-baseline.sh once." >&2; exit 1; }

# ---------------------------------------------------------------------------
# 1. Published-path contract
# ---------------------------------------------------------------------------
echo
echo '==> 1. Published paths'

tr -d '\r' < "$BASELINE" | grep -v '^#' | grep -v '^[[:space:]]*$' | LC_ALL=C sort -u > "$WORK/expected.txt"
list_urls _site > "$WORK/actual.txt"

LC_ALL=C comm -23 "$WORK/expected.txt" "$WORK/actual.txt" > "$WORK/missing.txt"
LC_ALL=C comm -13 "$WORK/expected.txt" "$WORK/actual.txt" > "$WORK/added.txt"

if [ -s "$WORK/missing.txt" ]; then
  while IFS= read -r url; do
    fail "no longer published: $url"
  done < "$WORK/missing.txt"
else
  ok "all $(wc -l < "$WORK/expected.txt" | tr -d ' ') published paths still present"
fi

if [ -s "$WORK/added.txt" ]; then
  note "$(wc -l < "$WORK/added.txt" | tr -d ' ') new path(s) (not a failure):"
  sed 's/^/       + /' "$WORK/added.txt"
fi

# ---------------------------------------------------------------------------
# 2. Legacy redirects
# ---------------------------------------------------------------------------
echo
echo '==> 2. Legacy redirects'

# Strip the configured site URL so targets compare as site-relative paths.
#
# Deliberately strict: _config.yml is edited heavily by the modernisation work,
# and if this silently picks up the wrong line every redirect below reports as
# pointing at an absolute URL — a confusing mass failure instead of a clear
# config error. So require exactly one top-level `url:` that looks like a URL.
url_lines=$(grep -c '^url:[[:space:]]' _config.yml || true)
site_url=$(grep -m1 '^url:[[:space:]]' _config.yml | sed 's/^url:[[:space:]]*//; s|/$||')
if [ "$url_lines" -ne 1 ] || [ -z "${site_url##*[!a-zA-Z0-9:/._-]*}" ] || case "$site_url" in http*) false ;; *) true ;; esac; then
  fail "could not read a single top-level 'url:' from _config.yml (found $url_lines; parsed '$site_url')"
fi

while read -r from to _rest; do
  case "$from" in ''|\#*) continue ;; esac

  # A redirect stub whose OLD path contains ":" cannot be written on Windows.
  # Jekyll truncates it at the colon and leaves a 0-byte file, so
  # redirect_target finds nothing and this check would fail forever on the
  # owner's machine. CI (Linux) is the authority for these.
  if on_windows; then
    case "$from" in
      *:*)
        note "skipped on Windows (colon in path, CI verifies): $from"
        continue
        ;;
    esac
  fi

  actual=$(redirect_target _site "$from")

  if [ -z "$actual" ]; then
    fail "redirect stub missing or not a redirect: $from"
    continue
  fi

  # Compare site-relative.
  actual_path="${actual#"$site_url"}"
  [ -n "$actual_path" ] || actual_path='/'

  if [ "$actual_path" = "$to" ]; then
    ok "$from -> $to"
  else
    fail "$from points at $actual_path, expected $to"
  fi
done < <(tr -d '\r' < "$REDIRECTS")

# ---------------------------------------------------------------------------
# 3. Internal links
# ---------------------------------------------------------------------------
echo
echo '==> 3. Internal links'

# Collect every internal href/src target from the built HTML.
find _site -name '*.html' -print0 \
  | xargs -0 grep -oh '\(href\|src\)="[^"]*"' 2>/dev/null \
  | sed 's/^[a-z]*="//; s/"$//' \
  | grep -v '^[a-z][a-z0-9+.-]*:' \
  | grep -v '^//' \
  | grep '^/' \
  | sed 's/[#?].*$//' \
  | grep -v '^$' \
  | LC_ALL=C sort -u > "$WORK/links.txt"

: > "$WORK/broken.txt"
while IFS= read -r link; do
  is_excluded "$link" && continue

  # A link resolves if any of these exists: the literal file, the same path
  # with ".html" appended (extensionless permalinks), or its directory index.
  if [ -e "_site$link" ] \
     || [ -f "_site${link}.html" ] \
     || [ -f "_site${link%/}/index.html" ]; then
    continue
  fi
  printf '%s\n' "$link" >> "$WORK/broken.txt"
done < "$WORK/links.txt"

LC_ALL=C sort -u "$WORK/broken.txt" -o "$WORK/broken.txt"

if [ -f "$KNOWN_BROKEN" ]; then
  tr -d '\r' < "$KNOWN_BROKEN" | grep -v '^#' | grep -v '^[[:space:]]*$' | LC_ALL=C sort -u > "$WORK/known.txt"
else
  : > "$WORK/known.txt"
fi

LC_ALL=C comm -23 "$WORK/broken.txt" "$WORK/known.txt" > "$WORK/new-broken.txt"

if [ -s "$WORK/new-broken.txt" ]; then
  while IFS= read -r link; do
    fail "internal link goes nowhere: $link"
  done < "$WORK/new-broken.txt"
else
  ok "$(wc -l < "$WORK/links.txt" | tr -d ' ') internal links checked, no new breakage"
fi

if [ -s "$WORK/known.txt" ]; then
  note "$(wc -l < "$WORK/known.txt" | tr -d ' ') known-broken link(s) ignored (see $KNOWN_BROKEN)"
fi

# ---------------------------------------------------------------------------
# 4. Head-tag coverage
#
# These tags are emitted today by `{% seo %}` and `{% feed_meta %}`, which the
# THEME calls. Replacing the theme means the new layout must call them itself —
# and if it forgets, every one of these disappears with no build error and
# checks 1-3 still pass. That is precisely the regression this check exists to
# catch, which is why it is in place before the theme is touched.
# ---------------------------------------------------------------------------
echo
echo '==> 4. Head tags'

# One representative of each layout that renders a full <head>.
HEAD_SAMPLES='
/index.html
/projects/2022-10-28-HiveopolisBeeRobot/index.html
/publications/GIS_paper.html
/talks/index.html
'

# tag-name<TAB>grep pattern
HEAD_TAGS='canonical|rel="canonical"
og:title|property="og:title"
og:url|property="og:url"
feed|application/atom+xml
site-verification|google-site-verification'

for sample in $HEAD_SAMPLES; do
  [ -n "$sample" ] || continue
  f="_site$sample"
  if [ ! -f "$f" ]; then
    fail "head sample missing: $sample"
    continue
  fi

  missing=''
  printf '%s\n' "$HEAD_TAGS" | while IFS='|' read -r tag pattern; do
    [ -n "$tag" ] || continue
    grep -q "$pattern" "$f" || printf '%s ' "$tag"
  done > "$WORK/missing-tags.txt"

  missing=$(cat "$WORK/missing-tags.txt")
  if [ -n "$missing" ]; then
    fail "$sample is missing head tags: $missing"
  else
    ok "$sample has canonical, og:title, og:url, feed, site-verification"
  fi
done

# Every page should carry exactly one robots meta. Nine currently carry two:
# /404.html, /LICENSE/, /NOTICE/ and the six /licenses/* pages. Each gets one
# from the theme's `sitemap: false` arm (content="noindex") and one from
# `_includes/my-head.html`'s `noindex: true` block (content="noindex, follow").
# Both say noindex, so this is untidy rather than harmful.
#
# The budget is a ratchet. It was 9 under Hydejack; the theme replacement made
# `_includes/head.html` the sole owner of this tag and drove it to 0, so the
# ratchet is now tightened to 0. Any page growing a second robots meta fails.
robots_dupes=0
for f in $(find _site -name '*.html'); do
  n=$(grep -o '<meta name="robots"' "$f" 2>/dev/null | wc -l | tr -d ' ')
  [ "$n" -gt 1 ] && robots_dupes=$((robots_dupes + 1))
done
if [ "$robots_dupes" -gt "${ROBOTS_DUPES_ALLOWED:-0}" ]; then
  fail "$robots_dupes page(s) carry more than one robots meta (allowed: ${ROBOTS_DUPES_ALLOWED:-0})"
else
  ok "robots meta duplication within budget ($robots_dupes page(s); theme replacement reduces this to 0)"
fi

# ---------------------------------------------------------------------------
echo
if [ "$failures" -eq 0 ]; then
  echo 'PASS — no links lost.'
  exit 0
fi
echo "FAIL — $failures problem(s) above."
exit 1
