# Bike Shop Workspace

- Use TypeScript and the Next.js App Router.
- Keep demo product data in `src/data`, domain models in `src/types`, and business logic in `src/lib`.
- Prefer small, focused React components and local state for the MVP.
- Keep compatibility rules understandable and independently testable.

## China-market bicycle catalog

- Real bicycles live in `src/data/catalog/` (one module per manufacturer) and are described by
  `src/types/catalog.ts`. Read `src/data/catalog/README.md` before adding records.
- Model identity is `brand + family + tier + trim + modelYear (+ generation)`. `Advanced`,
  `Advanced Pro` and `Advanced SL` are performance **tiers**, never families.
- Never fabricate a price, weight or specification. Unknown values are `null`. A number that
  exists but is unconfirmed goes in `referencePrice`, never in `price`.
- Every weight needs a `kind` (`complete-bike` / `bare-frame` / `unpainted-frame` / ...).
  A bare-frame weight is never a complete-bike weight.
- Prices keep their source currency (USD from the Winspace store stays USD); never convert.
- Framesets and complete bikes are separate `productType` values and are never merged.
- Products with the same name in different model years stay separate records.
- Search aliases (Chinese nicknames, abbreviations, common misspellings) are required per product
  and per family. `锐豹` must resolve to Pardus without creating a duplicate entry.
- Recommendable bicycles must carry a factory build so `用这辆车开始选配` loads real original
  parts instead of an empty frame.
- Run `npm run verify:catalog` and `npm run typecheck` after changing catalog data.
