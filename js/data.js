import { recipes } from "./state.js";
import { populateTags } from "./tags.js";
import { render } from "./render.js";

const API_URL = "/.netlify/functions/recipes";

export function setRecipes(newRecipes) {
  recipes.length = 0;
  recipes.push(...newRecipes);
}

export async function loadRecipes() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    setRecipes(Array.isArray(data) ? data : []);
    populateTags();
    render();
    return;
  } catch {
    // Fallback for local/offline usage.
  }

  const res = await fetch("recipes.json");
  const data = await res.json();
  setRecipes(Array.isArray(data) ? data : []);
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