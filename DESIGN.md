---
name: Ongba
version: alpha
description: A digital archive for grandfather's memoirs — warm, dignified, and timeless.
colors:
  # Primary — Deep walnut ink for headlines and core text
  primary: "#2C2419"
  on-primary: "#F5F0E8"
  primary-container: "#4A3F2E"
  on-primary-container: "#E8DFD0"
  
  # Secondary — Aged brass for interactive elements and warmth
  secondary: "#8B7355"
  on-secondary: "#FFFFFF"
  secondary-container: "#D4C4A8"
  on-secondary-container: "#3D3226"
  
  # Tertiary — Muted jade for annotations and collaborative features
  tertiary: "#5A7A6A"
  on-tertiary: "#FFFFFF"
  tertiary-container: "#B8D4C8"
  on-tertiary-container: "#2A3D34"
  
  # Surfaces — Warm paper tones
  background: "#F5F0E8"
  on-background: "#2C2419"
  surface: "#FAF7F2"
  on-surface: "#2C2419"
  surface-variant: "#EDE8DD"
  on-surface-variant: "#5C5346"
  surface-dim: "#E8E0D4"
  surface-bright: "#FFFFFF"
  surface-container-low: "#F6F3ED"
  surface-container: "#F0EEE8"
  surface-container-high: "#EBE8E2"
  surface-container-highest: "#E5E2DC"
  
  # Utility
  outline: "#A89B8C"
  outline-variant: "#D4CBC0"
  error: "#B85C5C"
  on-error: "#FFFFFF"
  error-container: "#F5D4D4"
  on-error-container: "#5C2A2A"
  
  # Semantic — Annotation states
  annotation-public: "#5A7A6A"
  annotation-private: "#8B7355"
  annotation-chorus: "#6A5A7A"
  
typography:
  # Display — Chapter titles, hero moments
  display-lg:
    fontFamily: "Cormorant Garamond"
    fontSize: 3.5rem
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -0.02em
  display-md:
    fontFamily: "Cormorant Garamond"
    fontSize: 2.5rem
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: -0.01em
  
  # Headlines — Section headers
  headline-lg:
    fontFamily: "Cormorant Garamond"
    fontSize: 2rem
    fontWeight: 500
    lineHeight: 1.3
  headline-md:
    fontFamily: "Cormorant Garamond"
    fontSize: 1.5rem
    fontWeight: 500
    lineHeight: 1.3
  headline-sm:
    fontFamily: "Source Sans 3"
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.02em
  
  # Body — Memoir text, readable and warm
  body-lg:
    fontFamily: "Source Sans 3"
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.7
  body-md:
    fontFamily: "Source Sans 3"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Source Sans 3"
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  
  # Labels — UI chrome, metadata
  label-md:
    fontFamily: "Inter"
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0.04em
  label-sm:
    fontFamily: "Inter"
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0.05em
  
  # Special — Editorial quotes
  editorial:
    fontFamily: "Cormorant Garamond"
    fontSize: 1.25rem
    fontWeight: 400
    lineHeight: 1.6
    fontStyle: italic

rounded:
  none: 0
  sm: 2px
  md: 4px
  lg: 8px
  xl: 12px
  full: 9999px

spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-padding: 24px
  content-max-width: 720px
  sidebar-width: 280px

components:
  # Memoir text block
  memoir-text:
    typography: "{typography.body-lg}"
    textColor: "{colors.on-background}"
    backgroundColor: transparent
    padding: "{spacing.lg}"
    maxWidth: "{spacing.content-max-width}"
  
  # Chapter header
  chapter-header:
    typography: "{typography.display-lg}"
    textColor: "{colors.primary}"
    backgroundColor: transparent
    padding: "{spacing.xl} 0"
    borderBottom: "1px solid {colors.outline-variant}"
  
  # Annotation bubble
  annotation-bubble:
    typography: "{typography.body-sm}"
    textColor: "{colors.on-surface-variant}"
    backgroundColor: "{colors.surface-variant}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    borderLeft: "3px solid {colors.tertiary}"
  
  # Navigation sidebar
  sidebar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    width: "{spacing.sidebar-width}"
    padding: "{spacing.lg}"
    borderRight: "1px solid {colors.outline-variant}"
  
  sidebar-item:
    typography: "{typography.body-md}"
    textColor: "{colors.on-surface-variant}"
    backgroundColor: transparent
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
  
  sidebar-item-active:
    typography: "{typography.body-md}"
    textColor: "{colors.primary}"
    backgroundColor: "{colors.primary-container}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
  
  # Buttons
  button-primary:
    typography: "{typography.label-md}"
    textColor: "{colors.on-primary}"
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.lg}"
    height: 40px
  
  button-ghost:
    typography: "{typography.label-md}"
    textColor: "{colors.secondary}"
    backgroundColor: transparent
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.lg}"
    height: 40px
  
  # Cards — for gallery, timeline
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    shadow: "0 1px 3px rgba(44, 36, 25, 0.08)"
  
  card-hover:
    shadow: "0 4px 12px rgba(44, 36, 25, 0.12)"
  
  # Image treatment
  photo-frame:
    rounded: "{rounded.md}"
    border: "1px solid {colors.outline-variant}"
    padding: "{spacing.sm}"
    backgroundColor: "{colors.surface-bright}"
  
  # Form inputs
  input-field:
    typography: "{typography.body-md}"
    textColor: "{colors.on-surface}"
    backgroundColor: "{colors.surface-bright}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
    height: 40px
    border: "1px solid {colors.outline}"
  
  input-field-focus:
    border: "1px solid {colors.secondary}"
    shadow: "0 0 0 3px rgba(139, 115, 85, 0.15)"
---

## Overview

Ongba is a digital memoir archive that bridges generations through story. The design evokes the warmth of a well-loved family photo album and the dignity of a printed biography. Every element should feel like it has aged gracefully — not trendy, not dated, but timeless.

The emotional response is intimate and reverent. This is not a social media feed or a content platform; it is a quiet room where a family's history lives. The UI should get out of the way and let the words and images breathe.

## Colors

The palette is drawn from natural materials: aged paper, walnut ink, oxidized gold, and jade ink stones.

- **Primary (#2C2419):** Deep walnut ink — for headlines, chapter titles, and primary text. Evokes the gravitas of a typeset book.
- **Secondary (#8B7355):** Aged brass — for interactive elements, annotations, and subtle highlights. Warm without being flashy.
- **Tertiary (#5A7A6A):** Muted jade — exclusively for annotation UI and collaborative features. Distinguishes "other voices" from the primary memoir text.
- **Background (#F5F0E8):** Warm parchment — the foundation. Not white; it should feel like heavy cotton paper under soft light.
- **Surface (#FAF7F2):** Slightly brighter paper — for cards, sidebar, and elevated elements. Creates subtle depth without shadows.
- **Surface Variant (#EDE8DD):** For annotation backgrounds, alternating rows, and secondary containers.

## Typography

The type system pairs a refined serif for display with a warm sans-serif for body text.

- **Cormorant Garamond:** Used for all display and headline text. Its high contrast and classical proportions evoke literary publishing. Use at weights 400 (Regular) and 500 (Medium) only.
- **Source Sans 3:** Used for all body text, UI labels, and annotations. Chosen for its excellent Vietnamese character support and warm, humanist construction.
- **Inter:** Used for small labels, buttons, and UI chrome. Clean and legible at small sizes.

### Scale & Hierarchy

- **Display (3.5rem):** Chapter titles, hero moments. Use sparingly.
- **Headline (1.5–2rem):** Section headers, photo captions.
- **Body (1–1.125rem):** Memoir text at 1.125rem for comfortable long-form reading. UI text at 1rem.
- **Label (0.75–0.875rem):** Navigation, metadata, timestamps. Always uppercase tracking for small labels.

### Editorial Treatment

- Memoir text should have generous line-height (1.7) and comfortable margins.
- Vietnamese text inherits the same font stack; Source Sans 3 handles diacritics beautifully.
- Editorial quotes (pull quotes) use Cormorant Garamond Italic at 1.25rem.

## Layout & Spacing

The layout is content-first and reading-optimized.

- **Content Max Width:** 720px — the optimal line length for reading. Centered with generous side margins.
- **Sidebar:** 280px fixed width on desktop, slide-in drawer on mobile. Contains chapter navigation and annotation filters.
- **Base Grid:** 4px unit for precision, 8px for standard spacing.
- **Section Rhythm:** 48px between major sections, 24px between related elements.

### Responsive Behavior

- **Desktop (>1024px):** Sidebar visible, content centered with max-width.
- **Tablet (768–1024px):** Sidebar collapses to icon rail, content expands.
- **Mobile (<768px):** Sidebar becomes slide-in drawer, content full-width with comfortable padding.

## Elevation & Depth

Depth is achieved through paper-like layering, not shadows.

- **Level 1 (Base):** Background parchment.
- **Level 2 (Surface):** Slightly brighter paper for cards and sidebar.
- **Level 3 (Elevated):** White surface for modals and dropdowns, with a subtle 1px border.

Shadows are used sparingly and softly:
- **Card shadow:** `0 1px 3px rgba(44, 36, 25, 0.08)` — barely perceptible.
- **Hover shadow:** `0 4px 12px rgba(44, 36, 25, 0.12)` — gentle lift.
- **Modal shadow:** `0 8px 32px rgba(44, 36, 25, 0.15)` — clear elevation.

## Shapes

The shape language is restrained and book-like.

- **Cards & Containers:** 8px rounded corners — soft but not playful.
- **Buttons:** 4px rounded corners — crisp and actionable.
- **Avatars & Badges:** Fully rounded (9999px) for human elements.
- **Images:** 4px rounded corners with a subtle 1px border, mimicking a mounted photograph.

## Components

### Memoir Reader

The core reading experience. Text is set in Source Sans 3 at 1.125rem with 1.7 line-height. Paragraphs have 1.5em margin-bottom. Chapter titles use Display Large with a thin rule (1px, outline-variant) beneath.

### Annotation System

Annotations appear as subtle margin notes on desktop, inline on mobile. Each annotation has a left border in tertiary (jade) color. Private annotations use secondary (brass) color. The Chorus (shared annotations) uses a purple tint.

### Photo Gallery

Photos are presented in a masonry or grid layout with the "photo-frame" treatment: white background, subtle border, 4px rounded corners. On hover, a gentle shadow lifts the frame. Captions use Body Small in on-surface-variant.

### Timeline Navigation

A vertical timeline in the sidebar showing chapters and key life events. Active chapter is highlighted with primary-container background. Each node has a small dot (8px) connected by a 1px line.

### Authentication

Minimal and unobtrusive. A simple modal with input fields and primary button. No social login buttons — this is a private family archive.

## Do's and Don'ts

### Do
- Use generous whitespace. Let the content breathe.
- Respect the 720px content width for reading passages.
- Use the secondary (brass) color for all interactive hover states.
- Ensure all text meets WCAG AA contrast against parchment backgrounds.
- Use Cormorant Garamond for any text larger than 1.5rem.

### Don't
- Use pure white (#FFFFFF) for backgrounds — always use the warm parchment tones.
- Apply heavy shadows or gradients — this is paper, not glass.
- Use playful animations or bouncy transitions — keep movements subtle and dignified.
- Crowd the layout with too many UI elements — prioritize the memoir text and photos.
- Use fonts other than Cormorant Garamond, Source Sans 3, and Inter.
