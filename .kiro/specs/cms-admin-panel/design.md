# Design Document: CMS Admin Panel

## Overview

The CMS Admin Panel extends the existing `/admin` section with three new modules — Slider Manager, Navigation Manager, and Page Manager — all backed by Supabase and surfaced through Next.js server actions. The public site reads CMS data via ISR, so changes appear within 60 seconds of saving.

---

## System Architecture

```
Admin Browser
    │
    ▼
/admin/cms/* (Next.js App Router, protected by AdminLayout)
    │
    ▼
Server Actions (app/actions/cms-*.ts)
    │  ├── verifyAdminSession()
    │  ├── Supabase mutation
    │  └── revalidatePath()
    │
    ▼
Supabase PostgreSQL
    ├── hero_slides      (existing)
    ├── nav_items        (new)
    └── page_contents    (new)
    │
    ▼
Public Site (Next.js ISR, revalidated on save)
    ├── / (HeroSlider reads hero_slides)
    ├── Header (reads nav_items + page_contents where show_in_nav=true)
    └── /[slug] (reads page_contents by slug)
```

---

## Database Schema

### Migration: `supabase/migrations/012_cms_tables.sql`

```sql
-- ─── nav_items ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nav_items (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  label          TEXT        NOT NULL,
  href           TEXT        NOT NULL,
  position       INTEGER     NOT NULL DEFAULT 0,
  is_active      BOOLEAN     NOT NULL DEFAULT true,
  open_in_new_tab BOOLEAN    NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nav_items_position ON nav_items(position);
CREATE INDEX IF NOT EXISTS idx_nav_items_active   ON nav_items(is_active);

-- ─── page_contents ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_contents (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT        UNIQUE NOT NULL,
  title        TEXT        NOT NULL,
  content      TEXT        NOT NULL DEFAULT '',
  parent_id    UUID        REFERENCES page_contents(id) ON DELETE SET NULL,
  show_in_nav  BOOLEAN     NOT NULL DEFAULT false,
  nav_label    TEXT,
  nav_position INTEGER,
  is_protected BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_parent CHECK (parent_id IS NULL OR parent_id <> id)
);

CREATE INDEX IF NOT EXISTS idx_page_contents_slug       ON page_contents(slug);
CREATE INDEX IF NOT EXISTS idx_page_contents_parent     ON page_contents(parent_id);
CREATE INDEX IF NOT EXISTS idx_page_contents_show_in_nav ON page_contents(show_in_nav);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE nav_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_contents ENABLE ROW LEVEL SECURITY;

-- Public can read active nav_items
CREATE POLICY "Public read active nav items"
  ON nav_items FOR SELECT
  USING (is_active = true);

-- Public can read all page_contents (needed for public pages)
CREATE POLICY "Public read page contents"
  ON page_contents FOR SELECT
  USING (true);

-- Admin full access to nav_items
CREATE POLICY "Admin full access nav items"
  ON nav_items FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Admin full access to page_contents
CREATE POLICY "Admin full access page contents"
  ON page_contents FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ─── Seed protected pages ─────────────────────────────────────────────────────
INSERT INTO page_contents (slug, title, content, is_protected) VALUES
  ('about',    'About Us',        '<p>About Us content.</p>',        true),
  ('contact',  'Contact',         '<p>Contact us content.</p>',      true),
  ('privacy',  'Privacy Policy',  '<p>Privacy policy content.</p>',  true),
  ('shipping', 'Shipping Policy', '<p>Shipping policy content.</p>', true),
  ('terms',    'Terms of Service','<p>Terms of service content.</p>',true)
ON CONFLICT (slug) DO NOTHING;
```

---

## File Structure

```
app/
├── admin/
│   ├── layout.tsx                          ← UPDATE: add Content section to sidebar
│   └── cms/
│       ├── page.tsx                        ← redirect to /admin/cms/sliders
│       ├── sliders/
│       │   └── page.tsx                    ← SliderManager page
│       ├── navigation/
│       │   └── page.tsx                    ← NavigationManager page
│       └── pages/
│           ├── page.tsx                    ← PageManager list/tree page
│           └── [slug]/
│               └── page.tsx               ← PageEditor page
├── actions/
│   ├── cms-sliders.ts                      ← NEW: slider server actions
│   ├── cms-navigation.ts                   ← NEW: nav server actions
│   ├── cms-pages.ts                        ← NEW: page server actions
│   └── cms-revalidate.ts                   ← NEW: revalidation helper
├── (public)/
│   └── [slug]/
│       └── page.tsx                        ← NEW: dynamic CMS page route

components/
├── admin/
│   └── cms/
│       ├── sliders/
│       │   ├── SliderList.tsx              ← drag-drop list of slide cards
│       │   ├── SlideCard.tsx               ← single slide card with toggle/edit/delete
│       │   ├── SlideForm.tsx               ← add/edit modal form
│       │   └── SlideImagePreview.tsx       ← debounced image preview
│       ├── navigation/
│       │   ├── UnifiedNavView.tsx          ← Page Links + Custom Links sections
│       │   ├── PageNavRow.tsx              ← row for a page-based nav entry
│       │   ├── NavItemRow.tsx              ← row for a custom nav_item
│       │   └── NavItemForm.tsx             ← add/edit modal for custom links
│       └── pages/
│           ├── PageTree.tsx                ← indented tree of all pages
│           ├── PageTreeNode.tsx            ← single row in the tree
│           ├── PageForm.tsx                ← add/edit page metadata modal
│           ├── PageEditor.tsx              ← Tiptap editor wrapper
│           └── PageEditorToolbar.tsx       ← bold/italic/heading/list buttons
├── layout/
│   └── Header.tsx                          ← UPDATE: read from Supabase CMS data
└── ui/
    ├── ConfirmDialog.tsx                   ← reusable confirm modal
    └── Toggle.tsx                          ← reusable toggle switch

supabase/
└── migrations/
    └── 012_cms_tables.sql                  ← NEW: nav_items + page_contents

types/
└── cms.ts                                  ← NEW: CMS-specific TypeScript types
```

---

## TypeScript Types

### `types/cms.ts`

```typescript
export interface HeroSlideRow {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  cta_text: string | null
  cta_link: string | null
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface NavItemRow {
  id: string
  label: string
  href: string
  position: number
  is_active: boolean
  open_in_new_tab: boolean
  created_at: string
  updated_at: string
}

export interface PageContentRow {
  id: string
  slug: string
  title: string
  content: string
  parent_id: string | null
  show_in_nav: boolean
  nav_label: string | null
  nav_position: number | null
  is_protected: boolean
  created_at: string
  updated_at: string
}

export interface PageTreeNode extends PageContentRow {
  children: PageContentRow[]
}

// Form input types
export interface SlideFormData {
  title: string
  subtitle: string
  image_url: string
  cta_text: string
  cta_link: string
  position: number
  is_active: boolean
}

export interface NavItemFormData {
  label: string
  href: string
  position: number
  is_active: boolean
  open_in_new_tab: boolean
}

export interface PageFormData {
  title: string
  slug: string
  parent_id: string | null
}
```

---

## Server Actions

### `app/actions/cms-revalidate.ts`
```typescript
"use server"
import { revalidatePath } from "next/cache"

export async function revalidateHome() {
  revalidatePath("/")
}

export async function revalidateAllPublic() {
  revalidatePath("/", "layout") // revalidates all routes using root layout
}

export async function revalidatePage(slug: string) {
  revalidatePath(`/${slug}`)
}
```

### `app/actions/cms-sliders.ts`
```typescript
"use server"
// getSlides()          → SELECT * FROM hero_slides ORDER BY position ASC
// createSlide(data)    → INSERT INTO hero_slides + revalidateHome()
// updateSlide(id,data) → UPDATE hero_slides WHERE id + revalidateHome()
// deleteSlide(id)      → DELETE FROM hero_slides WHERE id + revalidateHome()
// reorderSlides(ids)   → batch UPDATE positions + revalidateHome()
// toggleSlideActive(id, is_active) → UPDATE is_active + revalidateHome()
// All mutations: verify admin session first
```

### `app/actions/cms-navigation.ts`
```typescript
"use server"
// getNavItems()              → SELECT * FROM nav_items ORDER BY position ASC
// createNavItem(data)        → INSERT INTO nav_items + revalidateAllPublic()
// updateNavItem(id, data)    → UPDATE nav_items WHERE id + revalidateAllPublic()
// deleteNavItem(id)          → DELETE FROM nav_items WHERE id + revalidateAllPublic()
// reorderNavItems(ids)       → batch UPDATE positions + revalidateAllPublic()
// toggleNavItemActive(id, v) → UPDATE is_active + revalidateAllPublic()
// updatePageNavAssignment(slug, { show_in_nav, nav_label, nav_position })
//   → UPDATE page_contents WHERE slug + revalidateAllPublic()
// getNavPageEntries()        → SELECT from page_contents WHERE show_in_nav=true
// getAllPagesForNav()        → SELECT id,slug,title,show_in_nav,nav_label,nav_position,parent_id
```

### `app/actions/cms-pages.ts`
```typescript
"use server"
// getPageTree()              → SELECT all page_contents, build tree in JS
// getPageBySlug(slug)        → SELECT * FROM page_contents WHERE slug = slug
// getParentPages()           → SELECT WHERE parent_id IS NULL (for parent dropdown)
// createPage(data)           → INSERT INTO page_contents + revalidatePage(slug)
// updatePageMeta(slug, data) → UPDATE title/parent_id/slug + revalidatePage(slug)
// updatePageContent(slug, content) → UPDATE content + revalidatePage(slug)
// deletePage(slug)           → check not protected, check no children, DELETE + revalidatePage(slug)
```

---

## Component Details

### SlideForm (modal)
- Fields: Title*, Subtitle, Image URL*, CTA Text, CTA Link, Position, Active toggle
- Image URL: debounced 500ms → updates `SlideImagePreview`
- Validation: title required, image_url required + starts with `https://`
- On submit: calls `createSlide` or `updateSlide`

### SliderList (drag-drop)
- Uses `@hello-pangea/dnd` (`DragDropContext` + `Droppable` + `Draggable`)
- On drag end: calls `reorderSlides(newOrderedIds)`
- Touch fallback: up/down arrow buttons on each `SlideCard`

### PageEditor (Tiptap)
- Extensions: `StarterKit`, `Link.configure({ openOnClick: false })`, `Heading.configure({ levels: [1,2,3] })`
- Content stored as HTML string
- Toolbar: H1, H2, H3, Bold, Italic, BulletList, OrderedList, Link, Undo, Redo
- Auto-save indicator: shows "Saved at HH:MM" after successful save

### PageTree
- Fetches all pages, groups children under parents in JS
- Renders parent rows at root, child rows indented with `pl-8` and a vertical line
- Each row: title, slug, parent badge, nav visibility dot, last updated, Edit + Delete buttons

### Header (public, updated)
- Server component — fetches from Supabase at request time (ISR)
- Merges `page_contents` (show_in_nav=true) + `nav_items` (is_active=true)
- Top-level items: parent pages + custom nav_items, ordered by nav_position/position
- Dropdown: child pages grouped under their parent tab
- Renders dropdown with hover/focus using Tailwind `group` + `group-hover:block`

---

## Admin Layout Update

Add a "Content" section group to the existing sidebar in `app/admin/layout.tsx`:

```typescript
// New nav group added after existing Operations items:
const contentItems = [
  { href: "/admin/cms/sliders",    label: "Sliders",    icon: Image },
  { href: "/admin/cms/navigation", label: "Navigation", icon: Menu },
  { href: "/admin/cms/pages",      label: "Pages",      icon: FileText },
]
// Render with a "CONTENT" section label divider above it
```

---

## Revalidation Map

| Action | Routes revalidated |
|---|---|
| Slide create/update/delete/reorder/toggle | `/` |
| Nav item create/update/delete/reorder/toggle | `/` + layout (all routes) |
| Page nav assignment change (show_in_nav, nav_label, nav_position) | `/` + layout |
| Page content save | `/{slug}` only |
| Page create | `/{slug}` |
| Page delete | `/{slug}` |

---

## Drag-and-Drop Library

Use `@hello-pangea/dnd` — the actively maintained React 18 compatible fork of `react-beautiful-dnd`.

```bash
npm install @hello-pangea/dnd
```

Pattern:
```tsx
<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="slides">
    {(provided) => (
      <div ref={provided.innerRef} {...provided.droppableProps}>
        {slides.map((slide, index) => (
          <Draggable key={slide.id} draggableId={slide.id} index={index}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.draggableProps}>
                <span {...provided.dragHandleProps}>⠿</span>
                <SlideCard slide={slide} />
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

---

## Public Dynamic Page Route

### `app/(public)/[slug]/page.tsx`
```typescript
// generateStaticParams: return all slugs from page_contents
// page component: fetch page_contents by slug, render content as HTML
// notFound() if slug not found
// Renders content with: <div dangerouslySetInnerHTML={{ __html: page.content }} />
// Wrapped in prose Tailwind classes for typography
```

---

## Correctness Properties (PBT)

1. **Slide position uniqueness**: After any reorder, all slides have unique, sequential position values starting from 0.
2. **Page hierarchy depth**: No page_contents record has a parent whose parent_id is also non-null (max depth = 2).
3. **No self-parent**: For all page_contents records, `parent_id !== id`.
4. **Protected page immutability**: The 5 protected slugs (about, contact, privacy, shipping, terms) are never deleted regardless of input.
5. **Nav merge ordering**: The merged nav array is always sorted by position ascending with no duplicates.
