#!/usr/bin/env bash
# Shared helpers for the link-preservation harness.
#
# `make-baseline.sh` and `check-links.sh` MUST derive their URL lists the same
# way, or the diff between them is meaningless. That logic lives here so there
# is exactly one copy of it.

# ---------------------------------------------------------------------------
# Paths that are deliberately NOT part of the contract.
#
# These are build artefacts of whatever theme is in use, not URLs anyone links
# to. Hydejack emits ~21 MB of MathJax bower components and its own hashed
# css/js bundles; replacing the theme is supposed to remove them, so tracking
# them would make every theme change look like mass link breakage.
#
# `/serve.sh` is the local preview script, currently published by accident.
# It is excluded here because it is being added to `exclude:` in _config.yml.
# ---------------------------------------------------------------------------
is_excluded() {
  case "$1" in
    /assets/bower_components/*) return 0 ;;
    /assets/css/*)              return 0 ;;
    /assets/js/*)               return 0 ;;
    /assets/icomoon/*)          return 0 ;;
    /assets/icons/*)            return 0 ;;
    /assets/bower.json)         return 0 ;;
    # Hydejack's own images. They were in the baseline because the theme
    # published them, not because this site ever referenced one: site.logo is
    # /assets/img/profilepicsmall.jpg, site.accent_image is the parusnyy photo,
    # and swipe.svg was only an hy-drawer preload. Shipping the theme's logo in
    # the commit that removes the theme would be incoherent, so they are
    # excluded rather than vendored.
    /assets/img/logo.png)       return 0 ;;
    /assets/img/sidebar-bg.jpg) return 0 ;;
    /assets/img/swipe.svg)      return 0 ;;
    /serve.sh)                  return 0 ;;
    *)                          return 1 ;;
  esac
}

# ---------------------------------------------------------------------------
# The colon permalink.
#
# `publications/2021-06-01-GenGrid.md` has a permalink containing a ":", which
# is a legal URL and a legal Linux filename but NOT a legal Windows filename.
# A Windows build silently truncates it at the colon, writing
#
#     _site/publications/GenGrid            (no extension)
#
# instead of
#
#     _site/publications/GenGrid:-A-Generalised-...-Robotics.html
#
# The contract has to record the URL that production (Linux) actually serves,
# so the mangled Windows path is normalised back to the real one. The checker
# therefore passes on both platforms, and CI remains the authority for whether
# that file is genuinely produced.
# ---------------------------------------------------------------------------
readonly COLON_URL='/publications/GenGrid:-A-Generalised-Distributed-Experimental-Environmental-Grid-for-Swarm-Robotics.html'
readonly COLON_MANGLED='/publications/GenGrid'

on_windows() {
  case "$(uname -s 2>/dev/null)" in
    MINGW*|MSYS*|CYGWIN*) return 0 ;;
    *)                    return 1 ;;
  esac
}

# Emit the sorted list of published paths for a built site.
#
#   list_urls <site_dir>
#
# Output is one normalised path per line:
#   * "_site" prefix stripped
#   * "/index.html" collapsed to "/" (what the server actually serves)
#   * every other extension left intact — a publication permalink without a
#     trailing slash is served BY the ".html" file existing, so the file path
#     is the thing worth asserting.
list_urls() {
  local site_dir="${1:?list_urls needs a site directory}"
  local path

  find "$site_dir" -type f -print \
    | sed "s|^${site_dir}||" \
    | sed 's|\\|/|g' \
    | while IFS= read -r path; do
        [ -n "$path" ] || continue
        is_excluded "$path" && continue

        # Collapse directory indexes to their served URL.
        case "$path" in
          /index.html) path='/' ;;
          */index.html) path="${path%index.html}" ;;
        esac

        # Normalise the Windows-mangled colon permalink (see above).
        # Guarded on the platform: on Linux a file genuinely named
        # "publications/GenGrid" would be a real, different URL, and silently
        # rewriting it to the colon path would hide its loss.
        if on_windows && [ "$path" = "$COLON_MANGLED" ]; then
          path="$COLON_URL"
        fi

        printf '%s\n' "$path"
      done \
    | LC_ALL=C sort -u
}

# Read the redirect target out of a jekyll-redirect-from stub.
#
#   redirect_target <site_dir> <url_path>
#
# Prints the absolute URL the stub points at, or nothing if the file is not a
# redirect stub. The stub carries the target in three places (meta refresh,
# canonical link, and a JS assignment); the meta refresh is the one browsers
# without JS obey, so that is the one asserted.
redirect_target() {
  local site_dir="${1:?}" url="${2:?}" file

  case "$url" in
    */) file="${site_dir}${url}index.html" ;;
    *)  file="${site_dir}${url}" ;;
  esac

  [ -f "$file" ] || return 0

  grep -o 'http-equiv="refresh"[^>]*' "$file" 2>/dev/null \
    | grep -o 'url=[^"]*' \
    | head -1 \
    | sed 's/^url=//'
}
