# Accessibility

The current interface uses native buttons and selects for choices, mode tabs,
Human Locale, and Code Lens. Controls have labels or accessible names, answer
buttons expose pressed state, and feedback uses status announcements where the
interaction needs one. The Possible Worlds diagram also has text labels:
worlds and evidence are not identified by color alone.

Localized pages set the document `lang` and `dir`. Arabic pages use RTL layout;
source `pre` elements remain LTR. CSS uses logical inline properties for the
main layout and reverses directional navigation icons in RTL. The site honors
`prefers-reduced-motion` for its CSS animation and scrolling behavior.

Keyboard access follows native controls, including the Code Lens dialog's
focus management. This is an implementation description, **not a completed
screen-reader or WCAG audit**. Before calling a new locale reviewed, test its
labels, focus order, long strings, dialogs, diagrams, and code blocks with
keyboard and assistive technology. See [RTL checks](../localization/rtl.md)
and the [testing strategy](../testing/strategy.md).
