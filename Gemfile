source "https://rubygems.org"

# Jekyll 4, installed directly rather than through the `github-pages` gem.
#
# `github-pages` is what pinned this site to Jekyll 3.9 and libsass, and it is
# the reason no image-processing or modern-Sass tooling could be used. The
# build now runs in GitHub Actions (.github/workflows/pages.yml), which has no
# plugin allowlist, so the gem's only remaining job — matching what the classic
# builder ran — no longer applies.
#
# Jekyll 4 itself depends on kramdown ~> 2.3, kramdown-parser-gfm, liquid ~> 4.0,
# rouge and webrick, so none of those need a line of their own.
gem "jekyll", "~> 4.4.1"

# dart-sass (sass-embedded) in place of the deprecated libsass.
# Pinned to exactly 3.0.0 because jekyll-remote-theme 0.4.3 caps
# jekyll-sass-converter at <= 3.0.0. Raise this to "~> 3.1" in the same commit
# that removes `remote_theme:` from _config.yml and drops jekyll-remote-theme.
gem "jekyll-sass-converter", "= 3.0.0"

group :jekyll_plugins do
  # 0.1.4 — the version `github-pages` pinned — declares `jekyll ~> 3.0` and
  # will not resolve against Jekyll 4. This is the one hard blocker in the set.
  gem "jekyll-default-layout",        "~> 0.2.1"
  gem "jekyll-feed",                  "~> 0.18.0"
  gem "jekyll-include-cache",         "~> 0.3.2"
  gem "jekyll-optional-front-matter", "~> 0.3.5"
  gem "jekyll-readme-index",          "~> 0.6.0"
  # Produces every legacy redirect stub in tools/redirects-expected.txt.
  gem "jekyll-redirect-from",         "~> 0.17.0"
  gem "jekyll-relative-links",        "~> 0.9.2"
  # Required by `remote_theme:`; was transitive via `github-pages`.
  # Delete together with Hydejack.
  gem "jekyll-remote-theme",          "~> 0.4.3"
  gem "jekyll-seo-tag",               "~> 2.9"
  gem "jekyll-sitemap",               "~> 1.4"
  gem "jekyll-titles-from-headings",  "~> 0.6.0"
  gem "jekyll-compose",               "~> 0.12.0"
end

# NOT added, deliberately: `jekyll-github-metadata`. It is the obvious way to
# restore `site.github`, but Hydejack 9.2.1 gates its libsass-only Sass branch
# on `site.github` being present — adding it would undo the dart-sass move.
#
# Also removed: `webrick` (a Jekyll 4 dependency already) and `wdm` (a native
# gem that does not build on modern Ruby without a devkit, and which Jekyll 4's
# listen does not need on Windows).

gem "tzinfo-data", platforms: [:windows]
