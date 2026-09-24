/**
 * Resolves the `@/*` TypeScript path alias (→ `src/*`) for plain Node execution.
 * Used by scripts/verify-catalog.ts so catalog invariants can be checked without a
 * bundler.
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./scripts/alias-hooks.mjs", pathToFileURL("./"));