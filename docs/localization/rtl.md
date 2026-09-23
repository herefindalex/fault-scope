# RTL behavior

Arabic pages set `<html lang="ar" dir="rtl">` at build time. Navigation,
reasoning rail, choices, and dialogs follow RTL document flow. CSS uses
logical inline properties instead of physical left/right layout properties
where the direction matters. Directional step-navigation icons are reversed.

Source code remains `<pre dir="ltr">`, including on Arabic Code Lens pages.
Source examples are shared by every Human Locale; comments are not copied
into a 20 × 7 matrix. If a runtime fallback displays English inside RTL prose, bidirectional isolation keeps the sentence readable.

When reviewing Arabic, check the first-visit Code Lens dialog, locale
selector, Guided and Challenge steps, Deep Dive, Possible Worlds, timeline,
code toolbar, keyboard focus order, and narrow viewports. A visual check and
the binary smoke test cover some of this, but the current implementation
has **not completed an assistive-technology audit**. Beta translations still need native-speaker and technical review, even where direction is correct.

See [accessibility](../product/accessibility.md),
[translation guide](translation-guide.md), and
[quality policy](quality-policy.md).
