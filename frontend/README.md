# Enterprise Product Frontend (Vite + React + Tailwind)

Frontend-only demo that mimics an enterprise product catalog with admin tooling. Uses React Router v6, Tailwind CSS, and React Context (Auth + Products) with localStorage persistence. No backend is required; swap the client-side auth and storage with real APIs later.

## Getting started
```bash
npm install
npm run dev    # http://localhost:5173
npm run build
npm run preview
npm run test   # vitest + @testing-library/react
```

## Tailwind & PostCSS
- Tailwind configured in `tailwind.config.js` with `src/**/*.{js,jsx}` paths.
- Directives live in `src/index.css` (`@tailwind base/components/utilities`).
- PostCSS plugins are set in `postcss.config.js` (tailwindcss + autoprefixer).

## App structure
```
src/
  components/      Header, Footer, CategoryCard, ProductCard, AdminGuard
  pages/           Home, Category, AdminLogin, AdminDashboard
  context/         AuthContext, ProductsContext
  hooks/           useLocalStorage
  utils/           (placeholder for future helpers)
  App.jsx, main.jsx, index.css
```

## Auth (client-only)
- Hard-coded credentials in `AuthContext` (`admin` / `admin123`).
- State persists in `localStorage` (`isAdmin`, `adminUser`).
- `AdminGuard` redirects unauthenticated users to `/admin/login`.
- Replace later with backend login:
  - POST `/api/auth/login` → returns JWT or sets HttpOnly session cookie.
  - Store only non-sensitive metadata client-side; validate tokens server-side.
  - Protect `/admin/*` with server checks + role claims.

## Products & persistence
- Sample seed products stored in `ProductsContext` and persisted in `localStorage`.
- CRUD handlers: `addProduct`, `updateProduct`, `deleteProduct`, `getProductsByCategory`, `getCategories`.
- Replace with backend CRUD:
  - GET `/api/products?category=slug`
  - POST `/api/products`, PUT `/api/products/:id`, DELETE `/api/products/:id`
  - Expected JSON: `{ id, title, description, price, imageUrl, category }`

## Features
- Sticky, responsive header with category dropdown, search box, and mobile menu.
- Home hero + category grid; search filters products client-side.
- Category pages with pagination and admin-only edit buttons.
- Admin area (`/admin`) with login + dashboard to add/edit/delete products.
- All data stored in localStorage for now.

## Testing
- Example tests in `src/__tests__/Header.test.jsx` and `src/__tests__/AdminGuard.test.jsx`.
- Uses Vitest + React Testing Library + jest-dom matchers.

## Replacing localStorage + client auth
- Swap `useLocalStorage` usage with API calls.
- Move validation to the server; enforce auth on all admin routes.
- Use JWT (Authorization: Bearer) or HttpOnly session cookies; refresh tokens recommended.
