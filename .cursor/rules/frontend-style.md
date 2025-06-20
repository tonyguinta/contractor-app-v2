
---

### `frontend-style.md`
```md
# Frontend Code Style

- Use **React with TypeScript**.
- Use **Tailwind CSS** for styling.
- Keep all components **functional and stateless** unless needed.
- Use **custom hooks** for shared logic (API calls, local state).
- Use `axios` or `fetch` in `src/api` and never directly inside pages/components.
- Keep forms in pages; decompose layout/UI into components.

Avoid:
- Class-based components
- CSS-in-JS (stick with Tailwind)
