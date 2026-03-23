import { loadRecipes } from "./data.js";
import { exportToFile } from "./data.js";
import { upsertRecipe } from "./data.js";
import { render } from "./render.js";
import { recipes } from "./state.js";
import { populateTags, addTag, removeTag } from "./tags.js";
import { addSection, addIngredient } from "./ingredients.js";
import { showAddRecipe, closeModal, saveRecipe, deleteRecipe, editRecipe, saveEdit } from "./modal.js";

window.onload = () => {
  loadRecipes();
};

document.addEventListener("DOMContentLoaded", () => {
  loadRecipes();

  document.getElementById("search").oninput = render;
  document.getElementById("sortSelect").onchange = render;
  document.getElementById("filterTag").onchange = render;
});

// Expose handlers used by inline HTML onclick attributes.
window.showAddRecipe = showAddRecipe;
window.saveToFile = exportToFile;
window.importRecipes = importRecipes;
window.closeModal = closeModal;
window.saveRecipe = saveRecipe;
window.deleteRecipe = deleteRecipe;
window.editRecipe = editRecipe;
window.saveEdit = saveEdit;
window.addTag = addTag;
window.removeTag = removeTag;
window.addSection = addSection;
window.addIngredient = addIngredient;

// IMPORT + MERGE
export function importRecipes(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = async e => {
    const imported = JSON.parse(e.target.result);

    for (const newR of imported) {
      const index = recipes.findIndex(r => r.number === newR.number);
      if (index === -1) recipes.push(newR);
      else recipes[index] = newR;
      try {
        const saved = await upsertRecipe(newR);
        const savedIndex = recipes.findIndex(r => r.number === saved.number);
        if (savedIndex === -1) recipes.push(saved);
        else recipes[savedIndex] = saved;
      } catch {
        // keep local copy even if API isn't reachable
      }
    }

    populateTags();
    render();
  };

  reader.readAsText(file);
}

// EVENTS
document.getElementById("search").oninput = render;
document.getElementById("sortSelect").onchange = render;
document.getElementById("filterTag").onchange = render;