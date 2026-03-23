import { recipes } from "./state.js";
import { populateTags } from "./tags.js";
import { render } from "./render.js";

const API_URL = "/.netlify/functions/recipes";
const LOCAL_RECIPES_KEY = "recipes-local";

export function setRecipes(newRecipes) {
  recipes.length = 0;
  recipes.push(...newRecipes);
}

export function persistRecipesLocal() {
  try {
    localStorage.setItem(LOCAL_RECIPES_KEY, JSON.stringify(recipes));
  } catch {
    // Ignore storage failures (private mode/quota issues).
  }
}

export async function loadRecipes() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const apiRecipes = Array.isArray(data) ? data : [];
    if (apiRecipes.length > 0) {
      setRecipes(apiRecipes);
      persistRecipesLocal();
      populateTags();
      render();
      return;
    }

    // API is available but empty; seed from starter file.
    const seedRes = await fetch("recipes.json");
    const seedData = await seedRes.json();
    const seedRecipes = Array.isArray(seedData) ? seedData : [];
    if (seedRecipes.length > 0) {
      await Promise.all(
        seedRecipes.map(recipe =>
          fetch(API_URL, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(recipe),
          }).catch(() => null)
        )
      );

      const refreshed = await fetch(API_URL);
      if (!refreshed.ok) throw new Error(`API error: ${refreshed.status}`);
      const refreshedData = await refreshed.json();
      const refreshedRecipes = Array.isArray(refreshedData) ? refreshedData : [];
      if (refreshedRecipes.length > 0) {
        setRecipes(refreshedRecipes);
        persistRecipesLocal();
        populateTags();
        render();
        return;
      }
    }
  } catch {
    // Fallback for local/offline usage.
  }

  try {
    const localRaw = localStorage.getItem(LOCAL_RECIPES_KEY);
    if (localRaw) {
      const localData = JSON.parse(localRaw);
      if (Array.isArray(localData)) {
        setRecipes(localData);
        populateTags();
        render();
        return;
      }
    }
  } catch {
    // Ignore malformed local data and continue to static fallback.
  }

  const res = await fetch("recipes.json");
  const data = await res.json();
  setRecipes(Array.isArray(data) ? data : []);
  persistRecipesLocal();
  populateTags();
  render();
}

export async function upsertRecipe(recipe) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(recipe),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  return await res.json();
}

export async function deleteRecipeDb(id) {
  const res = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`);
}

// EXPORT RECIPES
export function exportToFile() {
  const blob = new Blob([JSON.stringify(recipes, null, 2)]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "recipes.json";
  a.click();
}