# Accessibility & WCAG Compliance Audit — Mindscaping

**Date:** 2026-09-12
**Auditor:** agent-Mindscaping
**Standard:** WCAG 2.1 AA
**Tools used:** axe-core (via @axe-core/react), manual code review

---

## Summary

- **Total issues found:** 18
- **Critical:** 3 | **Serious:** 6 | **Moderate:** 5 | **Minor:** 4
- **All issues documented here; none fixed per task instructions.**

---

## Critical Issues

### 1. Footer text contrast fails WCAG AA (1.4.3)
**File:** `components/layout/Footer.tsx:10-11`
**Issue:** Footer paragraph text uses `opacity-40` on `text-brand-offwhite` against `bg-brand-brown`. The effective contrast ratio of `#f0eeff` at 40% opacity on `#6b5b95` is approximately **2.1:1**, well below the 4.5:1 AA threshold for normal text.
**WCAG:** 1.4.3 Contrast (Minimum)
**Impact:** Low-vision users cannot read footer text.

### 2. Gallery lightbox not keyboard-accessible (2.1.1)
**File:** `components/sections/GallerySection.tsx:31-39`
**Issue:** Gallery images use `onClick` on a `<div>` without `tabIndex`, `role="button"`, or `onKeyDown` handler. The dialog is created via `innerHTML` with inline `onclick="event.stopPropagation()"`, which is not keyboard-accessible. Users cannot open or close the lightbox via keyboard.
**WCAG:** 2.1.1 Keyboard
**Impact:** Keyboard-only users cannot view full-size images.

### 3. No skip-to-content link (2.4.1)
**File:** `app/layout.tsx`
**Issue:** No skip navigation link exists. The `<main>` element has no `id` attribute. Screen reader and keyboard users must tab through the entire nav on every page load.
**WCAG:** 2.4.1 Bypass Blocks
**Impact:** Keyboard users experience significant navigation burden.

---

## Serious Issues

### 4. Decorative SVG not hidden from assistive tech (1.1.1)
**File:** `components/sections/Hero.tsx:59-67`
**Issue:** The decorative floral SVG circle in the Hero section lacks `aria-hidden="true"` and `role="presentation"`. Screen readers will attempt to parse and announce SVG content.
**WCAG:** 1.1.1 Non-text Content
**Impact:** Screen reader users hear meaningless SVG content.

### 5. FAQ buttons missing aria-controls (4.1.2)
**File:** `components/sections/FaqSection.tsx:36-51`
**Issue:** FAQ toggle buttons use `aria-expanded` but lack `aria-controls` pointing to the answer panel's `id`. Assistive tech cannot programmatically associate the button with its controlled region.
**WCAG:** 4.1.2 Name, Role, Value
**Impact:** Screen reader users may not understand the relationship between button and answer.

### 6. Emoji used as icons without accessible alternatives (1.1.1)
**Files:**
- `components/sections/ContactSection.tsx:23-49` — 💬, 🕐, 🗓️
- `components/sections/ProcessSection.tsx:8-10` — 📋, ✅, 🌿
- `components/sections/ApproachSection.tsx:6-9` — 🧩, 🎯, 🌀, 💻

**Issue:** Emoji characters are used as visual icons but have no `aria-label`, `role="img"`, or sr-only text alternative. Screen readers announce these as Unicode character names (e.g., "speech balloon"), which is confusing.
**WCAG:** 1.1.1 Non-text Content
**Impact:** Screen reader users hear unhelpful Unicode character names.

### 7. Mobile hamburger missing aria-expanded (4.1.2)
**File:** `components/layout/Nav.tsx:61-69`
**Issue:** The hamburger button toggles the mobile menu but lacks `aria-expanded` to communicate the open/closed state to assistive tech.
**WCAG:** 4.1.2 Name, Role, Value
**Impact:** Screen reader users don't know if the menu is open or closed.

### 8. ApproachSection link uses visual arrow character (1.3.1)
**File:** `components/sections/ApproachSection.tsx:34`
**Issue:** The "Get in touch to learn more →" link uses a right arrow Unicode character (→) which may be read aloud by some screen readers as "right arrow" or ignored, creating confusion.
**WCAG:** 1.3.1 Info and Relationships
**Impact:** Minor confusion for screen reader users.

### 9. ContactSection emoji icons lack text alternatives (1.1.1)
**File:** `components/sections/ContactSection.tsx:23-49`
**Issue:** The contact info rows use emoji (💬, 🕐, 🗓️) as visual icons inside circular divs. These are purely decorative but announced by screen readers. The adjacent `<strong>` elements provide context, but the emoji should be hidden.
**WCAG:** 1.1.1 Non-text Content
**Impact:** Screen readers announce irrelevant Unicode names before useful content.

---

## Moderate Issues

### 10. No focus-visible styles defined (2.4.7)
**File:** `styles/globals.css`
**Issue:** The global stylesheet does not define custom `:focus-visible` styles. The site relies on browser defaults, which may be invisible on some browsers or overridden by Tailwind's preflight.
**WCAG:** 2.4.7 Focus Visible
**Impact:** Keyboard users may not see which element is focused.

### 11. Hero section decorative circles not hidden (1.1.1)
**File:** `components/sections/Hero.tsx:25-26, 55-56`
**Issue:** Decorative gradient circles (absolute-positioned) lack `aria-hidden="true"`. While they're CSS-only (no text), some assistive tech may still traverse them.
**WCAG:** 1.1.1 Non-text Content
**Impact:** Minimal but inconsistent with best practices.

### 12. Testimonials use index as key (1.3.1)
**File:** `components/sections/TestimonialsSection.tsx:27`
**Issue:** `key={i}` (array index) is used instead of `t._id`. While not strictly an a11y issue, it can cause rendering issues that affect assistive tech state management.
**WCAG:** 1.3.1 Info and Relationships
**Impact:** Potential React rendering issues affecting AT state.

### 13. BookingForm date input has no max date constraint (3.3.2)
**File:** `components/sections/BookingForm.tsx:205`
**Issue:** The date input has `min` but no `max`. Users can theoretically select dates years in the future, which may create confusion.
**WCAG:** 3.3.2 Labels or Instructions
**Impact:** Minor UX issue for all users.

### 14. Blog page may lack heading hierarchy (1.3.1)
**File:** `app/blog/page.tsx`
**Issue:** Blog listing page structure not fully audited; may have heading skip issues depending on how posts are rendered.
**WCAG:** 1.3.1 Info and Relationships
**Impact:** Screen reader users may have difficulty navigating heading hierarchy.

---

## Minor Issues

### 15. ValuesSection decorative numbers not hidden (1.1.1)
**File:** `components/sections/ValuesSection.tsx:44`
**Issue:** Value numbers ("01"–"04") are rendered as large decorative text with `text-brand-brown/15` opacity. They could be marked `aria-hidden` since the title conveys the same information.
**WCAG:** 1.1.1 Non-text Content
**Impact:** Screen readers may announce numbers redundantly.

### 16. ProcessSection decorative step numbers (1.1.1)
**File:** `components/sections/ProcessSection.tsx:42-43`
**Issue:** Step numbers ("01"–"03") are decorative (absolute positioned, large, low opacity) but not hidden from assistive tech.
**WCAG:** 1.1.1 Non-text Content
**Impact:** Screen readers announce redundant step numbers.

### 17. BookingForm uses noValidate but doesn't provide custom validation summary (3.3.1)
**File:** `components/sections/BookingForm.tsx:123`
**Issue:** The form uses `noValidate` and custom client-side validation, but doesn't provide a validation summary at the top of the form for screen reader users. Errors are shown inline per field (which is good), but a summary at the top would improve the experience.
**WCAG:** 3.3.1 Error Identification
**Impact:** Screen reader users may miss errors below the fold.

### 18. Image alt text defaults may be generic (1.1.1)
**File:** `components/sections/GallerySection.tsx:43`
**Issue:** When no caption is provided, images get `alt="Gallery image"` which is generic and repeated for every uncaptioned image. Screen readers would hear "Gallery image, Gallery image, Gallery image..."
**WCAG:** 1.1.1 Non-text Content
**Impact:** Repetitive, non-descriptive alt text for screen readers.

---

## Positive Findings (things done well)

- ✅ Form fields have proper `<label>` associations
- ✅ Error messages use `role="alert"` for immediate announcement
- ✅ Error fields use `aria-invalid` and `aria-describedby`
- ✅ FAQ toggles use `aria-expanded`
- ✅ Nav hamburger has `aria-label="Menu"`
- ✅ External links (WhatsApp, Research) use `target="_blank"` with `rel="noopener noreferrer"`
- ✅ Semantic HTML used throughout (`<section>`, `<nav>`, `<main>`, `<footer>`)
- ✅ Heading hierarchy is generally correct (h1 → h2 → h3)
- ✅ Image elements use `alt` text
- ✅ `<html lang="en">` is set correctly
- ✅ Next.js Image component used for optimized images
- ✅ Booking form has accessible labels, error associations, and disabled states

---

## Recommendations (for future fixing)

1. **Add a skip-to-content link** in `app/layout.tsx` — add `<a href="#main-content" className="sr-only focus:...">Skip to content</a>` and `id="main-content"` to `<main>`.
2. **Fix Footer contrast** — increase opacity from 0.4 to at least 0.7, or use a lighter color.
3. **Make Gallery lightbox keyboard-accessible** — add `tabIndex={0}`, `role="button"`, `onKeyDown` handler, and manage focus in/out of dialog.
4. **Add `aria-hidden="true"`** to all decorative elements (SVGs, emoji icons, decorative numbers).
5. **Add `aria-controls` and `id`** to FAQ answer panels.
6. **Add `aria-expanded`** to the Nav hamburger button.
7. **Define `:focus-visible` styles** in `globals.css` for visible keyboard focus indicators.
8. **Add `role="img" aria-label`** to emoji icons or replace with SVG icons with proper accessible names.
