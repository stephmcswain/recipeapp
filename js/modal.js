import { recipes } from "./state.js";

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
  currentTags = [];
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
  currentTags = [...(r.tags || [])];
  renderTags();
  const r = recipes.find(x => x.number === id);
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
      <textarea id="editIngredients" rows="5">${(r.ingredients || []).join("\n")}</textarea>
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

// SAVE NEW
export function saveRecipe() {
  const newRecipe = {
    number: Date.now(),
    name: document.getElementById("newName").value,
    tags: currentTags,
    ingredients: collectIngredients(),
    instructions: document.getElementById("newInstructions").value,
    calories: parseInt(document.getElementById("newCalories").value)||0,
    protein: parseInt(document.getElementById("newProtein").value)||0,
    fiber: parseInt(document.getElementById("newFiber").value)||0,
    carbs: parseInt(document.getElementById("newCarbs").value)||0,
    fat: parseInt(document.getElementById("newFat").value)||0,
    sugar: parseInt(document.getElementById("newSugar").value)||0,
    sodium: parseInt(document.getElementById("newSodium").value)||0,
    cholesterol: parseInt(document.getElementById("newCholesterol").value)||0,
    saturated: parseInt(document.getElementById("newSaturated").value)||0,
    image: ""
  };

  const file = document.getElementById("newImage").files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      newRecipe.image = e.target.result;
      recipes.push(newRecipe);
      render();
    };
    reader.readAsDataURL(file);
  } else {
    recipes.push(newRecipe);
    render();
  }

  closeModal();
}

export function deleteRecipe(id) {
  const filtered = recipes.filter(r => r.number !== id);
  recipes.length = 0;
  recipes.push(...filtered);
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