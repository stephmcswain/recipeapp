import { recipes } from "./state.js";
import { render } from "./render.js";
import { currentTags, populateTags, renderTags, setCurrentTags } from "./tags.js";
import { addSection, collectIngredients } from "./ingredients.js";
import { upsertRecipe, deleteRecipeDb } from "./data.js";

function ingredientsToEditText(ingredients) {
  if (!Array.isArray(ingredients) || ingredients.length === 0) return "";

  // Section format: [{ title, items: [] }]
  if (typeof ingredients[0] === "object") {
    return ingredients
      .flatMap(section => (section?.items || []).map(String))
      .join("\n");
  }

  // Old format: ["item", "item"]
  return ingredients.map(String).join("\n");
}

// EDIT / DELETE
export function openRecipe(id) {
  const r = recipes.find(x => String(x.number) === String(id));

  if (!r) {
    console.error("Recipe not found:", id);
    return;
  }

  const content = document.getElementById("modalContent");

  let ingredientsHTML = "";

if (Array.isArray(r.ingredients) && r.ingredients.length > 0) {

  // NEW FORMAT (sections)
  if (typeof r.ingredients[0] === "object") {
    ingredientsHTML = r.ingredients.map(section => `
      <h4 style="margin-bottom:4px;">${section.title}</h4>
      <ul>
        ${section.items.map(i => `<li>${i}</li>`).join("")}
      </ul>
    `).join("");
  }

  // OLD FORMAT (simple list)
  else {
    ingredientsHTML = `
      <ul>
        ${r.ingredients.map(i => `<li>${i}</li>`).join("")}
      </ul>
    `;
  }
} else {
    ingredientsHTML = "<p>No ingredients listed.</p>";
  }

  content.innerHTML = `
    <h2>${r.name}</h2>

    ${r.image ? `<img src="${r.image}" style="width:100%; border-radius:12px;">` : ""}

    <div style="margin:10px 0;">
      ${(r.tags || []).map(t => `<span class="tag">${t}</span>`).join("")}
    </div>

    <h3>Ingredients</h3>
    ${ingredientsHTML}

    <h3>Instructions</h3>
    <p style="white-space: pre-line;">${r.instructions || ""}</p>

    <div style="margin-top:10px;">
      <button onclick="editRecipe(${r.number})">✏️ Edit</button>
      <button onclick="deleteRecipe(${r.number})">🗑 Delete</button>
    </div>
  `;

  document.getElementById("modal").style.display = "flex";
}

// ADD MODAL
export function showAddRecipe() {
  setCurrentTags([]);
  const content = document.getElementById("modalContent");

  content.innerHTML = `
    <h2>➕ Add Recipe</h2>

    <div class="form-group">
      <label>Name</label>
      <input id="newName">
    </div>

<div class="form-group">
  <label>Tags</label>

  <div id="tagContainer" class="tag-input-container"></div>

  <div style="display:flex; gap:6px; margin-top:6px;">
    <input id="tagInput" placeholder="Add tag...">
    <button type="button" onclick="addTag()">Add</button>
  </div>
</div>

    <h3>Ingredients</h3>
    <div id="ingredientSections"></div>

    <button onclick="addSection()">➕ Add Section</button>

    <div class="form-group">
      <label>Instructions</label>
      <textarea id="newInstructions" rows="5"></textarea>
    </div>

    <div style="display:flex; gap:10px;">
      <input id="newCalories" placeholder="Calories">
      <input id="newProtein" placeholder="Protein">
    </div>

    <input type="file" id="newImage">

    <div class="modal-actions">
      <button onclick="saveRecipe()">Save</button>
      <button class="secondary-btn" onclick="closeModal()">Cancel</button>
    </div>
  `;

  document.getElementById("modal").style.display = "flex";

  addSection(); // start with one section
}

export function editRecipe(id) {
  const r = recipes.find(x => x.number === id);
  setCurrentTags([...(r?.tags || [])]);
  renderTags();
  const content = document.getElementById("modalContent");

  content.innerHTML = `
    <div class="modal-header">
      <h2>✏️ Edit Recipe</h2>
      <p style="color: var(--subtle); font-size: 13px;">Update your recipe</p>
    </div>

    <div class="form-group">
      <label>Recipe Name</label>
      <input id="editName" value="${r.name}">
    </div>

    <div class="form-group">
      <label>Tags</label>
      <input id="editTags" value="${(r.tags || []).join(", ")}">
    </div>

    <div class="form-group">
      <label>Ingredients (one per line)</label>
      <textarea id="editIngredients" rows="5">${ingredientsToEditText(r.ingredients)}</textarea>
    </div>

    <div class="form-group">
      <label>Instructions</label>
      <textarea id="editInstructions" rows="5">${r.instructions || ""}</textarea>
    </div>

    <div style="display:flex; gap:10px;">
      <div class="form-group" style="flex:1;">
        <label>Calories</label>
        <input id="editCalories" type="number" value="${r.calories || 0}">
      </div>

      <div class="form-group" style="flex:1;">
        <label>Protein (g)</label>
        <input id="editProtein" type="number" value="${r.protein || 0}">
      </div>
    </div>

      <div class="form-group" style="flex:1;">
        <label>Fiber (g)</label>
        <input id="editFiber" type="number" value="${r.fiber || 0}">
      </div> 

      <div class="form-group" style="flex:1;">
        <label>Carbs (g)</label>
        <input id="editCarbs" type="number" value="${r.carbs || 0}">
      </div>

      <div class="form-group" style="flex:1;">
        <label>Fat (g)</label>
        <input id="editFat" type="number" value="${r.fat || 0}">
      </div>

      <div class="form-group" style="flex:1;">
        <label>Sugar (g)</label>
        <input id="editSugar" type="number" value="${r.sugar || 0}">
      </div>

      <div class="form-group" style="flex:1;">
        <label>Sodium (mg)</label>
        <input id="editSodium" type="number" value="${r.sodium || 0}">
      </div>

      <div class="form-group" style="flex:1;">
        <label>Cholesterol (mg)</label>
        <input id="editCholesterol" type="number" value="${r.cholesterol || 0}">
      </div>

      <div class="form-group" style="flex:1;">
        <label>Saturated Fat (g)</label>
        <input id="editSaturated" type="number" value="${r.saturated || 0}">
      </div>

    <div class="form-group">
      <label>Replace Photo</label>
      <input type="file" id="editImage">
    </div>

    ${r.image ? `<img src="${r.image}" style="width:100%; border-radius:12px; margin-top:10px;">` : ""}

    <div class="modal-actions">
      <button onclick="saveEdit(${id})">💾 Save Changes</button>
      <button class="secondary-btn" onclick="closeModal()">Cancel</button>
    </div>
  `;
}

export function saveEdit(id) {
  const index = recipes.findIndex(r => r.number === id);
  if (index === -1) return;

  const updated = {
    ...recipes[index],
    name: document.getElementById("editName").value,
    tags: document
      .getElementById("editTags")
      .value.split(",")
      .map(t => t.trim())
      .filter(Boolean),
    ingredients: document
      .getElementById("editIngredients")
      .value.split("\n")
      .map(i => i.trim())
      .filter(Boolean),
    instructions: document.getElementById("editInstructions").value,
    calories: parseInt(document.getElementById("editCalories").value) || 0,
    protein: parseInt(document.getElementById("editProtein").value) || 0,
    fiber: parseInt(document.getElementById("editFiber").value) || 0,
    carbs: parseInt(document.getElementById("editCarbs").value) || 0,
    fat: parseInt(document.getElementById("editFat").value) || 0,
    sugar: parseInt(document.getElementById("editSugar").value) || 0,
    sodium: parseInt(document.getElementById("editSodium").value) || 0,
    cholesterol: parseInt(document.getElementById("editCholesterol").value) || 0,
    saturated: parseInt(document.getElementById("editSaturated").value) || 0,
  };

  const file = document.getElementById("editImage").files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async e => {
      updated.image = e.target.result;
      const saved = await upsertRecipe(updated);
      recipes[index] = saved;
      populateTags();
      render();
      closeModal();
    };
    reader.readAsDataURL(file);
    return;
  }

  (async () => {
    const saved = await upsertRecipe(updated);
    recipes[index] = saved;
    populateTags();
    render();
    closeModal();
  })();
}

// SAVE NEW
export function saveRecipe() {
  const numberValue = (id) => {
    const el = document.getElementById(id);
    if (!el) return 0;
    return parseInt(el.value, 10) || 0;
  };

  const newRecipe = {
    number: Date.now(),
    name: document.getElementById("newName").value,
    tags: currentTags,
    ingredients: collectIngredients(),
    instructions: document.getElementById("newInstructions").value,
    calories: numberValue("newCalories"),
    protein: numberValue("newProtein"),
    fiber: numberValue("newFiber"),
    carbs: numberValue("newCarbs"),
    fat: numberValue("newFat"),
    sugar: numberValue("newSugar"),
    sodium: numberValue("newSodium"),
    cholesterol: numberValue("newCholesterol"),
    saturated: numberValue("newSaturated"),
    image: ""
  };

  const file = document.getElementById("newImage").files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = async e => {
      newRecipe.image = e.target.result;
      const saved = await upsertRecipe(newRecipe);
      recipes.push(saved);
      populateTags();
      render();
    };
    reader.readAsDataURL(file);
  } else {
    (async () => {
      const saved = await upsertRecipe(newRecipe);
      recipes.push(saved);
      populateTags();
      render();
    })();
  }

  closeModal();
}

export function deleteRecipe(id) {
  const filtered = recipes.filter(r => r.number !== id);
  recipes.length = 0;
  recipes.push(...filtered);
  deleteRecipeDb(id).catch(() => {});
  populateTags();
  render();
  closeModal();
}

export function closeModal() {
  document.getElementById("modal").style.display = "none";
}
document.getElementById("modal").onclick = (e) => {
  if (e.target.id === "modal") {
    closeModal();
  }
};