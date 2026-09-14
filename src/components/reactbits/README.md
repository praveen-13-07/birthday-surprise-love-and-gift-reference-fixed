# React Bits components

React Bits (reactbits.dev) isn't an installable npm package — you copy
individual component source files in as needed. This folder is where those
land, one subfolder per component, e.g.:

```
reactbits/
  TextReveal/
    TextReveal.jsx
    TextReveal.css
  ShinyText/
    ShinyText.jsx
```

Rules for adding one here (per the animation stack rules):

- Only copy in a component when it genuinely improves a specific moment
  (e.g. a text-reveal for the Love Letter, a subtle particle/shimmer for
  the Final Reveal) — not by default, and not "because it looks cool."
- Match it to the existing palette/typography in `styles/variables.css`
  rather than the demo's default styling.
- Keep it CSS transform/opacity based; if a React Bits component leans on
  heavy canvas/WebGL or large particle counts, prefer a lighter
  alternative or a CSS-only version instead.

Nothing is copied in yet — this folder is just the landing spot for when a
section genuinely needs one.
