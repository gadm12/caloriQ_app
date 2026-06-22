---
name: Vitality Logic
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3c4a46'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6b7a76'
  outline-variant: '#bacac5'
  surface-tint: '#006b5f'
  primary: '#006b5f'
  on-primary: '#ffffff'
  primary-container: '#2dd4bf'
  on-primary-container: '#00574d'
  inverse-primary: '#3cddc7'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#855300'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffad3a'
  on-tertiary-container: '#6d4400'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#62fae3'
  primary-fixed-dim: '#3cddc7'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  stats-number:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1200px
  gutter: 20px
---

## Brand & Style

The design system is built on the pillars of **Vitality, Transparency, and Accessibility**. It targets health-conscious individuals who seek a high-performance tool without the friction of subscription walls. The brand personality is "The Expert Companion"—knowledgeable and professional, yet encouraging and energetic.

The visual style is **Corporate Modern with a Tactile edge**. It leverages a clean, systematic structure to organize dense nutritional data while using vibrant color accents and soft shadows to maintain a friendly, approachable feel. The aesthetic avoids the austerity of medical apps, instead opting for a fresh, "farm-to-table" digital experience that celebrates food and health.

## Colors

The palette is anchored by **Emerald Green** and **Teal**, evoking growth and clinical precision. 
- **Primary (Vibrant Teal):** Used for primary actions, progress indicators, and active states.
- **Secondary (Deep Teal):** Used for navigation elements and secondary buttons to provide grounding contrast.
- **Accent (Energy Amber):** Reserved for highlights, warnings, or energy-related data points (e.g., exceeding a daily limit).
- **Neutral (Slate):** A sophisticated range of grays used for typography and UI borders to maintain a professional, high-end feel.
- **Backgrounds:** A crisp off-white (`#F8FAFC`) is used for the base layer, with pure white cards sitting on top to create subtle depth.

## Typography

This design system utilizes a dual-font strategy to balance personality with utility. 
- **Plus Jakarta Sans** is the display face, chosen for its friendly, modern, and slightly rounded terminals which provide an optimistic tone for headlines and numerical data.
- **Inter** is the workhorse for body copy and nutritional labels, ensuring maximum legibility at small sizes and high-density data tables.

Numerical data should always use `stats-number` to ensure weight consistency. Use `label-md` for categorical headers (e.g., "MACRONUTRIENTS") to create clear structural hierarchy.

## Layout & Spacing

The layout follows a **8px soft-grid system** to ensure mathematical harmony across all components.
- **Desktop:** 12-column fluid grid with a 1200px max-width container. 
- **Mobile:** Single column with 16px side margins. 
- **Philosophy:** Content is grouped into logical "Card Clusters." Vertical spacing between major sections should be `xl` (48px), while spacing between items within a meal category should be `md` (16px).

Heavy use of whitespace is required to prevent the nutritional data from feeling overwhelming. All data visualizations (charts) should have a minimum of 24px internal padding from the card edge.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Soft Ambient Shadows**.
- **Level 0 (Base):** The off-white background surface.
- **Level 1 (Cards):** Pure white background with a very soft, diffused shadow (12% opacity Slate) and a 1px subtle border in a lighter gray.
- **Level 2 (Modals/Popovers):** Higher contrast shadows to indicate immediate priority.

This system avoids heavy black shadows, instead opting for shadows tinted with the brand's Slate color to maintain a clean, airy feel. Interactive elements like buttons should feel "lifted" on hover through a slight increase in shadow spread.

## Shapes

The design system uses a **Rounded** (0.5rem base) shape language. This softens the technical nature of data tracking and makes the app feel more "organic" and human. 
- Large containers (Meal Cards) should use `rounded-xl` (1.5rem).
- Small elements (Chips, Buttons) should use `rounded-lg` (1rem).
- Form inputs should remain at the base `rounded` (0.5rem) to maintain a sense of structural integrity.

## Components

### Buttons & Chips
- **Primary Button:** Solid Vibrant Teal with white text, bold weight.
- **Secondary Button:** Outlined Deep Teal, 1.5px border.
- **Chips:** Used for quick-tagging food (e.g., "High Protein," "Vegan"). Use light tinted backgrounds of the primary color with dark text.

### Progress & Data Visualization
- **Macro Donut:** Thick stroke-width (12px) with rounded caps. Use Primary Green (Protein), Soft Blue (Carbs), and Yellow (Fats).
- **Daily Progress Bar:** A thin secondary track (light gray) with a glowing primary fill to show calories remaining.

### Input Fields
- Use floating labels to save vertical space. Focus states must use a 2px Teal border.

### Meal Cards
- Each card should feature a large, clear typography for total calories at the top right. 
- Food entries within the card should be separated by thin, low-contrast dividers.

### The "Donate" Banner
- A persistent footer component.
- **Style:** A soft, warm background (Light Rose or Off-white) to differentiate it from the utilitarian app functions.
- **Icon:** A simple line-art heart in Primary Teal.
- **Typography:** Centered, using `body-md` with the "Donate" action styled as a text-link with an underline.