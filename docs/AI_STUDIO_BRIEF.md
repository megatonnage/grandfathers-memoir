# Grandfather's Memoir — AI Studio Build Brief

## Project Intent

A multi-layered digital archive of my grandfather's Vietnamese memoirs. This is not just a translation project—it is a *temporal palimpsest* where five voices across time converse on the same page.

The deep motivation: "Going back in time and being with him as he fights to shape his life." This is witnessing. This is presence across generations.

---

## The Five-Layer Architecture

Each chapter contains five distinct layers, visually distinct, toggleable in the web interface:

| Layer | Name | Content | Visual Identity | Print Equivalent |
|-------|------|---------|-----------------|------------------|
| 1 | **Original** | Grandfather's Vietnamese text | Serif (Source Serif Pro), warm gray (#3d3d3d), cream background (#fdfcfa) | Historical document |
| 2 | **Bridge** | Literal Vietnamese→English translation | Sans-serif (Inter), neutral gray (#4a4a4a), white background | Technical/fidelity layer |
| 3 | **Witness** | My personal response/reflection | Italic/script (Crimson Italic), deep indigo (#4338ca), subtle lavender tint | Intimate margin notes |
| 4 | **Chorus** | Family responses & corrections | Sans (Inter), forest green (#166534), threaded format | Collaborative annotations |
| 5 | **Futures** | Speculative voices from far-future descendants | Monospace (JetBrains Mono), electric violet (#7c3aed), dark background (#0a0a0f) | Epistolary sci-fi |

**Key Design Principle:** "Layered by text, not by time." Readers always know which voice they're reading. Visual distinction aids navigation in both digital (toggle) and print (static) forms.

---

## Content Structure

```
chapters/
├── _meta.json              # Chapter registry: titles, order, layer availability
├── 01-early-years/
│   ├── layer-1-original.md      # Vietnamese prose
│   ├── layer-2-translation.md   # English prose
│   ├── layer-3-witness.md       # Personal reflection prose
│   ├── layer-4-chorus.json      # Array of family responses
│   └── layer-5-futures.json     # Array of future voices
├── 02-war-years/
│   └── ...
└── [03-05]/
```

---

## Core Features Required

1. **Layer Toggle System** — Global and per-chapter visibility controls
2. **Chapter Navigation** — Sequential (prev/next) + browse (TOC/grid)
3. **Typography** — Five distinct visual identities as specified
4. **Content Rendering** — Markdown (layers 1-3), JSON (layers 4-5)
5. **Static Export** — Next.js `output: 'export'` for deployment

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Build:** Static export

---

**Build the Next.js app with layer toggles, chapter navigation, and the five visual identities.**
