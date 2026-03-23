import { recipes } from "./state.js";
import { openRecipe } from "./modal.js";

// RENDER
export function render() {
  let search = document.getElementById("search").value.toLowerCase();
  let sort = document.getElementById("sortSelect").value;
  let filterTag = document.getElementById("filterTag").value;

  let filtered = recipes.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search);
    const matchesTag = filterTag === "all" || (r.tags || []).includes(filterTag);
    return matchesSearch && matchesTag;
  });

  if (sort === "name") filtered.sort((a,b)=>a.name.localeCompare(b.name));
  if (sort === "calories") filtered.sort((a,b)=>(b.calories||0)-(a.calories||0));
  if (sort === "protein") filtered.sort((a,b)=>(b.protein||0)-(a.protein||0));
  if(sort === "fiber") filtered.sort((a,b)=>(b.fiber||0)-(a.fiber||0));
  if(sort === "carbs") filtered.sort((a,b)=>(b.carbs||0)-(a.carbs||0));
  if(sort === "fat") filtered.sort((a,b)=>(b.fat||0)-(a.fat||0));
  if(sort === "sugar") filtered.sort((a,b)=>(b.sugar||0)-(a.sugar||0));
  if(sort === "sodium") filtered.sort((a,b)=>(b.sodium||0)-(a.sodium||0));
  if(sort === "cholesterol") filtered.sort((a,b)=>(b.cholesterol||0)-(a.cholesterol||0));
  if(sort === "saturated") filtered.sort((a,b)=>(b.saturated||0)-(a.saturated||0));

  const container = document.getElementById("recipes");
  container.innerHTML = "";

  filtered.forEach(r => {
    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      ${r.image ? `<img src="${r.image}">` : ""}
      <strong>${r.name}</strong>
      <div>${(r.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("")}</div>
      <div>🔥 ${r.calories||0} | 💪 ${r.protein||0}g | 🧂 ${r.sodium||0}mg | 🧃 ${r.sugar||0}g | 🧂 ${r.cholesterol||0}mg | 🧂 ${r.saturated||0}g </div>
    `;

    div.onclick = () => openRecipe(r.number);
    container.appendChild(div);
  });
}