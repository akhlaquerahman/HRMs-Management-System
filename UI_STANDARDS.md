# UI Standards & Component Patterns

To maintain a cohesive, enterprise-grade aesthetic, all frontend contributions must adhere to the following UI standards.

## 1. Design Philosophy
- **Professional & Clean:** High contrast, sufficient whitespace, minimal border usage.
- **Accessibility First:** All interactive elements must be keyboard navigable and screen-reader friendly (ARIAL labels required).
- **Consistent Feedback:** Every action must yield feedback (Toast, Spinner, or inline validation).

## 2. Color Palette (Tailwind Configuration)
- **Primary:** `blue-600` for primary actions (Submit, Save).
- **Secondary:** `slate-200` to `slate-800` for typography and borders.
- **Destructive:** `red-600` for deletions and warnings.
- **Success:** `green-600` for confirmations and positive trends.
- **Backgrounds:** Pure white (`#FFFFFF`) for cards, off-white (`#F8FAFC`) for app background. Dark mode uses `slate-900` and `slate-950`.

## 3. Spacing & Layout
- Use a **4pt/8pt grid system**.
- **Padding:** Containers typically use `p-6` or `p-8`. Cards use `p-4` or `p-6`.
- **Gap:** Flex and Grid layouts must use `gap-4` or `gap-6`.

## 4. Typography
- **Font Family:** Inter (or similar modern sans-serif).
- **Headings:**
  - `h1`: `text-2xl font-bold tracking-tight text-slate-900`
  - `h2`: `text-xl font-semibold text-slate-800`
- **Body Text:** `text-sm text-slate-600`.

## 5. Component Patterns
- **Forms:** Always use `react-hook-form` integrated with `zod`. Inputs must use the standard `<Input>` wrapper that handles error messages below the field.
- **Modals (Dialogs):** Use Radix UI Dialog. Must have a clear title, description, and explicit Cancel/Confirm buttons.
- **Tables:** Use standard data table components with sticky headers, pagination controls at the bottom, and sortable columns.
- **Buttons:**
  - `variant="default"`: Main actions.
  - `variant="outline"`: Secondary actions.
  - `variant="ghost"`: Icon buttons and tertiary actions.
  - `variant="destructive"`: Delete actions.

## 6. Iconography
- Use `lucide-react` exclusively.
- Default icon size: `w-4 h-4` (text-sm equivalent) or `w-5 h-5` for larger actions.
