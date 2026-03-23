import { loadRecipes } from "./data.js";
import { render } from "./render.js";

window.onload = () => {
  loadRecipes();
};

document.addEventListener("DOMContentLoaded", () => {
  loadRecipes();

  document.getElementById("search").oninput = render;
  document.getElementById("sortSelect").onchange = render;
  document.getElementById("filterTag").onchange = render;
});

// IMPORT + MERGE
export function importRecipes(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = e => {
    const imported = JSON.parse(e.target.result);

    imported.forEach(newR => {
      const index = recipes.findIndex(r => r.number === newR.number);
      if (index === -1) recipes.push(newR);
      else recipes[index] = newR;
    });

    populateTags();
    render();
  };

  reader.readAsText(file);
}

// EVENTS
document.getElementById("search").oninput = render;
document.getElementById("sortSelect").onchange = render;
document.getElementById("filterTag").onchange = render;