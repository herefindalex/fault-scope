import { isLanguage, type Language } from "./case";

export type LanguageResolution = {
  language: Language;
  prompt: boolean;
  source: "url" | "saved" | "default";
};

export function resolveLanguage(
  urlValue: string | null,
  savedValue: string | null,
): LanguageResolution {
  if (isLanguage(urlValue))
    return { language: urlValue, prompt: false, source: "url" };
  if (isLanguage(savedValue))
    return { language: savedValue, prompt: false, source: "saved" };
  return { language: "go", prompt: true, source: "default" };
}
