---
name: Confluence
colors:
  surface: '#faf9f8'
  surface-dim: '#dadad9'
  surface-bright: '#faf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f2'
  surface-container: '#eeeeed'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e1'
  on-surface: '#1a1c1c'
  on-surface-variant: '#414848'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f0f0'
  outline: '#727878'
  outline-variant: '#c1c8c7'
  surface-tint: '#476363'
  primary: '#032121'
  on-primary: '#ffffff'
  primary-container: '#1a3636'
  on-primary-container: '#829f9f'
  inverse-primary: '#aecccc'
  secondary: '#4f625c'
  on-secondary: '#ffffff'
  secondary-container: '#cfe4dc'
  on-secondary-container: '#536760'
  tertiary: '#2b1901'
  on-tertiary: '#ffffff'
  tertiary-container: '#432d11'
  on-tertiary-container: '#b4946f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cae8e8'
  primary-fixed-dim: '#aecccc'
  on-primary-fixed: '#022020'
  on-primary-fixed-variant: '#304b4b'
  secondary-fixed: '#d2e7df'
  secondary-fixed-dim: '#b6cbc3'
  on-secondary-fixed: '#0c1f1a'
  on-secondary-fixed-variant: '#384b45'
  tertiary-fixed: '#ffddb7'
  tertiary-fixed-dim: '#e4c199'
  on-tertiary-fixed: '#2a1801'
  on-tertiary-fixed-variant: '#5a4224'
  background: '#faf9f8'
  on-background: '#1a1c1c'
  surface-variant: '#e3e2e1'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-md:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  label-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  button:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max-width: 720px
  gutter: 24px
  margin-mobile: 20px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system is built for intentionality, favoring depth over speed. The personality is "Quietly Intellectual," drawing inspiration from high-end editorial publications and premium developer tools. It rejects the frantic energy of traditional social media in favor of a "Slow-UI" philosophy.

The style is **Modern Editorial**. It combines the structured precision of minimalist productivity software with the warmth and typographic richness of a literary journal. Key principles include:
- **Generous Negative Space:** Every element must breathe. Whitespace is used as a functional tool to reduce cognitive load.
- **Intentional Friction:** Layouts encourage reading and reflection rather than rapid scrolling.
- **Abstract Representation:** To keep the focus on discourse, the system utilizes geometric abstraction rather than representational imagery.

## Colors
The palette is rooted in organic, earthy tones that evoke the feeling of a physical library or a quiet study.

- **Background & Surface:** The foundation is a warm parchment (#FDFCFB). Avoid pure white (#FFFFFF) to reduce eye strain during long-form reading.
- **Primary (Deep Teal):** Used for primary actions, text headers, and structural elements. It conveys authority and stability.
- **Secondary (Muted Sage):** Used for supportive UI elements and secondary containers.
- **Accent (Subdued Gold/Clay):** Reserved for subtle highlights, progress indicators, or "moment of insight" markers. Use sparingly to maintain the quiet tone.

## Typography
This design system employs a dual-font strategy to balance intellectual weight with functional clarity.

- **Serif (Source Serif 4):** Used for all narrative content, headlines, and quotes. It provides the "Editorial" feel. The line height for body text is intentionally loose (approx 1.55x) to facilitate deep reading.
- **Sans-Serif (Geist):** Used for functional UI "chrome"—labels, buttons, metadata, and inputs. It provides a technical, modern precision.
- **Scale:** Larger display sizes should use tighter letter spacing, while small UI labels should use increased letter spacing to ensure legibility on parchment backgrounds.

## Layout & Spacing
The layout follows a **Fixed-Width Column** model for content-heavy screens, mimicking the width of a book page or an editorial column to optimize for the "ideal line length" (60-75 characters).

- **Grid:** On desktop, center the primary content column (720px). Use a 12-column grid only for complex dashboard views; otherwise, rely on vertical stacks.
- **Rhythm:** Use a 4px baseline grid. Spacing between sections should be aggressive (48px+) to signify a transition in thought.
- **Mobile:** Transition to a fluid single-column with 20px side margins. Elements should never feel "cramped" against the screen edge.

## Elevation & Depth
Depth is achieved through **Tonal Layering** and **Low-Contrast Outlines** rather than aggressive shadows.

- **Layers:** Use subtle shifts in background color (e.g., from parchment to a slightly cooler cream) to define card areas.
- **Borders:** Use 1px solid borders in a very faint version of the primary teal (opacity 10-15%) to define boundaries without adding visual weight.
- **Shadows:** If used, they must be "Ambient Shadows"—extremely diffused, with a large blur radius and very low opacity (3-5%), acting more like a soft glow than a drop shadow.

## Shapes
The shape language is **Refined and Soft**.

- **Corners:** Use a consistent 0.25rem (4px) radius for most UI components (buttons, inputs). This creates a sense of "tailored" precision that avoids the playfulness of hyper-rounded corners while remaining more approachable than sharp 0px edges.
- **Abstract Avatars:** These should be the only purely geometric "perfect" shapes—circles, hexagons, or intersecting paths. They function as a user's digital "sigil."

## Components
- **Buttons:**
    - **Primary:** Solid #1A3636 with parchment text. High contrast, signaling the "one primary action."
    - **Secondary:** Transparent background with a 1px border or text-only.
- **Inputs:** Minimalist approach. Use a single bottom-border (underline style) for text entry to evoke the feeling of writing on lined paper. Labels should use the Sans-Serif font in uppercase.
- **Abstract Avatars:** Instead of photos, generate a unique geometric composition for each user using the secondary and tertiary color palette. No human features allowed.
- **Cards:** Use a "Surface" color slightly darker than the background with no shadow. Use a 1px subtle border.
- **Progress Indicators:** Use thin, horizontal lines (2px height). The "unfilled" portion should be 10% opacity of the primary color; the "filled" portion should be the Subdued Gold accent.
- **Lists:** High vertical padding between list items (16px+) to ensure each entry feels like a distinct thought.
