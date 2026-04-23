# Requirements Document

## Introduction

Shanghai Cargo Plus needs a WordPress-style CMS admin panel built into the existing `/admin` section of the Next.js + Supabase site. The goal is to let a non-developer admin visually manage the public-facing website — hero sliders, header navigation, and static page content — without touching code. The CMS extends the existing admin panel (which already manages products, sellers, orders, partners, agents, and inquiries) with three new management modules: **Slider Manager**, **Navigation Manager**, and **Page Content Manager**.

All CMS data is stored in Supabase (PostgreSQL). The public site reads CMS data at runtime (with ISR revalidation), so changes made in the admin panel are reflected on the live site within seconds.

The rich-text editor used throughout the CMS is **Tiptap** (headless, MIT license). Slide images are managed via URL only — the admin pastes a public HTTPS URL and sees a live preview; no file upload is required. Page hierarchy follows a WordPress-style parent/child model with a maximum depth of 2 levels.

---

## Glossary

- **CMS_Admin**: The authenticated administrator using the admin panel at `/admin`
- **Slider_Manager**: The admin UI module for managing hero slides at `/admin/cms/sliders`
- **Navigation_Manager**: The admin UI module for managing header nav links at `/admin/cms/navigation`
- **Page_Manager**: The admin UI module for managing static page content at `/admin/cms/pages`
- **Hero_Slide**: A single slide record in the `hero_slides` Supabase table, containing title, subtitle, image URL, CTA text, CTA link, position, and active flag
- **Nav_Item**: A custom external navigation link record stored in the `nav_items` Supabase table, containing label, href, position, open-in-new-tab flag, and active flag
- **Page_Content**: A rich-text content record stored in the `page_contents` Supabase table, keyed by a unique `slug` (e.g. `about`, `privacy`, `shipping`, `terms`, `contact`)
- **Parent_Page**: A Page_Content record with `parent_id = null`, eligible to appear as a top-level nav item
- **Child_Page**: A Page_Content record with a non-null `parent_id`, appears as a dropdown sub-item under its parent in the header navigation
- **Page_Tree**: The hierarchical structure of all Page_Content records organised by parent/child relationships, with a maximum depth of 2 levels
- **Nav_Assignment**: The combination of `show_in_nav`, `nav_label`, and `nav_position` fields on a Page_Content record that controls whether and how the page appears in the header navigation
- **CMS_Module**: Any one of Slider_Manager, Navigation_Manager, or Page_Manager
- **Revalidation**: Next.js ISR cache invalidation triggered after a CMS save, causing the public site to reflect changes within 60 seconds
- **Drag-and-Drop Reorder**: A UI interaction where the admin drags rows to change their `position` value
- **Rich_Text_Editor**: The Tiptap headless editor (MIT license) used in Page_Manager for WYSIWYG content editing
- **Slug**: A URL-safe identifier string (e.g. `about`, `privacy`) that maps a Page_Content record to a public route

---

## Requirements

---

### Requirement 1: CMS Navigation Entry Points

**User Story:** As a CMS_Admin, I want a clearly labelled "Content" section in the admin sidebar, so that I can quickly find and access all CMS management tools.

#### Acceptance Criteria

1. THE Admin_Layout SHALL render a "Content" group in the sidebar navigation containing links to `/admin/cms/sliders`, `/admin/cms/navigation`, and `/admin/cms/pages`.
2. WHEN the CMS_Admin navigates to `/admin/cms`, THE Admin_Layout SHALL redirect to `/admin/cms/sliders` as the default CMS landing page.
3. THE Admin_Layout SHALL visually distinguish the "Content" group from the existing "Operations" group (Partners, Agents, Sellers, Orders, Inquiries) using a section label or divider.
4. WHEN the CMS_Admin is on any `/admin/cms/*` route, THE Admin_Layout SHALL highlight the corresponding sidebar link as active.

---

### Requirement 2: Hero Slider — List and Overview

**User Story:** As a CMS_Admin, I want to see all hero slides in a sortable list with live previews, so that I can understand the current slider state at a glance.

#### Acceptance Criteria

1. WHEN the CMS_Admin visits `/admin/cms/sliders`, THE Slider_Manager SHALL fetch all slides from the `hero_slides` table ordered by `position` ascending and display them in a list.
2. THE Slider_Manager SHALL display each slide as a card showing: thumbnail of the image, title, CTA text, position number, and an active/inactive badge.
3. WHEN the `hero_slides` table contains zero records, THE Slider_Manager SHALL display an empty-state message and a prominent "Add First Slide" button.
4. THE Slider_Manager SHALL display the total slide count and the count of active slides in a summary bar above the list.

---

### Requirement 3: Hero Slider — Add Slide

**User Story:** As a CMS_Admin, I want to add a new hero slide with all its fields, so that I can promote new content on the homepage.

#### Acceptance Criteria

1. WHEN the CMS_Admin clicks "Add Slide", THE Slider_Manager SHALL open a slide form (modal or dedicated page) with fields: Title (required), Subtitle (optional), Image URL (required), CTA Text (optional), CTA Link (optional), Position (integer, auto-set to last+1), and Active toggle (default: true).
2. WHEN the CMS_Admin enters or pastes a valid HTTPS Image URL, THE Slider_Manager SHALL render a live image preview within 500ms of the last keystroke using a debounced update.
3. WHEN the CMS_Admin submits the form with all required fields valid, THE Slider_Manager SHALL insert a new record into `hero_slides` and display a success notification.
4. IF the Image URL field is empty or the Title field is empty when the form is submitted, THEN THE Slider_Manager SHALL display inline validation errors and SHALL NOT submit the form.
5. WHEN a new slide is successfully saved, THE Slider_Manager SHALL trigger Next.js ISR revalidation for the `/` route so the homepage reflects the new slide within 60 seconds.

---

### Requirement 4: Hero Slider — Edit Slide

**User Story:** As a CMS_Admin, I want to edit any field of an existing slide, so that I can update content without deleting and recreating slides.

#### Acceptance Criteria

1. WHEN the CMS_Admin clicks "Edit" on a slide card, THE Slider_Manager SHALL open the slide form pre-populated with all existing field values.
2. WHEN the CMS_Admin modifies the Image URL field, THE Slider_Manager SHALL update the live image preview in real time using a debounced update.
3. WHEN the CMS_Admin saves a valid edited form, THE Slider_Manager SHALL update the corresponding `hero_slides` record and display a success notification.
4. IF the CMS_Admin clears a required field and attempts to save, THEN THE Slider_Manager SHALL display inline validation errors and SHALL NOT persist the change.
5. WHEN an edit is successfully saved, THE Slider_Manager SHALL trigger ISR revalidation for the `/` route.

---

### Requirement 5: Hero Slider — Delete Slide

**User Story:** As a CMS_Admin, I want to permanently delete a slide, so that I can remove outdated promotions from the homepage.

#### Acceptance Criteria

1. WHEN the CMS_Admin clicks "Delete" on a slide card, THE Slider_Manager SHALL display a confirmation dialog showing the slide title before proceeding.
2. WHEN the CMS_Admin confirms deletion, THE Slider_Manager SHALL delete the record from `hero_slides` and remove the card from the list.
3. WHEN a slide is deleted, THE Slider_Manager SHALL trigger ISR revalidation for the `/` route.
4. IF the deleted slide was the only active slide, THEN THE Slider_Manager SHALL display a warning notification informing the CMS_Admin that the homepage slider will fall back to mock data.

---

### Requirement 6: Hero Slider — Reorder Slides

**User Story:** As a CMS_Admin, I want to drag slides to reorder them, so that I can control which slide appears first without manually editing position numbers.

#### Acceptance Criteria

1. THE Slider_Manager SHALL support Drag-and-Drop Reorder on the slide list, allowing the CMS_Admin to drag a slide card to a new position.
2. WHEN the CMS_Admin drops a slide in a new position, THE Slider_Manager SHALL update the `position` values of all affected slides in `hero_slides` in a single batch operation.
3. WHEN the reorder is saved, THE Slider_Manager SHALL trigger ISR revalidation for the `/` route.
4. WHILE a drag operation is in progress, THE Slider_Manager SHALL visually indicate the drag target position with a highlighted drop zone.

---

### Requirement 7: Hero Slider — Toggle Active State

**User Story:** As a CMS_Admin, I want to activate or deactivate individual slides without deleting them, so that I can prepare slides in advance and control what is visible on the homepage.

#### Acceptance Criteria

1. THE Slider_Manager SHALL display an active/inactive toggle switch on each slide card.
2. WHEN the CMS_Admin toggles a slide's active state, THE Slider_Manager SHALL update the `is_active` field in `hero_slides` immediately without requiring a full form save.
3. WHEN the active state is toggled, THE Slider_Manager SHALL trigger ISR revalidation for the `/` route.
4. THE Slider_Manager SHALL visually distinguish active slides (e.g. full opacity) from inactive slides (e.g. dimmed) in the list.

---

### Requirement 8: Navigation Manager — List Nav Items

**User Story:** As a CMS_Admin, I want to see all header navigation entries in a unified ordered list, so that I can understand the complete current site navigation structure.

#### Acceptance Criteria

1. WHEN the CMS_Admin visits `/admin/cms/navigation`, THE Navigation_Manager SHALL display a unified list of all nav entries: page-based entries (from `page_contents` where `show_in_nav = true`) and custom external links (from `nav_items`), ordered by their respective `nav_position` / `position` values.
2. THE Navigation_Manager SHALL display each entry showing: label (or `nav_label` override), href or slug, position number, entry type (Page Link or Custom Link), and an active/inactive badge.
3. WHEN both `page_contents` and `nav_items` contain zero nav-visible records, THE Navigation_Manager SHALL display an empty-state message and a prominent "Add First Link" button.
4. THE Navigation_Manager SHALL display the total nav entry count and the count of active entries in a summary bar above the list.
5. THE Navigation_Manager SHALL visually group entries into a "Page Links" section (page-based) and a "Custom Links" section (Nav_Item records).

---

### Requirement 9: Navigation Manager — Add Custom Nav Item

**User Story:** As a CMS_Admin, I want to add a custom external navigation link to the header, so that I can expose external URLs or non-page routes to site visitors.

#### Acceptance Criteria

1. WHEN the CMS_Admin clicks "Add Custom Link", THE Navigation_Manager SHALL open a nav item form with fields: Label (required), URL/href (required), Position (integer, auto-set to last+1), Open in New Tab toggle (default: false), and Active toggle (default: true).
2. WHEN the CMS_Admin submits the form with all required fields valid, THE Navigation_Manager SHALL insert a new record into `nav_items` and display a success notification.
3. IF the Label field or the href field is empty when the form is submitted, THEN THE Navigation_Manager SHALL display inline validation errors and SHALL NOT submit the form.
4. WHEN a new Nav_Item is successfully saved, THE Navigation_Manager SHALL trigger ISR revalidation for all public routes so the header reflects the new link within 60 seconds.

---

### Requirement 10: Navigation Manager — Edit Custom Nav Item

**User Story:** As a CMS_Admin, I want to edit the label, URL, or settings of an existing custom nav link, so that I can keep navigation accurate as the site evolves.

#### Acceptance Criteria

1. WHEN the CMS_Admin clicks "Edit" on a custom Nav_Item row, THE Navigation_Manager SHALL open the nav item form pre-populated with all existing field values.
2. WHEN the CMS_Admin saves a valid edited form, THE Navigation_Manager SHALL update the corresponding `nav_items` record and display a success notification.
3. IF the CMS_Admin clears a required field and attempts to save, THEN THE Navigation_Manager SHALL display inline validation errors and SHALL NOT persist the change.
4. WHEN an edit is successfully saved, THE Navigation_Manager SHALL trigger ISR revalidation for all public routes.

---

### Requirement 11: Navigation Manager — Delete Custom Nav Item

**User Story:** As a CMS_Admin, I want to delete a custom navigation link, so that I can remove external links that are no longer relevant from the header.

#### Acceptance Criteria

1. WHEN the CMS_Admin clicks "Delete" on a custom Nav_Item row, THE Navigation_Manager SHALL display a confirmation dialog showing the item label before proceeding.
2. WHEN the CMS_Admin confirms deletion, THE Navigation_Manager SHALL delete the record from `nav_items` and remove the row from the list.
3. WHEN a Nav_Item is deleted, THE Navigation_Manager SHALL trigger ISR revalidation for all public routes.

---

### Requirement 12: Navigation Manager — Reorder Nav Items

**User Story:** As a CMS_Admin, I want to drag navigation links to reorder them, so that I can control the left-to-right order of tabs in the header.

#### Acceptance Criteria

1. THE Navigation_Manager SHALL support Drag-and-Drop Reorder on the nav item list within each section (Page Links and Custom Links independently).
2. WHEN the CMS_Admin drops a Nav_Item in a new position, THE Navigation_Manager SHALL update the `position` values of all affected records in `nav_items` in a single batch operation.
3. WHEN the CMS_Admin reorders a page-based nav entry, THE Navigation_Manager SHALL update the `nav_position` field on the corresponding `page_contents` record.
4. WHEN the reorder is saved, THE Navigation_Manager SHALL trigger ISR revalidation for all public routes.

---

### Requirement 13: Navigation Manager — Toggle Active State

**User Story:** As a CMS_Admin, I want to show or hide individual nav links without deleting them, so that I can temporarily remove links during maintenance or seasonal changes.

#### Acceptance Criteria

1. THE Navigation_Manager SHALL display an active/inactive toggle switch on each Nav_Item row.
2. WHEN the CMS_Admin toggles a custom Nav_Item's active state, THE Navigation_Manager SHALL update the `is_active` field in `nav_items` immediately without requiring a full form save.
3. WHEN the CMS_Admin toggles a page-based nav entry's visibility, THE Navigation_Manager SHALL update the `show_in_nav` field on the corresponding `page_contents` record immediately.
4. WHEN any active state is toggled, THE Navigation_Manager SHALL trigger ISR revalidation for all public routes.
5. THE public Header component SHALL only render nav entries where the entry is active (`is_active = true` for Nav_Items, `show_in_nav = true` for page-based entries).

---

### Requirement 14: Page Content Manager — List Managed Pages

**User Story:** As a CMS_Admin, I want to see a list of all editable pages in a visual tree, so that I can quickly navigate to the page I want to update and understand the page hierarchy.

#### Acceptance Criteria

1. WHEN the CMS_Admin visits `/admin/cms/pages`, THE Page_Manager SHALL display all Page_Content records from the `page_contents` table organised as a Page_Tree with visual indentation showing parent/child relationships.
2. THE Page_Manager SHALL display each page entry showing: page title, slug, parent page (if any), last-updated timestamp, nav visibility indicator, and an "Edit" button.
3. THE Page_Manager SHALL pre-seed the `page_contents` table with entries for the following slugs on first setup: `about`, `contact`, `privacy`, `shipping`, `terms`.
4. WHEN the CMS_Admin clicks "Add Page", THE Page_Manager SHALL open a new page form allowing the CMS_Admin to define a title, slug, optional parent page, and initial content.

---

### Requirement 15: Page Content Manager — Edit Page Content

**User Story:** As a CMS_Admin, I want to edit the content of any managed page using a rich-text editor, so that I can update text, headings, and lists without writing HTML or code.

#### Acceptance Criteria

1. WHEN the CMS_Admin clicks "Edit" on a page entry, THE Page_Manager SHALL open a full-page editor view at `/admin/cms/pages/[slug]` containing a Rich_Text_Editor pre-loaded with the page's current content.
2. THE Rich_Text_Editor SHALL be implemented using Tiptap (headless, MIT license) and SHALL support at minimum: headings (H1–H3), bold, italic, unordered lists, ordered lists, hyperlinks, and paragraph text.
3. WHEN the CMS_Admin clicks "Save", THE Page_Manager SHALL persist the updated HTML/JSON content to the `page_contents` table for the corresponding slug.
4. WHEN the CMS_Admin clicks "Save", THE Page_Manager SHALL trigger ISR revalidation for the corresponding public route (e.g. `/about`, `/privacy`) so the live page reflects the change within 60 seconds.
5. IF the CMS_Admin attempts to save with an empty content body, THEN THE Page_Manager SHALL display a validation error and SHALL NOT persist the change.
6. THE Page_Manager SHALL display the last-saved timestamp after a successful save.

---

### Requirement 16: Page Content Manager — Add New Page

**User Story:** As a CMS_Admin, I want to create a new managed page with a custom slug and optional parent, so that I can add new informational pages to the site without a developer.

#### Acceptance Criteria

1. WHEN the CMS_Admin submits the new page form with a valid title and slug, THE Page_Manager SHALL insert a new record into `page_contents` and redirect to the editor view for that slug.
2. IF the slug entered already exists in `page_contents`, THEN THE Page_Manager SHALL display an inline error "A page with this slug already exists" and SHALL NOT insert a duplicate record.
3. THE Page_Manager SHALL enforce that slugs contain only lowercase letters, numbers, and hyphens, and SHALL display an inline validation error for non-conforming slugs.
4. WHEN a new page is created, THE public site SHALL serve the page at `/[slug]` using a dynamic catch-all route that reads from `page_contents`.
5. WHEN creating a new page, THE Page_Manager SHALL present a dropdown of all existing Parent_Page records (pages with `parent_id = null`) so the CMS_Admin can optionally assign a parent, or leave the page as top-level.

---

### Requirement 17: Page Content Manager — Delete Page

**User Story:** As a CMS_Admin, I want to delete a custom page, so that I can remove pages that are no longer needed.

#### Acceptance Criteria

1. WHEN the CMS_Admin clicks "Delete" on a page entry, THE Page_Manager SHALL display a confirmation dialog showing the page title and slug before proceeding.
2. WHEN the CMS_Admin confirms deletion of a non-protected page with no children, THE Page_Manager SHALL delete the record from `page_contents`.
3. THE Page_Manager SHALL protect the five pre-seeded pages (`about`, `contact`, `privacy`, `shipping`, `terms`) from deletion by disabling the Delete button and displaying a tooltip "This page is protected and cannot be deleted".
4. WHEN a page is deleted, THE Page_Manager SHALL trigger ISR revalidation so the public route returns a 404.
5. WHEN the CMS_Admin attempts to delete a Parent_Page that has one or more Child_Page records, THE Page_Manager SHALL display a warning dialog listing the child pages and SHALL require the CMS_Admin to either reassign or delete the children before the parent can be deleted.

---

### Requirement 18: Data Persistence — Supabase Schema

**User Story:** As a developer, I want all CMS data stored in well-structured Supabase tables, so that the admin panel and public site share a single source of truth.

#### Acceptance Criteria

1. THE Database SHALL contain a `nav_items` table with columns: `id` (uuid, primary key), `label` (text, not null), `href` (text, not null), `position` (integer, not null), `is_active` (boolean, default true), `open_in_new_tab` (boolean, default false), `created_at` (timestamptz), `updated_at` (timestamptz).
2. THE Database SHALL contain a `page_contents` table with columns: `id` (uuid, primary key), `slug` (text, unique, not null), `title` (text, not null), `content` (text, not null), `parent_id` (uuid, nullable, foreign key referencing `page_contents.id`), `show_in_nav` (boolean, not null, default false), `nav_label` (text, nullable), `nav_position` (integer, nullable), `created_at` (timestamptz), `updated_at` (timestamptz).
3. THE Database SHALL enforce a check constraint on `page_contents` such that a record's `parent_id` SHALL NOT equal its own `id`.
4. THE Database SHALL enforce Row Level Security (RLS) on `nav_items` and `page_contents` such that only authenticated admin users can INSERT, UPDATE, or DELETE records.
5. THE Database SHALL allow unauthenticated SELECT on `nav_items` (where `is_active = true`) and `page_contents` so the public site can read CMS data without authentication.
6. THE existing `hero_slides` table SHALL be used without schema changes — all required columns (`id`, `title`, `subtitle`, `image_url`, `cta_text`, `cta_link`, `position`, `is_active`) already exist.

---

### Requirement 19: ISR Revalidation

**User Story:** As a CMS_Admin, I want my changes to appear on the live site quickly after saving, so that I don't have to wait for a full deployment.

#### Acceptance Criteria

1. WHEN any CMS save action completes successfully, THE CMS_Module SHALL call a Next.js revalidation server action that invokes `revalidatePath` for the affected public routes.
2. THE Revalidation SHALL target `/` when hero slides are changed, and SHALL target all public routes (`/`, `/about`, `/contact`, `/privacy`, `/shipping`, `/terms`, and any custom page slug) when nav items or nav assignments are changed.
3. WHEN a Page_Content record is saved, THE Revalidation SHALL target only the specific public route matching the page slug.
4. IF the revalidation call fails, THEN THE CMS_Module SHALL log the error server-side and SHALL still display a success notification to the CMS_Admin (the save itself succeeded).

---

### Requirement 20: Admin Access Control

**User Story:** As a site owner, I want all CMS routes to be protected behind admin authentication, so that only authorised administrators can modify site content.

#### Acceptance Criteria

1. WHILE a user is not authenticated as an admin, THE Admin_Layout SHALL redirect requests to `/admin/cms/*` routes to `/admin/login`.
2. THE CMS server actions (insert, update, delete for `hero_slides`, `nav_items`, `page_contents`) SHALL verify the caller has an active admin session before executing any database mutation.
3. IF a server action is called without a valid admin session, THEN THE CMS_Module SHALL return an error response with status 401 and SHALL NOT mutate any database record.

---

### Requirement 21: Image Handling for Slides

**User Story:** As a CMS_Admin, I want to provide an image URL for each slide and see a live preview, so that I can verify the image looks correct before publishing.

#### Acceptance Criteria

1. THE Slider_Manager SHALL accept image URLs from any publicly accessible HTTPS source (Unsplash, Supabase Storage, CDN, etc.) and SHALL NOT provide a file upload mechanism.
2. WHEN the CMS_Admin enters or pastes an image URL, THE Slider_Manager SHALL render a live preview of the image within 500ms of the last keystroke using a debounced update.
3. IF the image URL returns a non-200 HTTP response or fails to load, THEN THE Slider_Manager SHALL display a broken-image placeholder and an inline warning "Image could not be loaded — please check the URL".
4. THE Slider_Manager SHALL validate that the Image URL begins with `https://` before accepting the value, and SHALL display an inline validation error for non-HTTPS URLs.

---

### Requirement 22: Responsive Admin UI

**User Story:** As a CMS_Admin, I want the CMS admin panel to be usable on a tablet, so that I can make quick content updates from any device.

#### Acceptance Criteria

1. THE CMS_Module pages SHALL be fully usable at viewport widths of 768px and above.
2. THE Drag-and-Drop Reorder interaction SHALL degrade gracefully on touch devices by providing up/down arrow buttons as an alternative reorder mechanism.
3. THE Rich_Text_Editor SHALL be usable on tablet-sized viewports without horizontal overflow.

---

### Requirement 23: Page Hierarchy — Parent/Child Structure

**User Story:** As a CMS_Admin, I want to organise pages into a parent/child hierarchy, so that I can structure the site's navigation and content in a logical tree without developer involvement.

#### Acceptance Criteria

1. WHEN the CMS_Admin creates or edits a page, THE Page_Manager SHALL present a dropdown listing all existing Parent_Page records (pages with `parent_id = null`) so the CMS_Admin can optionally assign a parent or leave the page as top-level.
2. THE Page_Manager SHALL enforce that a page's `parent_id` SHALL NOT reference its own `id`, and SHALL display an inline error "A page cannot be its own parent" if this is attempted.
3. THE Page_Manager SHALL enforce a maximum hierarchy depth of 2 levels (Parent_Page → Child_Page only), and SHALL display an inline error "Child pages cannot have their own children" if the CMS_Admin attempts to assign a parent to a page that already has children.
4. WHEN the CMS_Admin visits `/admin/cms/pages`, THE Page_Manager SHALL render the Page_Tree with visual indentation: Parent_Page records at the root level and their Child_Page records indented beneath them.
5. WHEN the CMS_Admin attempts to delete a Parent_Page that has one or more Child_Page records, THE Page_Manager SHALL display a blocking warning dialog listing the affected children and SHALL NOT proceed with deletion until the CMS_Admin has reassigned or deleted all children.

---

### Requirement 24: Navigation from Page Tree

**User Story:** As a CMS_Admin, I want pages to automatically appear in the header navigation based on their nav assignment flags, so that I can control site navigation directly from the Page Manager without maintaining a separate nav list.

#### Acceptance Criteria

1. WHEN a Page_Content record has `show_in_nav = true` and `parent_id = null`, THE public Header component SHALL render that page as a top-level navigation tab, using `nav_label` as the display text if set, otherwise falling back to the page `title`.
2. WHEN a Page_Content record has `show_in_nav = true` and a non-null `parent_id`, THE public Header component SHALL render that page as a dropdown sub-item under its parent's navigation tab, using `nav_label` if set, otherwise falling back to the page `title`.
3. THE public Header component SHALL order top-level nav entries by `nav_position` ascending, falling back to `created_at` ascending for entries where `nav_position` is null.
4. THE public Header component SHALL merge page-based nav entries (from `page_contents` where `show_in_nav = true`) with custom external Nav_Items (from `nav_items` where `is_active = true`) into a single ordered header navigation, with each group ordered by its respective position field.
5. WHEN the CMS_Admin sets `nav_label` on a Page_Content record, THE Navigation_Manager and public Header component SHALL display the `nav_label` value in place of the page title for that nav entry.
6. WHEN the CMS_Admin sets `nav_position` on a Page_Content record, THE public Header component SHALL use that value to order the entry within its nav level (top-level or dropdown).

---

### Requirement 25: Navigation Manager — Unified View and Page Nav Controls

**User Story:** As a CMS_Admin, I want the Navigation Manager to show all nav entries in one place and let me control page nav assignments directly, so that I have a single screen for managing the complete header navigation.

#### Acceptance Criteria

1. WHEN the CMS_Admin visits `/admin/cms/navigation`, THE Navigation_Manager SHALL display a unified list of all nav entries: page-based entries (from `page_contents` where `show_in_nav = true`) grouped under "Page Links", and custom external links (from `nav_items`) grouped under "Custom Links".
2. THE Navigation_Manager SHALL display a "Page Links" section listing all pages with `show_in_nav = true`, showing for each: page title, `nav_label` (if set), slug, parent page (if any), and `nav_position`.
3. WHEN the CMS_Admin toggles the nav visibility control for a page entry in the Navigation_Manager, THE Navigation_Manager SHALL update the `show_in_nav` field on the corresponding `page_contents` record immediately and trigger ISR revalidation for all public routes.
4. WHEN the CMS_Admin edits a page entry's nav label in the Navigation_Manager, THE Navigation_Manager SHALL update the `nav_label` field on the corresponding `page_contents` record and trigger ISR revalidation for all public routes.
5. WHEN the CMS_Admin edits a page entry's nav position in the Navigation_Manager, THE Navigation_Manager SHALL update the `nav_position` field on the corresponding `page_contents` record and trigger ISR revalidation for all public routes.
6. THE Navigation_Manager SHALL also display all pages with `show_in_nav = false` in a collapsed or secondary "Hidden Pages" list, allowing the CMS_Admin to enable nav visibility for any page without navigating to the Page Manager.
