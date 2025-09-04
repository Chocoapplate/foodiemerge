## Foodie Merge

A simple, cute-styled match-3 stacking game built with Vue 3 + TypeScript + Vite.


## Run locally

### Prerequisites
- Node.js 16+ (recommended 18+)
- npm (comes with Node). pnpm/yarn also work if you prefer.

### Install
```bash
npm install
```

### Start dev server
```bash
npm run dev
# Default: http://localhost:5173
```

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```


## Repository structure

```text
foodiemerge/
  index.html                # Vite HTML entry
  package.json              # Scripts & dependencies
  public/
    audio/                  # Game sounds (click, drop, win, lose, welcome)
    vite.svg                # Favicon
  src/
    App.vue                 # Main game UI & level flow
    main.ts                 # Vue bootstrap
    components/
      card.vue              # Single card component (renders an icon)
    core/
      useGame.ts            # Core game logic (selection, matching, win/lose)
      utils.ts              # Celebration/confetti helpers
    assets/
      Icons/                # Food icon set used by cards
    style.css               # Global styles (UnoCSS utilities also used)
    types/
      type.d.ts             # Shared TypeScript types
  vite.config.ts            # Vite config
  unocss.config.ts          # UnoCSS config
```


## Configure gameplay

### Difficulty and levels
Edit the `LevelConfig` array in `src/App.vue` to control each level:

```ts
const LevelConfig = [
  { cardNum: 2,  layerNum: 2, trap: false },  // Level 1 (tutorial)
  { cardNum: 5,  layerNum: 3, trap: false },
  { cardNum: 9,  layerNum: 3, trap: false },
  { cardNum: 10, layerNum: 4, trap: false },
  { cardNum: 12, layerNum: 5, trap: false },
  { cardNum: 15, layerNum: 6, trap: true  },  // Final level with traps
]
```

- cardNum: number of distinct card types in the level
- layerNum: depth/stacking layers (more layers → more cards blocked)
- trap: enables “trap mode” (some cards are removed at generation)

The total number of blocks roughly follows: total ≈ `cardNum × 3 × layerNum`.

### Icons & assets
- Card images are auto-loaded from `src/assets/Icons/*.png`.
- Sounds live in `public/audio/` and are referenced in `src/App.vue`.


## Scripts
- **dev**: start Vite dev server
- **build**: type-check and build
- **preview**: preview the production build locally

```bash
npm run dev
npm run build
npm run preview
```
