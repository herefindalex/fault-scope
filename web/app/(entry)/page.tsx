import { LocaleEntry } from "../../components/LocaleEntry";
import { publicLocales } from "../../i18n/locale";

export default function EntryPage() {
  return (
    <main className="page-wrap locale-entry">
      <h1>Faultscope</h1>
      <p>Choose your human language. You can choose a code lens separately.</p>
      <LocaleEntry />
      <ul>
        {publicLocales.map((item) => (
          <li key={item.id}>
            <a href={`/${item.id}/`} lang={item.id}>
              {item.nativeName}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
