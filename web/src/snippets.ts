import raw from "./generated/snippets.json";
import type { Language } from "./case";

export type Anchor = keyof typeof raw;

const snippets = raw as Record<Anchor, Record<Language, string>>;

export function snippetFor(anchor: Anchor, language: Language): string {
  const snippet = snippets[anchor]?.[language];
  if (!snippet) throw new Error(`Missing ${anchor} in ${language}`);
  return snippet;
}
