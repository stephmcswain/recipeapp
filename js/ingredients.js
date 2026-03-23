export function addIngredient(sectionId) {
  const section = document.querySelector(`[data-id="${sectionId}"]`);
  const container = section.querySelector(".ingredients");

  const row = document.createElement("div");
  row.className = "ingredient-row";

  row.innerHTML = `
    <input placeholder="Ingredient">
    <button class="small-btn" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(row);
}

export function collectIngredients() {
  const sections = document.querySelectorAll(".section-card");

  return Array.from(sections).map(section => {
    const title = section.querySelector("input").value;

    const items = Array.from(section.querySelectorAll(".ingredient-row input"))
      .map(i => i.value.trim())
      .filter(i => i);

    return { title, items };
  }).filter(s => s.items.length);
}

export function addSection() {
  const container = document.getElementById("ingredientSections");

  const id = Date.now();

  const section = document.createElement("div");
  section.className = "section-card";
  section.dataset.id = id;

  section.innerHTML = `
    <div class="section-header">
      <input placeholder="Section name (e.g. Chicken)">
      <button class="small-btn" onclick="this.closest('.section-card').remove()">✕</button>
    </div>

    <div class="ingredients"></div>

    <button class="small-btn" onclick="addIngredient(${id})">+ Ingredient</button>
  `;

  container.appendChild(section);

  addIngredient(id);
}