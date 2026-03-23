# Neon + Netlify persistence

This app can run as a static site, but it also supports persisting recipes in a Neon Postgres database via Netlify Functions.

## 1) Create the table in Neon

- In Neon, open the SQL editor for your database and run:
  - `db/schema.sql`

## 2) Configure Netlify environment variables

In your Netlify site settings, add:

- **`NETLIFY_DATABASE_URL`**: your Neon pooled connection string (recommended). Example format:
  - `postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require`

## 3) Deploy

This repo includes:

- `netlify.toml` (publishes `.`, functions in `netlify/functions/`)
- `netlify/functions/recipes.js` (GET/POST/PUT/DELETE recipes)

After deploy, the frontend will automatically:

- Load from `/.netlify/functions/recipes` when available
- Fallback to `recipes.json` if the API is unreachable (useful for local/offline)

## 4) Local dev notes

- The API endpoint is `/.netlify/functions/recipes`.
- If you open `recipes-app/index.html` directly from Finder (file://), browser fetches may be blocked; serve it with a local server or Netlify Dev for best results.

## 5) Access control for write actions

- The UI now requires login for **Add**, **Import**, **Edit**, and **Delete**.
- The API also enforces auth on write methods (`POST`, `PUT`, `DELETE`).
- Configure Netlify env vars for API auth:
  - `RECIPE_ADMIN_USERNAME`
  - `RECIPE_ADMIN_PASSWORD`
- If those env vars are missing, the API defaults to:
  - Username: `admin`
  - Password: `recipes123`
- Login in the app sends a Basic auth header used by the API.
# recipeapp
Browse and search for my favorite recipes.
