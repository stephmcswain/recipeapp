import { recipes } from "./state.js";
import { populateTags } from "./tags.js";
import { render } from "./render.js";

export function setRecipes(newRecipes) {
  recipes.length = 0;
  recipes.push(...newRecipes);
}

export function loadRecipes() {
  fetch("recipes.json")
    .then(res => res.json())
    .then(data => {
      setRecipes(data);
      populateTags();
      render();
    });
}

// EXPORT RECIPES
export function exportToFile() {
  const blob = new Blob([JSON.stringify(recipes, null, 2)]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "recipes.json";
  a.click();
}