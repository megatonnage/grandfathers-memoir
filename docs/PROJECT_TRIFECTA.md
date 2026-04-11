# Grandfather's Memoir — Project Trifecta

## STRATEGY.md — The Why

### Purpose
Create a multi-layered digital archive of my grandfather's memoirs—a temporal palimpsest where his voice, my translation, family responses, and speculative futures coexist and converse across time.

### Deep Motivation
"Going back in time and being with him as he fights to shape his life." This is witnessing. This is presence across generations.

### Core Principles
1. **Layered Truth** — No single interpretation is complete; meaning emerges from the stack
2. **Family as Collaborators** — The archive grows with each relative's contribution
3. **Speculative Continuity** — The future speaks back, completing the circle
4. **Text-First Navigation** — Readers know what they're reading at every moment

### Success Metrics
- Grandfather's voice preserved and accessible
- Translation faithful yet alive
- Family members feel invited to contribute
- Layer 5 feels like a natural extension, not a gimmick

---

## ARCHITECTURE.md — The Structure

### Five-Layer Model

| Layer | Name | Content | Visual Identity |
|-------|------|---------|-----------------|
| 1 | Original | Grandfather's Vietnamese text | Serif, warm, historical |
| 2 | Bridge | Literal Vietnamese→English | Sans-serif, neutral, technical |
| 3 | Witness | Anh's response/reflection | Italic/script, intimate, personal |
| 4 | Chorus | Family responses/corrections | Threaded, conversational, social |
| 5 | Futures | Descendants from far future | Monospace/alien, speculative, cosmic |

### Navigation Model
- **Book mode:** Sequential chapter reading (prev/next)
- **Browse mode:** Chapter grid/toc for jumping
- **Layer controls:** Toggle visibility per layer globally or per-chapter

### Content Structure
```
chapters/
├── 01-early-years/
│   ├── layer-1-original.md
│   ├── layer-2-translation.md
│   ├── layer-3-witness.md
│   ├── layer-4-chorus.json
│   └── layer-5-futures.json
├── 02-war-years/
│   └── ...
└── _meta.json (chapter order, titles, dates)
```

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Content:** Markdown for prose layers, JSON for threaded layers
- **Deployment:** Vercel (or static export)

---

## SPEC.md — The Implementation

### Phase 1: Foundation
- [ ] Project setup (Next.js + Tailwind)
- [ ] Layer toggle system (global + per-chapter)
- [ ] Chapter navigation (prev/next + toc)
- [ ] Visual distinction for each layer
- [ ] Sample chapter with all 5 layers

### Phase 2: Content Pipeline
- [ ] Markdown processing for layers 1-3
- [ ] JSON schema for layers 4-5 (threaded responses)
- [ ] Content validation
- [ ] Build-time content loading

### Phase 3: Polish
- [ ] Typography refinement
- [ ] Mobile responsiveness
- [ ] SEO/meta tags
- [ ] Deployment

### Layer Visual Specs

**Layer 1 (Original):**
- Font: Source Serif Pro or Noto Serif
- Color: Warm gray (#3d3d3d)
- Background: Slight cream tint (#fdfcfa)

**Layer 2 (Bridge):**
- Font: Inter or Source Sans Pro
- Color: Neutral gray (#4a4a4a)
- Background: White

**Layer 3 (Witness):**
- Font: Crimson Italic or handwriting-adjacent
- Color: Deep indigo (#4338ca)
- Background: Very subtle lavender tint

**Layer 4 (Chorus):**
- Font: Inter
- Color: Forest green (#166534)
- Format: Threaded comments with attribution

**Layer 5 (Futures):**
- Font: JetBrains Mono or Space Mono
- Color: Electric violet (#7c3aed)
- Background: Near-black (#0a0a0f) with stars option

### Open Questions
- Authentication for Layer 4 contributions? (Start: manual/PR-based)
- Layer 5: Single author or multiple? (Multiple, tagged by "future")
- Audio layers? (Future enhancement)
