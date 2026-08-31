# Recipe Sharing Community

A full-stack social recipe platform: user accounts, recipe search, star ratings with reviews, and image uploads.

## Stack

- **Backend:** Node.js, Express, SQLite (via `better-sqlite3` — zero config, no separate DB server), JWT auth, Multer for image uploads
- **Frontend:** React 18, Vite, React Router

## Features

- Register / log in (JWT-based auth, hashed passwords)
- Create, edit, and delete recipes with a photo, ingredients, and numbered steps
- Search recipes by keyword, filter by category, sort by newest / oldest / top rated / most rated
- Star ratings (1–5) with optional written reviews; one rating per user per recipe (re-rating updates it)
- User profiles with bio, avatar, and a grid of their own recipes
- Paginated recipe grid

## Project structure

```
recipe-sharing-community/
├── backend/          Express API + SQLite database
│   ├── config/db.js       database connection & schema
│   ├── models/             User, Recipe, Rating query layers
│   ├── middleware/         JWT auth guard, Multer upload config
│   ├── routes/              auth.js, recipes.js
│   ├── uploads/             uploaded images are stored here (served at /uploads/...)
│   └── server.js
└── frontend/          React app (Vite)
    └── src/
        ├── api.js          fetch wrapper for the backend API
        ├── context/         AuthContext (login state)
        ├── components/     Navbar, RecipeCard, StarRating, SearchBar, ProtectedRoute
        └── pages/            Home, Login, Register, RecipeDetail, RecipeForm, Profile
```

## Getting started

Requires Node.js 18+.

### 1. Backend

```bash
cd backend
cp .env.example .env
# open .env and set JWT_SECRET to a long random string
npm install
npm run dev        # or: npm start
```

The API runs at `http://localhost:5000`. The SQLite database file (`data.sqlite`) and the schema are created automatically on first run — no manual migration step needed.

### 2. Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env   # defaults to http://localhost:5000, adjust if needed
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` and `/uploads` requests to the backend during development.

### 3. Open the app

Visit `http://localhost:5173`, create an account, and start sharing recipes.

## API overview

| Method | Endpoint                          | Auth | Description |
|--------|------------------------------------|------|--------------|
| POST   | `/api/auth/register`              | –    | Create an account |
| POST   | `/api/auth/login`                 | –    | Log in, get a JWT |
| GET    | `/api/auth/me`                    | ✔    | Current user |
| PUT    | `/api/auth/me`                    | ✔    | Update bio / avatar |
| GET    | `/api/auth/users/:username`       | –    | Public profile |
| GET    | `/api/recipes`                    | –    | Search/list (`q`, `category`, `sort`, `page`, `userId`) |
| GET    | `/api/recipes/categories`         | –    | Distinct categories in use |
| GET    | `/api/recipes/:id`                | –    | Recipe detail + ratings |
| POST   | `/api/recipes`                    | ✔    | Create recipe (multipart, optional `image`) |
| PUT    | `/api/recipes/:id`                | ✔ (owner) | Update recipe |
| DELETE | `/api/recipes/:id`                | ✔ (owner) | Delete recipe |
| POST   | `/api/recipes/:id/ratings`        | ✔    | Rate/review (upserts) |
| DELETE | `/api/recipes/:id/ratings`        | ✔    | Remove your rating |

## Notes for production

- Swap the file-based JWT secret and set `CLIENT_URL` in `backend/.env` to your deployed frontend origin.
- Uploaded images are stored on local disk under `backend/uploads/` — for production, point Multer at (or sync to) durable/object storage (e.g. S3) since local disk won't persist across most deployments.
- SQLite is great for a single-server deployment; for multi-instance scaling, migrate to Postgres/MySQL (the model layer in `backend/models/` is a thin SQL wrapper, so this is a contained change).
- Run `npm run build` in `frontend/` to produce a static production build (`frontend/dist/`) that can be served by any static host or by Express itself.
