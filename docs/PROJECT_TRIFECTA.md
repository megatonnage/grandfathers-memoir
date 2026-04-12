# Grandfather's Memoir — Project Trifecta

## STRATEGY.md — The Why

### Purpose
Create a multi-layered digital archive of my grandfather's memoirs—a temporal palimpsest where his voice, my translation, family responses, and speculative futures coexist and converse across time.

### Deep Motivation
"Going back in time and being with him as he fights to shape his life." This is witnessing. This is presence across generations.

**The Man:** A clan built through sheer will and belief. His small pleasures—Pall Malls, jasmine tea, Kung Fu noodles, fishing—belied enormous determination. "Teacher" to his children, "Grandfather" to his grandchildren. His true love was them: living proof of the vision he dreamed as a solitary young man.

**The Undocumented Strength:** His wife, your grandmother. She did not write, so her presence lives in the memories of others. Loving, comforting, gentle humor, transparent emotions—always clearly loving.

**NOT a dead memorial. A living conversation across epochs.**

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

### Five-Layer Model (Evolved)

| Layer | Name | Content | Visual Identity | Access |
|-------|------|---------|-----------------|--------|
| 1 | **Original** | Grandfather's Vietnamese text | Scholarly serif (Crimson Text), warm paper tones | Public |
| 2 | **Bridge** | English translation | Clean sans (Inter), readable | Public |
| 3 | **Chorus** | Family annotations & conversation | Conversational, threaded | Login-gated |
| 4 | **Futures** | Far-future descendants | Distinct, otherworldly | Public |
| 5 | **Replicas** | AI replicas of grandfather, ancestor responses | Circular time aesthetic | Public |

**Time is circular:** Responses from distant ancestors AND far-future descendants. Voices from the end of time converse with voices from the beginning.

### Navigation Model
- **Simul-scroll:** Vietnamese (left) + English (right), moving together
- **Persistent chapters:** Always visible, anchoring the journey
- **Timeline experience:** Search across ancient past AND far future
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
- **Authentication:** NextAuth or similar (for Chorus layer)
- **AI Integration:** OpenAI API (for Replicas layer)
- **Photos:** Responsive gallery, various formats
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
