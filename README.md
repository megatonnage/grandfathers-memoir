# Grandfather's Memoir — Five-Layer Archive

A multi-temporal digital edition of my grandfather's memoirs, featuring original Vietnamese text, English translation, personal reflections, family contributions, and speculative responses from future descendants.

## The Five Layers

1. **Original** — Grandfather's Vietnamese text (historical document)
2. **Bridge** — Literal English translation (fidelity)
3. **Witness** — Personal response and reflection (intimacy)
4. **Chorus** — Family contributions and corrections (community)
5. **Futures** — Voices from descendants unborn (speculation)

## Development

```bash
npm install
npm run dev
```

## Content Structure

Chapters live in `chapters/` with five layer files each:
- `layer-1-original.md` — Vietnamese text
- `layer-2-translation.md` — English translation
- `layer-3-witness.md` — Personal reflection
- `layer-4-chorus.json` — Family responses
- `layer-5-futures.json` — Future descendant voices

## Deployment

Built for static export. Configure `output: 'export'` in `next.config.js` for deployment to any static host.

