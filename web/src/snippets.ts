import raw from "./generated/snippets.json";
import type { Language } from "./case";

export type Anchor =
  | "fs-c01.retry-independent-attempt"
  | "fs-c01.keep-unresolved"
  | "fs-c01.retry-same-logical-operation"
  | "fs-c01.retry-with-new-logical-operation";

const snippets = raw as Record<Anchor, Record<Language, string>>;

export function snippetFor(anchor: Anchor, language: Language): string {
  const snippet = snippets[anchor]?.[language];
  if (!snippet) throw new Error(`Missing ${anchor} in ${language}`);
  return snippet;
}
