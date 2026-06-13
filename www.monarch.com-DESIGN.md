# Design System Inspired by Monarch

## 1. Visual Theme & Atmosphere

Monarch's design system embodies refined financial clarity through a warm, accessible visual language. The palette combines warm oranges with sophisticated neutrals, creating a sense of approachability without sacrificing professionalism. The typography emphasizes readability and trust through generous spacing and carefully weighted typefaces. The overall aesthetic is modern yet grounded, reflecting the brand's mission to simplify complex financial management into intuitive, visual experiences. Depth is minimal but purposeful, with subtle shadows creating delicate hierarchy. The design language prioritizes clear data visualization, intelligent use of color for categorical meaning, and smooth interactions that feel responsive and considered.

**Key Characteristics**
- Warm, inviting primary colors with sophisticated neutral foundations
- Data-driven visual hierarchy using color psychology
- Generous whitespace and breathing room throughout layouts
- Accessibility-first approach with clear contrast ratios
- Clean, minimal elevation system with restrained shadows
- Refined typography using distinctive font families for differentiation
- Highly legible at all scales with intentional weight variations

## 2. Color Palette & Roles

### Primary
- **Dark Charcoal** (`#22201D`): Primary text, headings, and core UI elements. Conveys trust and professionalism in the financial context.
- **Pure White** (`#FFFFFF`): Primary background for cards, containers, and primary interactive surfaces.

### Accent Colors
- **Monarch Orange** (`#F35B16`): Primary call-to-action elements, emphasis states, and brand accent. Used sparingly for maximum impact.
- **Warm Orange** (`#FF692D`): Secondary accent for hover states and elevated emphasis on primary actions.
- **Warm Beige Light** (`#FFE9DE`): Subtle background tint for orange-accented sections and soft emphasis.
- **Warm Beige Medium** (`#FFD7C4`): Enhanced background tint for layered orange sections.
- **Warm Beige Strong** (`#FFC9B1`): Deeper background tint for prominent orange-accented containers.

### Interactive
- **Navy Black** (`#000000`): Maximum contrast text for critical interactive elements and legal/footer text.
- **Gray Dark** (`#777573`): Secondary text, disabled states, and visual hierarchy de-emphasis.

### Neutral Scale
- **Border Gray** (`#DCD9D6`): Primary border color for inputs, cards, and subtle dividers. Used 496 times across the system.
- **Gray Medium** (`#CCCCCC`): Secondary borders and soft dividers between related elements.
- **Off-White Primary** (`#FEFCFB`): Soft background for subtle sections and light surfaces.
- **Off-White Secondary** (`#F6F5F3`): Enhanced off-white for layered sections.
- **Off-White Tertiary** (`#EFECEA`): Deepest neutral background for recessed areas.

### Surface & Borders
- **Border Stroke** (`#DCD9D6`): Default border color for form inputs, cards, and containers.
- **Border Light** (`#CCCCCC`): Lighter borders for secondary dividers and subtle lines.

### Semantic / Status
- **Warning Yellow** (`#FFBC0B`): Primary warning state indicator, used in alerts and notifications (66 instances).
- **Warning Yellow Accent** (`#FFC53D`): Secondary warning emphasis and hover states.
- **Error Red** (`#D64700`): Critical error and danger states requiring immediate attention.

## 3. Typography Rules

### Font Family
- **Primary Display Font**: Copernicus (serif), fallback stack: `'Copernicus', 'Georgia', 'Times New Roman', serif`
- **Primary UI Font**: ABC Oracle (sans-serif), fallback stack: `'ABC Oracle', 'Helvetica Neue', 'Arial', sans-serif`
- **Secondary/Utility Font**: Helvetica (sans-serif), fallback stack: `'Helvetica', 'Helvetica Neue', 'Arial', sans-serif`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display XL | Copernicus | `48px` | `350` | `57.6px` | `0px` | Page hero headlines and major sections |
| Display Large | Copernicus | `40px` | `350` | `48px` | `0px` | Main section headings, primary messaging |
| Display Medium | Copernicus | `32px` | `350` | `38.4px` | `0px` | Subsection headings and prominent callouts |
| Heading Medium | ABC Oracle | `20px` | `350` | `28px` | `0px` | Card titles and feature headings |
| Body Large | ABC Oracle | `18px` | `350` | `28px` | `0px` | List items and emphasized body text |
| Body Default | ABC Oracle | `15px` | `500` | `20px` | `0px` | Primary body copy, default reading text |
| Label | Helvetica | `16px` | `400` | `16px` | `0px` | Form labels and metadata |
| Link | ABC Oracle | `16px` | `400` | `24px` | `0px` | Navigation links and inline links |
| Caption | ABC Oracle | `14px` | `350` | `20px` | `0px` | Button text, badges, and small UI text |
| Code | Helvetica | `14px` | `400` | `20px` | `0px` | Code blocks and monospace display |

### Principles
- **Serif for Authority**: Copernicus (serif) reserves for display contexts where trust and permanence matter most — headlines, hero sections, and major messaging.
- **Sans-Serif for Clarity**: ABC Oracle and Helvetica ensure legibility in UI controls, body text, and data-dense contexts.
- **Weight Hierarchy**: Lower weights (`350`) create visual lightness in display sizes; heavier weights (`500`) anchor body text for sustained reading.
- **Generous Leading**: Line heights exceed font size by 1.5–2x to maximize readability and reduce cognitive load.
- **Semantic Sizing**: Each size exists for a reason; use the assigned role to maintain consistency across components and pages.

## 4. Component Stylings

### Buttons

#### Primary Button
- **Background**: `#22201D` (Dark Charcoal)
- **Text Color**: `#FFFFFF` (Pure White)
- **Font**: ABC Oracle, `16px`, weight `400`
- **Padding**: `8px 50px`
- **Border Radius**: `9999px`
- **Border**: None
- **Height**: Auto (minimum `36px`)
- **Line Height**: `24px`
- **Box Shadow**: None
- **Hover State**: Background `#FF692D` (Warm Orange), text remains white
- **Active State**: Background `#F35B16` (Monarch Orange)
- **Disabled State**: Background `#CCCCCC` (Gray Medium), text `#777573` (Gray Dark)

#### Secondary Button
- **Background**: `#FFFFFF` (Pure White)
- **Text Color**: `#22201D` (Dark Charcoal)
- **Font**: ABC Oracle, `16px`, weight `400`
- **Padding**: `8px 50px`
- **Border Radius**: `9999px`
- **Border**: None
- **Height**: Auto (minimum `36px`)
- **Line Height**: `24px`
- **Box Shadow**: None
- **Hover State**: Background `#FEFCFB` (Off-White Primary)
- **Active State**: Background `#F6F5F3` (Off-White Secondary)
- **Disabled State**: Background `#CCCCCC` (Gray Medium), text `#777573` (Gray Dark)

#### Ghost Button
- **Background**: Transparent
- **Text Color**: `#22201D` (Dark Charcoal)
- **Font**: ABC Oracle, `14px`, weight `350`
- **Padding**: `8px 12px`
- **Border Radius**: `9999px`
- **Border**: `1px solid #DCD9D6` (Border Gray)
- **Height**: `36px`
- **Line Height**: `20px`
- **Box Shadow**: `rgba(34, 32, 29, 0.05) 0px 1px 2px 0px`
- **Hover State**: Background `#FEFCFB` (Off-White Primary), border `#DCD9D6`
- **Active State**: Background `#F6F5F3` (Off-White Secondary)
- **Disabled State**: Border `#CCCCCC` (Gray Medium), text `#CCCCCC`

#### Icon Button
- **Background**: Transparent
- **Text Color**: `#22201D` (Dark Charcoal)
- **Font**: Helvetica, `16px`, weight `400`
- **Padding**: `0px`
- **Border Radius**: `0px`
- **Border**: None
- **Height**: `40px`
- **Width**: `40px`
- **Line Height**: `16px`
- **Box Shadow**: None
- **Hover State**: Background `#FEFCFB` (Off-White Primary), border radius `8px`
- **Active State**: Background `#F6F5F3` (Off-White Secondary)

### Cards & Containers

#### Card Default
- **Background**: `#FFFFFF` (Pure White)
- **Border**: `1px solid #DCD9D6` (Border Gray)
- **Border Radius**: `12px`
- **Padding**: `24px`
- **Box Shadow**: `rgba(34, 32, 29, 0.1) 0px 10px 15px -3px, rgba(34, 32, 29, 0.1) 0px 4px 6px -4px`
- **Text Color**: `#22201D` (Dark Charcoal)

#### Card Elevated
- **Background**: `#FFFFFF` (Pure White)
- **Border**: `1px solid rgba(34, 32, 27, 0.075)`
- **Border Radius**: `12px`
- **Padding**: `24px`
- **Box Shadow**: `rgba(34, 32, 29, 0.1) 0px 20px 25px -5px, rgba(34, 32, 29, 0.1) 0px 8px 10px -6px`
- **Text Color**: `#22201D` (Dark Charcoal)

#### Card Accent (Orange)
- **Background**: `#FFE9DE` (Warm Beige Light)
- **Border**: None
- **Border Radius**: `12px`
- **Padding**: `24px`
- **Box Shadow**: None
- **Text Color**: `#22201D` (Dark Charcoal)
- **Accent Border Left**: `4px solid #F35B16` (Monarch Orange)

### Inputs & Forms

#### Input Text Default
- **Background**: `#FFFFFF` (Pure White)
- **Border**: `1px solid #DCD9D6` (Border Gray)
- **Border Radius**: `8px`
- **Padding**: `12px 16px`
- **Font**: ABC Oracle, `15px`, weight `500`
- **Text Color**: `#22201D` (Dark Charcoal)
- **Placeholder Color**: `#CCCCCC` (Gray Medium)
- **Height**: `40px`
- **Box Shadow**: `rgba(34, 32, 29, 0.05) 0px 1px 2px 0px`
- **Focus State**: Border `2px solid #F35B16` (Monarch Orange), box shadow `rgba(243, 91, 22, 0.1) 0px 0px 0px 3px`
- **Error State**: Border `2px solid #D64700` (Error Red), background `rgba(214, 71, 0, 0.05)`
- **Disabled State**: Background `#F6F5F3` (Off-White Secondary), text `#777573` (Gray Dark)

#### Input Label
- **Font**: Helvetica, `16px`, weight `400`
- **Color**: `#22201D` (Dark Charcoal)
- **Margin Bottom**: `8px`
- **Display**: Block

#### Input Helper Text
- **Font**: ABC Oracle, `14px`, weight `350`
- **Color**: `#777573` (Gray Dark)
- **Margin Top**: `4px`

#### Checkbox
- **Size**: `20px × 20px`
- **Border**: `2px solid #DCD9D6` (Border Gray)
- **Border Radius**: `4px`
- **Background Unchecked**: `#FFFFFF` (Pure White)
- **Background Checked**: `#F35B16` (Monarch Orange)
- **Checkmark Color**: `#FFFFFF` (Pure White)
- **Focus State**: Box shadow `rgba(243, 91, 22, 0.1) 0px 0px 0px 3px`

### Navigation

#### Navigation Bar
- **Background**: `#FFFFFF` (Pure White)
- **Border Bottom**: `1px solid #DCD9D6` (Border Gray)
- **Height**: `64px`
- **Padding**: `0px 32px`
- **Align Items**: Center

#### Navigation Link Default
- **Font**: ABC Oracle, `16px`, weight `400`
- **Color**: `#22201D` (Dark Charcoal)
- **Padding**: `8px 16px`
- **Border Radius**: `4px`
- **Text Decoration**: None
- **Hover State**: Background `#FEFCFB` (Off-White Primary)
- **Active State**: Color `#F35B16` (Monarch Orange), border bottom `2px solid #F35B16`

#### Navigation Link Dropdown
- **Font**: ABC Oracle, `16px`, weight `400`
- **Color**: `#22201D` (Dark Charcoal)
- **Padding**: `8px 16px`
- **Icon**: Chevron down, `12px`, color `#777573` (Gray Dark)
- **Hover State**: Background `#FEFCFB` (Off-White Primary)

#### Call-to-Action Link (Sign Up)
- **Background**: `#F35B16` (Monarch Orange)
- **Text Color**: `#FFFFFF` (Pure White)
- **Font**: ABC Oracle, `16px`, weight `400`
- **Padding**: `8px 24px`
- **Border Radius**: `9999px`
- **Height**: `36px`
- **Hover State**: Background `#FF692D` (Warm Orange)
- **Active State**: Background `#F35B16` (Monarch Orange)

### Badges

#### Badge Default
- **Background**: `#FEFCFB` (Off-White Primary)
- **Text Color**: `#22201D` (Dark Charcoal)
- **Font**: ABC Oracle, `14px`, weight `350`
- **Padding**: `4px 12px`
- **Border Radius**: `9999px`
- **Border**: `1px solid #DCD9D6` (Border Gray)

#### Badge Warning
- **Background**: `#FFBC0B` (Warning Yellow)
- **Text Color**: `#22201D` (Dark Charcoal)
- **Font**: ABC Oracle, `14px`, weight `350`
- **Padding**: `4px 12px`
- **Border Radius**: `9999px`

#### Badge Error
- **Background**: `#D64700` (Error Red)
- **Text Color**: `#FFFFFF` (Pure White)
- **Font**: ABC Oracle, `14px`, weight `350`
- **Padding**: `4px 12px`
- **Border Radius**: `9999px`

## 5. Layout Principles

### Spacing System

**Base Unit**: `4px`

**Scale**:
- `xs`: `4px` — Micro-spacing for text line adjustments and compact margins
- `sm`: `8px` — Small padding in buttons, tight component spacing
- `md`: `12px` — Standard padding for form inputs and small containers
- `lg`: `16px` — Default padding for most components and gutters
- `xl`: `24px` — Card padding and section spacing
- `2xl`: `32px` — Container padding and major layout divisions
- `3xl`: `40px` — Gap between related section groups
- `4xl`: `48px` — Large padding for card containers
- `5xl`: `64px` — Hero section padding and major whitespace
- `6xl`: `80px` — Gap between major page sections
- `7xl`: `96px` — Maximum padding for hero and full-width sections

### Grid & Container

- **Max Width**: `1200px` (desktop containers)
- **Column Strategy**: 12-column flexible grid for desktop; collapses to 6-column on tablet, single-column on mobile
- **Gutter**: `24px` between columns
- **Container Padding**: `32px` on desktop, `24px` on tablet, `16px` on mobile
- **Section Pattern**: Full-width backgrounds with contained content (max `1200px`) centered

### Whitespace Philosophy

Monarch prioritizes breathing room to reduce cognitive load and enhance data clarity. Spacing surrounds critical information, creating visual hierarchy through negative space. Margins between sections are generous (`40px` to `80px`), while internal component spacing is precise and consistent. This approach transforms dense financial data into scannable, understandable layouts. Whitespace is never wasted; it directs attention and creates visual rest points.

### Border Radius Scale

- `0px`: No radius — for minimal, utility-focused elements
- `4px`: Subtle radius — for minimal UI elements, small containers
- `8px`: Standard radius — for hover states, secondary buttons, hover backgrounds
- `12px`: Card radius — for cards, containers, and major content blocks
- `9999px`: Full radius — for buttons, badges, pills, and circular elements

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | No shadow | Input fields (default), text links, icon buttons, utility elements |
| Raised | `rgba(34, 32, 29, 0.05) 0px 1px 2px 0px` | Ghost buttons, secondary cards, form elements |
| Elevated | `rgba(34, 32, 29, 0.1) 0px 10px 15px -3px, rgba(34, 32, 29, 0.1) 0px 4px 6px -4px` | Cards with content, modals, hover states on interactive elements |
| High | `rgb(255, 255, 255) 0px 0px 0px 0px, rgba(34, 32, 27, 0.075) 0px 0px 0px 1px, rgba(34, 32, 29, 0.1) 0px 20px 25px -5px, rgba(34, 32, 29, 0.1) 0px 8px 10px -6px` | Modals, dropdowns, hero sections, elevated containers |

**Shadow Philosophy**: Shadows in Monarch are restrained and subtle, used sparingly to establish hierarchy without visual heaviness. Elevation is suggested through delicate shadow layering and border color shifts rather than aggressive drop shadows. The approach respects data visualization clarity, ensuring shadows do not compete with information-dense content. All shadows use `rgba(34, 32, 29, ...)` (dark charcoal with transparency) to maintain visual cohesion with the neutral palette.

## 7. Do's and Don'ts

### Do
- **Use Monarch Orange (`#F35B16`) for primary CTAs** — This color commands attention and signals user action.
- **Reserve Copernicus font for display contexts** — Use for page titles, section headings, and hero messaging where authority and permanence matter.
- **Apply generous padding (`24px` minimum) in cards** — Breathing room improves scannability and reduces cognitive load in financial contexts.
- **Implement subtle shadows (`Raised` level)** for form inputs and secondary elements — This maintains visual lightness while establishing hierarchy.
- **Use the neutral gray scale (`#DCD9D6` for borders, `#CCCCCC` for secondary dividers)** consistently — Repetition strengthens visual coherence.
- **Pair display sizes with lowercase text sparingly** — Uppercase or title case is more readable in financial contexts.
- **Test all link colors for WCAG AA contrast** — Ensure minimum 4.5:1 ratio for body text links.

### Don't
- **Don't overuse Monarch Orange** — Reserve it for primary actions and critical emphasis. Secondary elements should use neutral tones.
- **Don't mix serif and sans-serif in the same text block** — Use serif (Copernicus) for headlines, sans-serif (ABC Oracle) for body content.
- **Don't exceed 2 levels of shadow elevation on a single page** — Excessive layering creates visual clutter and dilutes hierarchy.
- **Don't use the Error Red (`#D64700`) for non-critical states** — Reserve it for genuine errors and destructive actions.
- **Don't apply padding asymmetrically** — Use the spacing scale consistently; asymmetric spacing confuses layout hierarchy.
- **Don't exceed 66 characters per line in body text** — Longer lines reduce readability; use `max-width: 700px` for body paragraphs.
- **Don't omit focus states on interactive elements** — All buttons, links, and inputs must have visible `:focus` styling for accessibility.
- **Don't use reduced opacity (`0.5` or lower) for interactive elements** — This creates accessibility issues; use color shifts instead.

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | `< 640px` | Single-column layout, full-width containers, `16px` padding, stacked navigation (hamburger menu), `32px` bottom spacing |
| Tablet | `640px - 1024px` | 2-column grid, `24px` padding, tabbed navigation items collapse to `12px` font, cards stack vertically |
| Desktop | `> 1024px` | 12-column grid, `32px` padding, full navigation bar visible, cards display in rows, max-width `1200px` applied |

### Touch Targets

- **Minimum Interactive Size**: `44px × 44px` (buttons, links, form controls) on mobile for comfortable touch interaction
- **Desktop Pointer Targets**: `36px × 36px` minimum for mouse interaction
- **Button Padding Mobile**: Increase to `12px 20px` (from `8px 50px` on desktop) to ensure adequate touch area
- **Link Spacing**: Ensure `8px` minimum gap between interactive elements to prevent accidental activation

### Collapsing Strategy

- **Navigation**: On mobile, primary navigation collapses into hamburger menu (`☰`); show only Home, Features, Pricing. Dropdown items display in modal overlay.
- **Cards**: Two-column layout on tablet collapses to single column on mobile; maintains `24px` gap between cards.
- **Typography**: Reduce display sizes by 20% on mobile: `h1` from `48px` to `32px`, `h2` from `40px` to `28px`, `h3` from `32px` to `24px`.
- **Sections**: Full-width sections retain background color but reduce internal padding from `64px` to `32px` on mobile.
- **Forms**: Multi-column form layouts stack to single column; maintain `12px` vertical spacing between fields.
- **Images**: Scale images to `100%` width on mobile with `max-width: 100%`; maintain aspect ratio.

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA**: Monarch Orange (`#F35B16`) — use for signup buttons, primary actions, and emphasis
- **Background**: Pure White (`#FFFFFF`) for cards; Off-White Primary (`#FEFCFB`) for subtle sections
- **Heading Text**: Dark Charcoal (`#22201D`) — primary text, maximizes contrast
- **Body Text**: Dark Charcoal (`#22201D`) for primary, Gray Dark (`#777573`) for secondary
- **Borders**: Border Gray (`#DCD9D6`) — default stroke for inputs, cards, dividers
- **Hover Accent**: Warm Orange (`#FF692D`) — secondary action state, hover CTA buttons
- **Warning**: Warning Yellow (`#FFBC0B`) — alerts, notifications, non-critical warnings
- **Error**: Error Red (`#D64700`) — validation errors, destructive actions, critical alerts
- **Disabled**: Gray Medium (`#CCCCCC`) — disabled buttons, form inputs in disabled state

### Iteration Guide

1. **Start with Neutral Palette**: Build layout structure using `#FFFFFF` backgrounds, `#DCD9D6` borders, and `#22201D` text. This creates clarity before adding accent color.

2. **Apply Typography Hierarchy Strictly**: Use `Copernicus` only for display (`h1`, `h2`, `h3`). Use `ABC Oracle` for all body, labels, links, and UI text. This maintains visual coherence.

3. **Use Orange Sparingly for Impact**: Apply `#F35B16` to exactly one primary action per section. Secondary or tertiary actions use neutral buttons or ghost variants.

4. **Respect the Spacing Scale**: Every margin and padding value must come from the approved scale (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `40px`, `48px`, `64px`, `80px`, `96px`). Never use custom values.

5. **Build Component Variants Consistently**: Each component (button, input, card, badge) must include default, hover, focus, active, and disabled states. Ensure all states meet WCAG AA contrast requirements.

6. **Establish Elevation Through Shadows, Not Opacity**: Use the shadow scale (`Raised`, `Elevated`, `High`) to create hierarchy. Avoid reducing opacity below `0.8` for interactive elements.

7. **Test Responsiveness Across Breakpoints**: Ensure layouts adapt gracefully at `640px`, `1024px`, and `1200px`. Mobile first: start at `< 640px`, then enhance for larger screens.

8. **Validate All Interactive States**: Every link, button, input, and form control must have explicit `:hover`, `:focus`, `:active`, and `:disabled` states with color, shadow, and layout properties.

9. **Use Color for Data Distinction, Not Decoration**: In dashboards and charts, extend the palette with semantic categories (e.g., light blue for income, light green for savings). Maintain contrast against white backgrounds.

10. **Document Component-Specific Exceptions**: If a component requires deviation from the standard palette or spacing, document the reason (e.g., "Error state requires `#D64700` for WCAG AAA contrast"). Treat exceptions as last resort.