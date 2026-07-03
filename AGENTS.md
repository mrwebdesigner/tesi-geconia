# AGENTS.md — tesi-geconia

Guida per agenti che lavorano su questo repository.

## Cos'è il progetto

**Geconia** è un sito web per un percorso espositivo con 12 **caselle** numerate (`01`–`12`). Ogni casella ha un'illustrazione SVG; alcune espongono anche un'esperienza **AR** (realtà aumentata via fotocamera) con MindAR + A-Frame.

- **Homepage** (`/`): tutte le caselle in colonna, ciascuna in un box con sfondo `colore` da `dati.json`, pulsanti mappa (tutte) e AR (solo `hasAr`).
- **Pagine AR** (`/{id}/`): solo per le caselle con asset AR completi; esperienza a schermo intero con `ActionButton` per tornare alla home.

Il contenuto editoriale vive in `src/lib/caselle/`. Il codice applicativo in `src/routes/` e `src/lib/`.

---

## Stack tecnico

| Aspetto | Scelta |
|---------|--------|
| Framework | SvelteKit 2 + Svelte 5 (runes) |
| Linguaggio | TypeScript |
| Styling | Tailwind CSS v4 (`src/routes/layout.css`) |
| Build / deploy | Vite 8 + `@sveltejs/adapter-static` (sito statico pre-renderizzato); pubblicazione su **GitHub Pages** via Actions |
| AR | A-Frame 1.6.0 + MindAR 1.2.5 (script CDN, non npm) |
| Package manager | npm |
| Qualità | Prettier, ESLint, svelte-check, Vitest, Playwright |

---

## Struttura del repository

```
src/
├── routes/
│   ├── +layout.svelte      # layout globale (favicon, children)
│   ├── +layout.ts          # prerender + trailingSlash (sito statico per GitHub Pages)
│   ├── +page.svelte        # homepage: caselle in box colorati + pulsanti
│   ├── layout.css          # entry Tailwind
│   └── [casella]/
│       ├── +page.ts        # load, entries() per prerender, 404 se no AR
│       └── +page.svelte    # pagina AR + ActionButton home
│
├── lib/
│   ├── caselle/
│   │   ├── caselle.ts      # layer dati: import.meta.glob + dati.json → tipo Casella
│   │   ├── dati.json       # metadati per casella (colore, mappa, mappaEmbed)
│   │   ├── 01/ … 12/       # cartelle contenuto (vedi sotto)
│   │   └── colori/         # riferimento design, non usato dal codice
│   ├── components/
│   │   ├── ActionButton.svelte  # pulsante rotondo condiviso (link o button)
│   │   ├── ArViewer.svelte      # scena MindAR (montaggio imperativo in onMount)
│   │   └── MappaDialog.svelte   # dialog desktop con iframe Google Maps
│   ├── load-script.ts      # caricamento script CDN con cache
│   ├── teardown-ar.ts      # cleanup AR alla navigazione SPA
│   └── vitest-examples/    # boilerplate di test, ignorare per il dominio
│
└── app.html / app.d.ts

vite.config.ts              # sveltekit(): adapter-static, paths.base, assetsInclude per *.mind
static/.nojekyll            # evita interferenza Jekyll su GitHub Pages
.github/workflows/deploy.yml  # build + deploy su push a main
build/                      # output produzione (adapter-static)
@old/                       # versione precedente HTML statico (solo riferimento)
```

---

## Modello dati: le caselle

### Cartella contenuto (`src/lib/caselle/{id}/`)

Ogni casella è una cartella con id a due cifre (`01`, `02`, …).

| File | Obbligatorio | Ruolo |
|------|:---:|-------|
| `casella.svg` | sì | Illustrazione mostrata in homepage |
| `targets.mind` | no | Target MindAR per il riconoscimento immagine |
| `immagine-comparsa.png` o `.jpg` | no | Overlay AR che appare sul target |
| `index.html` | — | **Legacy** dall'implementazione precedente; la logica AR è in `ArViewer.svelte` |

### Due tipi di casella

| Tipo | Criterio | Comportamento homepage |
|------|----------|------------------------|
| **Solo homepage** | solo `casella.svg` | Box colorato + pulsante mappa |
| **Con AR** | `targets.mind` **e** `immagine-comparsa` presenti | Box colorato + pulsante mappa + pulsante freccia → `/{id}/` |

**Inventario attuale (AR):** `01`, `02`, `03`, `04`, `06`, `07`, `11`, `12`  
**Solo SVG:** `05`, `08`, `09`, `10`

`hasAr` in `caselle.ts` è `true` solo se **entrambi** gli asset AR esistono.

### `dati.json`

Metadati per tutte e 12 le caselle: `colore` (hex sfondo homepage), `mappa` (URL Google Maps short link), `mappaEmbed` (URL iframe per il dialog desktop). Integrato in `caselle.ts` e usato dalla homepage.

**Mappa in homepage:** su mobile (`max-width: 768px`) apre `mappa` in nuova scheda/app; su desktop apre `MappaDialog` con `mappaEmbed`.

### Layer dati (`src/lib/caselle/caselle.ts`)

Scopre i file con `import.meta.glob` (eager, `?url`) e arricchisce con `dati.json`. API esposta:

- `getAllCaselle()` — tutte, ordinate numericamente
- `getArCaselle()` — solo con AR
- `getCasella(id)` — lookup singolo
- tipo `Casella`: `{ id, svgUrl, colore, mappa, mappaEmbed, targetsUrl?, overlayUrl?, hasAr }`

**Per aggiungere una nuova casella:** creare `src/lib/caselle/13/` con i file necessari e aggiungere la voce in `dati.json` (`colore`, `mappa`, `mappaEmbed`). Non serve modificare il codice se rispetti le convenzioni di naming. Per abilitare AR servono entrambi `targets.mind` e `immagine-comparsa.*`.

---

## Routing

| URL | File | Note |
|-----|------|------|
| `/` | `+page.svelte` | Caselle in box colorati (`max-w-2xl`), pulsanti mappa/AR |
| `/01/` … `/12/` | `[casella]/+page.svelte` | Solo le caselle AR sono pre-renderizzate; le altre restituiscono 404 |

`[casella]/+page.ts` esporta `entries()` da `getArCaselle()` per il prerender statico.

`+layout.ts` imposta `trailingSlash: 'always'` così le pagine prerenderizzate diventano cartelle con `index.html` (es. `build/01/index.html`), compatibili con GitHub Pages.

I link interni usano `base` da `$app/paths` (es. `href="{base}/{casella.id}/"`), non path assoluti dalla root del dominio.

---

## Deploy (GitHub Pages)

Il sito è pubblicato su GitHub Pages come **project site** sotto `/tesi-geconia/`:

`https://mrwebdesigner.github.io/tesi-geconia/`

### Configurazione

- **`vite.config.ts`**: opzioni SvelteKit passate al plugin `sveltekit()` (non esiste `svelte.config.js`).
  - `adapter-static` con `fallback: '404.html'` (pagina 404 custom su GitHub Pages).
  - `paths.base`: vuoto in dev (`vite dev`), valorizzato in build da `BASE_PATH`.
- **CI** (`.github/workflows/deploy.yml`): su push a `main`, build con `BASE_PATH=/${{ github.event.repository.name }}` e deploy via `actions/deploy-pages` (Node 24, `deploy-pages@v5`).
- **`static/.nojekyll`**: copiato in `build/`; impedisce a Jekyll di processare `_app/`.

### Build locale con base path di produzione

```sh
BASE_PATH=/tesi-geconia npm run build && npm run preview
```

Su GitHub: **Settings → Pages → Source: GitHub Actions**.

---

## AR: aspetti critici

L'AR **non** è un componente Svelte dichiarativo. MindAR/A-Frame usano custom element e iniettano video/canvas/overlay nel DOM.

### `ArViewer.svelte`

- Monta la scena in `onMount` via `innerHTML` (eslint disabilitato con commento mirato).
- Attributo `embedded` su `<a-scene>`: tiene video e UI dentro il contenitore (necessario in SPA).
- Contenitore `position: fixed; inset: 0` per schermo intero.
- Script CDN: A-Frame 1.6.0, MindAR 1.2.5.
- Componente custom `fade-in-on-found`: fade dell'overlay al `targetFound`.

### Cleanup SPA (`teardown-ar.ts`)

Alla navigazione client-side **obbligatorio** fermare MindAR, i track video, rimuovere overlay `.mindar-ui-*` dal `body` e distruggere la scena. Senza cleanup restano overlay di scansione e fotocamera attiva sopra il sito.

`ArViewer` restituisce una funzione di cleanup da `onMount` che chiama `teardownAr(container)`.

### Vite

`vite.config.ts` include `assetsInclude: ['**/*.mind']` perché i file `.mind` non sono asset standard. Adapter e `paths.base` sono configurati nello stesso file tramite `sveltekit()`.

### Test AR

Richiede dispositivo con fotocamera (o emulazione). Non testabile in modo significativo in CI headless.

---

## Convenzioni di codice

- **Svelte 5 runes** obbligatori nel progetto (`$props`, `$state`, ecc.).
- **Tailwind** per lo styling; evitare CSS custom salvo casi speciali (es. AR viewer).
- **Minimizzare lo scope**: riusare `caselle.ts` per dati, `ActionButton.svelte` per i pulsanti UI condivisi, non duplicare glob altrove.
- **Link interni**: usare `base` da `$app/paths` per href verso route dell'app (il sito non è servito dalla root del dominio in produzione).
- I file in `src/lib/caselle/*/index.html` sono riferimento storico — non aggiornarli come sorgente di verità.

---

## Comandi utili

```sh
npm run dev                              # sviluppo locale (base path vuoto)
npm run build                            # build statica → build/ (senza base path)
BASE_PATH=/tesi-geconia npm run build    # build come in CI per GitHub Pages
npm run preview                          # anteprima build
npm run check                            # typecheck Svelte + TS
npm run lint                             # prettier + eslint
npm run test                             # vitest + playwright
```

---

## Svelte MCP

Usa il server MCP Svelte per documentazione e validazione componenti.

### 1. list-sections

Primo passo per trovare sezioni di documentazione Svelte/SvelteKit rilevanti.

### 2. get-documentation

Recupera il contenuto delle sezioni individuate. Analizza `use_cases` prima di chiamare.

### 3. svelte-autofixer

**Obbligatorio** prima di finalizzare qualsiasi file `.svelte`. Ripetere finché non ci sono issue o suggestion.

### 4. playground-link

Solo su richiesta esplicita dell'utente, e **mai** se il codice è già stato scritto nei file del progetto.

---

## Cose da non fare

- Non committare senza richiesta esplicita.
- Non modificare `AGENTS.md` o il piano in `.cursor/plans/` se non richiesto.
- Non usare markup A-Frame diretto nel template Svelte senza gestire cleanup e `embedded`.
- Non assumere che tutte le caselle abbiano AR: verificare `hasAr` o `getArCaselle()`.
- Non ignorare `teardownAr` quando si tocca il ciclo di vita di `ArViewer`.
- Non usare href assoluti dalla root (es. `href="/01"`) per navigazione interna: usare `base` da `$app/paths`.
