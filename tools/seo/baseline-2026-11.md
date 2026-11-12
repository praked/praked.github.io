# Search Console baseline — 12 months to 2026-11-09

Source: Google Search Console export (Web / text-based search), supplied 2026-11-12.
Kept as the **before** measurement for the SEO work. Re-export after the changes ship
and compare against this file.

**Totals: 238 clicks · 18,313 impressions · 1.30% CTR · avg position ≈ 7.3**

Position is fine. CTR is the problem — at an average position of 7, a 1.3% CTR is roughly
a third to a quarter of what that ranking should earn.

---

## Three pages are 95% of all impressions

| Page | Clicks | Impressions | CTR | Position |
|---|---:|---:|---:|---:|
| `/` | 148 | 5,861 | 2.53% | 6.97 |
| `/publications/GIS_paper` | 67 | 5,532 | 1.21% | 10.61 |
| `/projects/2022-10-28-HiveopolisBeeRobot/` | **6** | **5,993** | **0.10%** | **4.54** |
| `/projects/2023-09-15-SailSwarm/` | 16 | 296 | 5.41% | 8.24 |
| `/projects/` | 1 | 219 | 0.46% | 7.05 |
| `/misc/` | 0 | 751 | 0% | 8.84 |
| `/CV/` | 0 | 99 | 0% | 9.15 |
| `/publications/SailSwarmSim-SAB2026` | 0 | 50 | 0% | 6.64 |
| `/projects/2017-11-17-CMOWC/` | 0 | 24 | 0% | 7.58 |

Everything else — `/publications/` itself, `/talks/`, `/tools/`, `/contact/`, and **7 of the 9
publication pages** — recorded no impressions at all in 12 months.

### The Hiveopolis anomaly

`/projects/2022-10-28-HiveopolisBeeRobot/` ranks at **position 4.5** and converts at **0.1%**.
A page in that slot would normally see 5–9% CTR; even 2% would be ~120 clicks instead of 6.
The queries it ranks for are informational and specific:

| Query | Impressions | Position | Clicks |
|---|---:|---:|---:|
| `hiveopolis robotic bee waggle dance honey production` | 170 | 5.27 | 0 |
| `hiveopolis robotic bee waggle dance` | 165 | 3.80 | 0 |
| `hiveopolis robotic honeybee waggle dance` | 91 | **1.11** | 0 |
| `hiveopolis robotic bee` | 95 | 1.87 | 0 |
| `hiveopolis robobee honey production` | 95 | 4.83 | 0 |

Ranking **first** for a query and earning zero clicks points at the result itself, not the
ranking. The page's body is two short paragraphs followed by five autoplaying videos — it
offers no text that answers "honey production" or explains the waggle dance, so the snippet
Google can build from it is thin and generic.

### The GIS sleeper hit

A 2016 undergraduate preprint is the site's **second-largest traffic source** — 5,532
impressions across a large query cluster (`gis crime mapping`, `crime mapping using gis`,
`gis in crime mapping`, `crime analysis gis`, …, ~2,000 impressions combined beyond the
page's own). It sits at position 10.6, i.e. the bottom of page 1.

Its meta description is **the site-wide author bio**, because the file sets `excerpt: ''`
and has no `description:` (see the defect list below).

---

## Confirmed technical defects

1. **8 of 9 publication pages serve the generic site bio as their meta description.**
   `jekyll-seo-tag` falls back to `site.description` because each file sets `excerpt: ''`
   and defines no `description:`. So the SERP entry for `/publications/GIS_paper` — 5,532
   impressions — reads "Pranav Kedia is a Ph.D. researcher in the Cyber Physical Systems
   group…" instead of anything about crime mapping. Only `SailSwarmSim-SAB2026` has its own.
2. **Publication pages emit `BlogPosting` JSON-LD**, not `ScholarlyArticle`. `_config.yml`
   has `seo.type: WebPage` defaults scoped to `projects` and `featured_categories`, but
   nothing scoped to `publications/`.
3. **No `citation_*` meta tags anywhere** — Google Scholar cannot index any of the papers.
4. **Theme licence pages are in the sitemap.** `/licenses/Apache-2.0/`, `/licenses/GPL-3.0/`,
   `/licenses/MIT/`, `/licenses/PRO/`, `/licenses/W3C-20150513/` and `/licenses/` are all
   submitted for indexing. They are Hydejack's licences, not site content.
5. **`/404.html` is indexable** and carries the site bio as its description.
6. **Five autoplaying videos (~3.8 MB) on the Hiveopolis page**, each `autoplay loop muted`.
   Bad on mobile and a direct Core Web Vitals cost on the site's highest-impression page.
7. **Four project pages have under 250 characters of body text** — Tiller, LEGO, Occupancy,
   EVS. They are effectively empty pages carrying a title and an image.

## Audience notes

- **Devices:** Desktop 13,273 impressions / 1.12% CTR · Mobile 4,848 / 1.82% · Tablet 192 / 0.52%.
  Mobile converts better than desktop, which makes the mobile-hostile `<embed>` PDF on `/CV/`
  and the autoplaying videos worth fixing on their own.
- **Countries:** US 8,792 impressions but only 0.50% CTR · India 2,126 / 2.63% · **Germany 462 /
  11.04%** — by far the best CTR, and the likeliest academic audience.
- **Brand query works:** `pranav kedia` — 96 clicks, position 1.22, 26.89% CTR. Everything
  else underperforms.
- Substantial namesake noise (`vijay kedia`, `priyanka kedia`, `pranav mohanlal`, …) inflates
  impressions at deep positions. Not actionable; discount it when reading totals.
- `autonomous sailing` sits at **position 91** — the current research topic ranks nowhere.

## Caveat on the redirect gap

This export lists only pages that *earned impressions*; it is not a 404 report and does not
list redirected URLs. It therefore does **not** close the §1e question in the main plan —
whether legacy URLs outside the repo still receive traffic. For that, check Search Console's
**Pages → Not indexed → Not found (404)** report, and GA4 for the 404 page path.
