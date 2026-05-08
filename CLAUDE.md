# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite HMR) — backend expected at http://127.0.0.1:8000
npm run build      # TypeScript check + Vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

No test suite exists. TypeScript is the main correctness check (`tsc -b` runs on `build`).

## Architecture

### Role-based shells (`src/App.tsx`)

`AppShell` reads `localStorage("user")` on every route change (via `useLocation()`) and renders one of three shells:

| Condition | Shell | Nav style |
|---|---|---|
| No token | `PublicShell` | Top nav (`Navbar`) — shows Home, Login, Register |
| `role === "cliente"` | `ClienteShell` | Left sidebar (`ClienteLayout`) |
| `role === "funcionario"` | `FuncionarioShell` | Left sidebar (`FuncionarioLayout`) |

Role detection checks three possible backend field names: `user.profile_type ?? user.role ?? user.tipo_perfil`. The backend (`/auth/login`, `/auth/register`) returns `profile_type`, not `role`.

### Page organisation

```
src/pages/
  cliente/       # Pages for authenticated clients
  funcionario/   # Pages for authenticated employees
  LoginPage.tsx  # Public
  RegisterPage.tsx
  Home.tsx       # Public landing page (also used as PublicHome import in App.tsx)
src/components/
  cliente/ClienteLayout.tsx     # Sidebar with client nav
  funcionario/FuncionarioLayout.tsx  # Sidebar with employee nav (includes Usuários)
```

Client pages are **read-only** for catalog data (Serviços, Categorias, Tags, Lojas) and **filtered** for user-owned data (only their pets via `pet.dono_id === userId`, only their appointments via `atendimento.cliente_id === userId`).

Employee pages have full CRUD on everything.

### Service layer (`src/services/`)

All services talk to the FastAPI backend via the `api` axios instance (`src/services/api.ts`), which injects `Authorization: Bearer <token>` on every request. Base URL is `http://127.0.0.1:8000` (or `VITE_API_URL` env var).

The backend uses **snake_case** field names but sometimes different names than the frontend types. Key mappings:

- **Pet**: API uses `owner_id` → frontend uses `dono_id`; API uses `name/breed/sex/size` → frontend uses `nome/raca/sexo/porte`. `sex` must be sent as `"macho"` or `"femea"` (not `"M"`/`"F"`) because the backend's `_normalize_sex` does `.lower()` before dict lookup.
- **Pet create**: `breed` is required on the backend (`Query(...)`). The pet form enforces this.
- **User**: `getUsuarios` returns `profile_type` from the backend, mapped to `tipo_perfil` in `toUsuario()`. The mapping is: `(user.profile_type ?? user.role) === "funcionario"`.
- **Auth responses**: Login and register return `{ access_token, user }` where `user.profile_type` is the role field.

### Authentication / localStorage

After login/register, two keys are set:
- `localStorage.token` — JWT Bearer token
- `localStorage.user` — JSON of the user object (`{ id, name, email, profile_type, active, created_at, ... }`)

Logout clears both and redirects to `/login`.

### Design system

All pages use a consistent light theme — **no** `apexTheme` / dark theme variables. Key patterns:

```
Page wrapper:     px-8 py-8
Card:             rounded-2xl border border-gray-100 bg-white shadow-sm
Form card:        rounded-2xl border border-gray-100 bg-white p-6 shadow-sm
Input:            w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15
Primary button:   bg-gradient-to-r from-[#1c46f3] to-[#1840e0] text-white ... shadow-[#1c46f3]/20
Success toast:    border-emerald-200 bg-emerald-50 text-emerald-700
Error toast:      border-red-200 bg-red-50 text-red-600
```

Brand colors: `#1c46f3` (blue), `#00bb69` (green), `#ffd200` (yellow).

The `src/lib/theme.ts` file (`apexTheme.colors`) still exists but **should not be used** in new or refactored pages — it's legacy from the old dark-theme design.

### Create-form toggle pattern

All CRUD pages (Categorias, Serviços, Lojas, Tags, Pets, Atendimentos, Usuários) hide the create form by default. A `showForm` state toggled by a "+ Novo X" / "Cancelar" button in the page header controls visibility. The form auto-closes on successful creation (`setShowForm(false)` inside the success handler).

### Lists

- **Pets** and **Users**: compact table layout with fixed columns (uses `grid-cols-[...]` with explicit column widths).
- **Tags**: table rows in editable context; colored pill chips in read-only context.
- **Appointments**: collapsible rows — summary always visible, services/observações revealed by chevron toggle.
- **Lojas**: 2-column card grid with clickable area + action footer strip.

## Backend

The FastAPI backend lives at `c:\Users\gabriel.romero\workspace\TrilhaApex`. Relevant endpoints:

| Method | Path | Notes |
|---|---|---|
| `POST` | `/auth/login` | Returns `{ access_token, user }` |
| `POST` | `/auth/register` | Body: `{ name, email, password, phone, profile_type, client_type, cpf, cnpj, cep, state, city }` |
| `GET` | `/auth/me` | Returns current user (same shape as `user` in login response) |
| `GET` | `/pet/pets` | Returns all pets (no server-side filtering by owner) |
| `POST` | `/pet` | Query params only (not body); `breed` is required |
| `GET` | `/user/users` | Returns all users |

`profile_type` accepted values: `"cliente"` | `"funcionario"`.
