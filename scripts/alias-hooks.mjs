import { pathToFileURL } from "node:url";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Add the extensions a bundler resolves implicitly (index.ts, .ts, .tsx) and map
 * `@/x` onto `src/x`, so the catalog modules load under plain Node.
 */
export async function resolve(specifier, context, nextResolve) {
  let absolute;
  if (specifier.startsWith("@/")) {
    absolute = path.join(process.cwd(), "src", specifier.slice(2));
  } else if (specifier.startsWith(".")) {
    absolute = path.resolve(path.dirname(new URL(context.parentURL).pathname.replace(/^\/([A-Za-z]:)/, "$1")), specifier);
  }

  if (absolute) {
    const candidates = [absolute, `${absolute}.ts`, `${absolute}.tsx`, path.join(absolute, "index.ts"), path.join(absolute, "index.tsx")];
    for (const candidate of candidates) {
      if (existsSync(candidate) && statSync(candidate).isFile()) {
        return nextResolve(pathToFileURL(candidate).href, context);
      }
    }
  }

  return nextResolve(specifier, context);
}