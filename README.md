# Bike Shop

An interactive bicycle builder MVP. Select a frame, wheelset, and groupset to see a layered bike visualization, live pricing, weight, and compatibility feedback.

## Run locally

Install Node.js 20 or newer, then run:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Architecture

- `src/types/catalog.ts`: normalized China-market bicycle schema
- `src/data/catalog/`: **real** manufacturer catalog, one module per brand
- `src/lib/catalog/`: search, alias normalization, coverage stats, Workshop bridge
- `src/types/bike.ts`: Workshop (component) models
- `src/data/products.ts`: component catalogue (illustrative sample data)
- `src/lib/compatibility`: small rule-based compatibility engine
- `src/lib/pricing`: subtotal calculation
- `src/components`: visualizer, catalog explorer, data-quality report, build summary
- `src/app`: Next.js App Router shell

### Two separate data sets — do not confuse them

| | real catalog | part catalogue |
|---|---|---|
| Where | `src/data/catalog/` | `src/data/products.ts` |
| What | China-market bicycles | Workshop components |
| Quality | `official` / `verified` / `partial` | `demo` |

The bicycle catalog is manufacturer-backed: every price traces to the product page it
was read from, every weight carries the definition it was measured under, and anything
unconfirmed is `null`. See `src/data/catalog/README.md` before adding records.

## Verify

```bash
npm run verify:catalog   # catalog invariants: aliases resolve, no duplicate identities, weights have kinds
npm run typecheck
npm run lint
```

`verify:catalog` fails the build on a broken invariant, so a bad ingestion cannot land silently.

## Public URL

Live at **https://bikeshop1.vercel.app**

The `vercel` git remote (`Evanwang0405/bikeshop1`) is connected to Vercel. Push to it to
publish a new version:

```bash
git push origin main
git push vercel main
```

`origin` is the main GitHub repo (`Evanwang0405/bikeshop`); `vercel` is the deployed one.

## Data caveats

- Prices keep their **source currency**. Winspace quotes USD and is stored as USD; no
  conversion is applied anywhere.
- Where a manufacturer publishes no price, `price` is `null` — never estimated.
- "Structure-only" records exist for brands whose official sites are currently
  unreachable (Pardus, Camp). They carry taxonomy and search aliases only, are counted
  separately in the data-quality report, and are **not** included in product coverage.
- Product images are currently **hotlinked** from manufacturer CDNs. Re-host them before
  any commercial use.
