# Ongba Design System Evolution

## Summary

Updated the design system to better align with the project's core intention: a warm, dignified, timeless digital archive for grandfather's memoirs.

## Changes Made

### 1. Color Palette (globals.css)

**Before:**
- Primary: `#18281e` (dark green)
- Secondary: `#d17d56` (orange)
- Background: `#fcf9f3` (bright cream)

**After:**
- Primary: `#2C2419` (deep walnut ink)
- Secondary: `#8B7355` (aged brass)
- Tertiary: `#5A7A6A` (muted jade)
- Background: `#F5F0E8` (warm parchment)

**Rationale:** The new palette evokes natural materials (aged paper, walnut ink, oxidized gold, jade ink stones) creating a more timeless, literary feel.

### 2. Typography (tailwind.config.js + globals.css)

**Before:**
- Headlines: Playfair Display
- Body: Inter
- Labels: Inter

**After:**
- Headlines: Cormorant Garamond (more refined, literary)
- Body: Source Sans 3 (excellent Vietnamese support)
- Labels: Inter (clean, legible at small sizes)

**Rationale:** 
- Cormorant Garamond has higher contrast and classical proportions
- Source Sans 3 has superior Vietnamese diacritic support
- Inter remains for UI chrome where clarity is paramount

### 3. Tailwind Config (tailwind.config.js)

**Added:**
- Complete color token mapping (primary, secondary, tertiary, surface, error, annotation states)
- Font family aliases (headline, body, label, editorial)
- Spacing tokens (content-max, sidebar)
- Backward compatibility for legacy font aliases

### 4. Layout (layout.tsx)

**Added:**
- `antialiased` class for smoother text rendering
- Default background/text color classes
- Improved metadata (title + description)
- Font display swap for better performance

## Files Modified

1. `app/globals.css` — Updated CSS variables
2. `tailwind.config.js` — Extended theme with new tokens
3. `app/layout.tsx` — Added default classes and metadata
4. `DESIGN.md` — Created design system specification
5. `DESIGN-CHANGELOG.md` — This file

## How to Use

### In Components

```tsx
// Colors
<div className="bg-primary text-on-primary">Primary button</div>
<div className="bg-surface text-on-surface">Card</div>
<div className="bg-annotation-public">Public annotation</div>

// Typography
<h1 className="font-headline text-display-lg">Chapter Title</h1>
<p className="font-body text-body-lg">Memoir text...</p>
<span className="font-label text-label-sm">Metadata</span>

// Spacing
<div className="max-w-content mx-auto">Constrained content</div>
```

### In CSS

```css
.my-component {
  color: var(--color-primary);
  background-color: var(--color-surface);
  font-family: var(--font-body);
}
```

## Next Steps

1. **Test the build** — Run `npm run dev` to verify no errors
2. **Update components** — Gradually migrate existing components to use new tokens
3. **Add fonts** — Ensure Cormorant Garamond and Source Sans 3 are loaded
4. **Iterate** — Refine based on usage and feedback

## Design Principles

1. **Warmth over coolness** — Parchment tones, not white
2. **Literary elegance** — Serif headlines, generous whitespace
3. **Timelessness** — No trendy gradients or heavy shadows
4. **Readability first** — Optimized for long-form memoir text
5. **Cultural respect** — Excellent Vietnamese text support
