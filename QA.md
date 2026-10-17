# Validation

- Full LaTeX conversion: 6 chapters/guide sections, 39 sections, 78 editorial/teaching boxes, 623 math expressions, and 5 original body figures.
- KaTeX parse checks passed for every expression.
- Reference values checked for normal CDF/quantile, chi-square quantiles/CDF, Student density, binomial total mass and tail probability.
- Browser: every chapter opened, no equation failures, all 9 contextual labs attached; all 9 standalone labs loaded with finite statistics.
- Verified changing probability, hypothesis alpha (same p-value, changed rejection decision), coverage resampling (new intervals and counts), PDF page navigation and zoom, search results, bookmarks, reader settings and dark mode.
- Responsive review at desktop 1440×1000 and phone 390×844; long equations and tables scroll inside their own containers.
- Simulation hypotheses, standardization, variance conventions, and confidence-interval interpretation are stated alongside each lab.

## RTL rendering repair

- Reproduced the reported consistency example and the broken Persian text on PDF page 2.
- Inline math now forms an isolated, nonwrapping LTR unit. Small padding accommodates italic glyph overhang without unnecessary scrollbars; very long expressions retain local scrolling.
- Explicit LTR canvas and drawing-context direction preserve the original PDF glyph coordinates inside the Persian site.
- Verified the reported example at desktop and 390px phone widths: no fragmented inline equations. Verified PDF page 2 and page navigation/zoom on phone and desktop.
- Footer includes the requested heart credit and GitHub profile link.

## Chapter downloads

- Compiled all 6 standalone sources twice with XeLaTeX: guide (1 page), chapters 1–4 (6, 6, 13, 10 pages), appendix (3 pages).
- Each output retains the corresponding original chapter content, vector diagrams and numbering, plus professor/compiler credits.
- Verified PDF title metadata, nonempty pages, signatures, size metadata, and synchronization with the complete source.
- Browser-tested both download links for chapter 3: saved PDF and TEX bytes match the compiled exports. Verified the all-chapters menu displays six PDF/TEX pairs.

## Smooth motion and search focus

- Added interruptible SVG interpolation for compatible paths/bars/intervals; incompatible topology crossfades, then retains only the exact final SVG.
- Modals animate both entry and dismissal, including Escape and backdrop clicks; view/lab changes, mobile menu, chapter export disclosure, controls and theme colors share short easing transitions.
- Search input and search opener no longer show a focus ring; the neutral input border is unchanged.
- Rapid slider changes are coalesced per frame. Changing experiments replaces input handlers and invalidates pending work for the previous experiment.
- Existing math/reference-value and chapter-download tests still pass; path interpolation tests verify exact endpoints and safe fallback for incompatible SVG shapes.
- Browser-tested updates across experiments with no new console errors and finite chart output. Reduced-motion preferences disable JS animation and CSS transitions.
