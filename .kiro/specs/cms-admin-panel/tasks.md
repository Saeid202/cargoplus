# Implementation Tasks: CMS Admin Panel

## Task Overview

- [x] 1. Database & Types Foundation
- [x] 2. Server Actions
- [x] 3. Admin Layout — Content Sidebar Section
- [x] 4. Slider Manager
- [x] 5. Navigation Manager
- [x] 6. Page Manager
- [ ] 7. Public Site Updates
- [x] 8. Install Dependencies

---

## 1. Database & Types Foundation

- [x] 1.1 Create `supabase/migrations/012_cms_tables.sql`
  - `nav_items` table with all columns, indexes, RLS policies
  - `page_contents` table with all columns, self-FK, check constraint, indexes, RLS policies
  - Seed 5 protected pages (about, contact, privacy, shipping, terms)

- [x] 1.2 Create `types/cms.ts`
  - `HeroSlideRow`, `NavItemRow`, `PageContentRow`, `PageTreeNode`
  - Form data types: `SlideFormData`, `NavItemFormData`, `PageFormData`

---

## 2. Server Actions

- [x] 2.1 Create `app/actions/cms-revalidate.ts`
  - `revalidateHome()` — revalidates `/`
  - `revalidateAllPublic()` — revalidates `/` with layout scope
  - `revalidatePage(slug)` — revalidates `/[slug]`

- [x] 2.2 Create `app/actions/cms-sliders.ts`
  - `getSlides()` — SELECT all from hero_slides ordered by position
  - `createSlide(data: SlideFormData)` — INSERT + revalidateHome
  - `updateSlide(id, data: SlideFormData)` — UPDATE + revalidateHome
  - `deleteSlide(id)` — DELETE + revalidateHome
  - `reorderSlides(orderedIds: string[])` — batch UPDATE positions + revalidateHome
  - `toggleSlideActive(id, is_active: boolean)` — UPDATE is_active + revalidateHome
  - Admin session check on all mutations

- [x] 2.3 Create `app/actions/cms-navigation.ts`
  - `getNavItems()` — SELECT all from nav_items ordered by position
  - `getAllPagesForNav()` — SELECT id, slug, title, show_in_nav, nav_label, nav_position, parent_id from page_contents
  - `createNavItem(data: NavItemFormData)` — INSERT + revalidateAllPublic
  - `updateNavItem(id, data: NavItemFormData)` — UPDATE + revalidateAllPublic
  - `deleteNavItem(id)` — DELETE + revalidateAllPublic
  - `reorderNavItems(orderedIds: string[])` — batch UPDATE positions + revalidateAllPublic
  - `toggleNavItemActive(id, is_active: boolean)` — UPDATE + revalidateAllPublic
  - `updatePageNavAssignment(slug, fields)` — UPDATE show_in_nav/nav_label/nav_position + revalidateAllPublic

- [x] 2.4 Create `app/actions/cms-pages.ts`
  - `getPageTree()` — SELECT all page_contents, return as PageTreeNode[]
  - `getPageBySlug(slug)` — SELECT single page
  - `getParentPages()` — SELECT WHERE parent_id IS NULL
  - `createPage(data: PageFormData)` — INSERT + revalidatePage
  - `updatePageMeta(slug, data)` — UPDATE title/parent_id + revalidatePage
  - `updatePageContent(slug, content: string)` — UPDATE content + revalidatePage
  - `deletePage(slug)` — check not protected, check no children, DELETE + revalidatePage

---

## 3. Admin Layout — Content Sidebar Section

- [x] 3.1 Update `app/admin/layout.tsx`
  - Add `Image`, `Menu`, `FileText` icons from lucide-react
  - Add `contentNavItems` array: Sliders `/admin/cms/sliders`, Navigation `/admin/cms/navigation`, Pages `/admin/cms/pages`
  - Render "CONTENT" section label divider above content nav items
  - Apply same active/inactive styling as existing nav items

- [x] 3.2 Create `app/admin/cms/page.tsx`
  - Server component that redirects to `/admin/cms/sliders`

---

## 4. Slider Manager

- [x] 4.1 Create `components/ui/ConfirmDialog.tsx`
  - Reusable modal: title, message, confirm button, cancel button
  - Accepts `onConfirm`, `onCancel`, `isOpen` props

- [x] 4.2 Create `components/ui/Toggle.tsx`
  - Reusable toggle switch component
  - Accepts `checked`, `onChange`, `disabled` props

- [x] 4.3 Create `components/admin/cms/sliders/SlideImagePreview.tsx`
  - Accepts `url: string` prop
  - Shows image if URL starts with `https://` and loads successfully
  - Shows broken-image placeholder + warning on load error
  - Shows empty placeholder when url is blank

- [x] 4.4 Create `components/admin/cms/sliders/SlideForm.tsx`
  - Modal form for add/edit
  - Fields: Title*, Subtitle, Image URL*, CTA Text, CTA Link, Position, Active toggle
  - Debounced image URL → passes to `SlideImagePreview`
  - HTTPS URL validation
  - Required field validation with inline errors
  - Calls `createSlide` or `updateSlide` on submit

- [x] 4.5 Create `components/admin/cms/sliders/SlideCard.tsx`
  - Displays: thumbnail, title, subtitle preview, CTA text, position badge, active/inactive badge
  - Dimmed styling when inactive
  - Edit button → opens SlideForm pre-populated
  - Delete button → opens ConfirmDialog
  - Active toggle → calls `toggleSlideActive`
  - Up/Down arrow buttons for touch reorder fallback

- [x] 4.6 Create `components/admin/cms/sliders/SliderList.tsx`
  - `@hello-pangea/dnd` DragDropContext + Droppable + Draggable
  - Renders SlideCard list
  - On drag end: calls `reorderSlides`
  - Empty state: message + "Add First Slide" button
  - Summary bar: total count + active count

- [x] 4.7 Create `app/admin/cms/sliders/page.tsx`
  - Server component: fetches slides via `getSlides()`
  - Renders SliderList + "Add Slide" button
  - Page header: "Slider Manager"

---

## 5. Navigation Manager

- [x] 5.1 Create `components/admin/cms/navigation/NavItemForm.tsx`
  - Modal form for add/edit custom nav items
  - Fields: Label*, URL/href*, Position, Open in New Tab toggle, Active toggle
  - Required field validation
  - Calls `createNavItem` or `updateNavItem`

- [x] 5.2 Create `components/admin/cms/navigation/NavItemRow.tsx`
  - Row for a custom nav_item
  - Shows: label, href, position, new-tab indicator, active badge
  - Edit button → opens NavItemForm
  - Delete button → opens ConfirmDialog → calls `deleteNavItem`
  - Active toggle → calls `toggleNavItemActive`
  - Up/Down arrows for touch reorder fallback

- [x] 5.3 Create `components/admin/cms/navigation/PageNavRow.tsx`
  - Row for a page-based nav entry
  - Shows: page title, nav_label (if set), slug, parent indicator, nav_position
  - Inline editable nav_label field
  - Inline editable nav_position field
  - show_in_nav toggle → calls `updatePageNavAssignment`
  - Link to edit page in Page Manager

- [x] 5.4 Create `components/admin/cms/navigation/UnifiedNavView.tsx`
  - "Page Links" section: drag-drop list of PageNavRow (show_in_nav=true)
  - "Hidden Pages" collapsible section: pages with show_in_nav=false, each with enable toggle
  - "Custom Links" section: drag-drop list of NavItemRow
  - "Add Custom Link" button
  - Summary bar: total active nav entries
  - On reorder in Page Links: calls `updatePageNavAssignment` for nav_position
  - On reorder in Custom Links: calls `reorderNavItems`

- [x] 5.5 Create `app/admin/cms/navigation/page.tsx`
  - Server component: fetches `getNavItems()` + `getAllPagesForNav()`
  - Renders UnifiedNavView
  - Page header: "Navigation Manager"

---

## 6. Page Manager

- [x] 6.1 Create `components/admin/cms/pages/PageEditorToolbar.tsx`
  - Tiptap toolbar buttons: H1, H2, H3, Bold, Italic, BulletList, OrderedList, Link, Undo, Redo
  - Each button highlights when the corresponding mark/node is active in editor

- [x] 6.2 Create `components/admin/cms/pages/PageEditor.tsx`
  - Tiptap editor with extensions: StarterKit, Link, Heading (levels 1-3)
  - Accepts `initialContent: string` (HTML)
  - Exposes `getHTML()` for parent to read on save
  - Renders PageEditorToolbar above editor
  - Styled with Tailwind prose classes for preview

- [x] 6.3 Create `components/admin/cms/pages/PageForm.tsx`
  - Modal form for add/edit page metadata
  - Fields: Title*, Slug* (auto-generated from title, editable), Parent Page dropdown
  - Slug validation: lowercase letters, numbers, hyphens only
  - Duplicate slug inline error
  - Parent dropdown: lists all parent pages (parent_id IS NULL), plus "None (top-level)"
  - Depth guard: if selected parent already has a parent, show error
  - Calls `createPage` or `updatePageMeta`

- [x] 6.4 Create `components/admin/cms/pages/PageTreeNode.tsx`
  - Single row in the page tree
  - Shows: title, slug pill, parent badge (if child), nav visibility dot, last updated timestamp
  - Edit button → navigates to `/admin/cms/pages/[slug]`
  - Delete button → opens ConfirmDialog (disabled + tooltip for protected pages)
  - Child pages rendered indented beneath parent with `pl-8` + left border line

- [x] 6.5 Create `components/admin/cms/pages/PageTree.tsx`
  - Accepts `pages: PageTreeNode[]`
  - Renders parent pages at root, children indented beneath
  - Empty state message
  - "Add Page" button → opens PageForm

- [x] 6.6 Create `app/admin/cms/pages/page.tsx`
  - Server component: fetches `getPageTree()`
  - Renders PageTree
  - Page header: "Page Manager"

- [x] 6.7 Create `app/admin/cms/pages/[slug]/page.tsx`
  - Server component: fetches page by slug via `getPageBySlug(slug)`
  - Renders PageEditor with initial content
  - "Save" button: calls `updatePageContent(slug, html)` via client action
  - Shows last-saved timestamp after save
  - Breadcrumb: Page Manager → [page title]
  - Empty content validation before save

---

## 7. Public Site Updates

- [x] 7.1 Update `components/layout/Header.tsx` (or create if not exists)
  - Server component
  - Fetch `page_contents` WHERE show_in_nav=true
  - Fetch `nav_items` WHERE is_active=true
  - Merge and sort by nav_position/position
  - Render top-level tabs (parent pages + custom links)
  - Render dropdown sub-menus for child pages under their parent tab
  - Use nav_label if set, fallback to title
  - Dropdown: Tailwind `group` + `group-hover:flex` pattern

- [x] 7.2 Create `app/(public)/[slug]/page.tsx`
  - `generateStaticParams`: return all slugs from page_contents
  - Fetch page by slug
  - `notFound()` if not found
  - Render `<div dangerouslySetInnerHTML={{ __html: page.content }} />` wrapped in prose classes
  - Page title from page.title

- [ ] 7.3 Update `app/(public)/about/page.tsx`
  - Read content from page_contents WHERE slug='about' instead of hardcoded content
  - Fallback to static content if DB unavailable

- [ ] 7.4 Update `app/(public)/contact/page.tsx`, `privacy/page.tsx`, `shipping/page.tsx`, `terms/page.tsx`
  - Same pattern as 7.3 — read from page_contents, fallback to static

---

## 8. Install Dependencies

- [x] 8.1 Install `@hello-pangea/dnd`
  ```bash
  npm install @hello-pangea/dnd
  npm install --save-dev @types/hello-pangea__dnd
  ```

- [x] 8.2 Install Tiptap packages
  ```bash
  npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-heading
  ```
