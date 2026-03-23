import { recipes } from "./state.js";

// TAGS
export function populateTags() {
  const tagSet = new Set();
  recipes.forEach(r => (r.tags||[]).forEach(t => tagSet.add(t.trim())));

  const select = document.getElementById("filterTag");
  select.innerHTML = `<option value="all">All Tags</option>` +
    [...tagSet].map(t => `<option value="${t}">${t}</option>`).join("");
}

export let currentTags = [];

export function addTag() {
  const input = document.getElementById("tagInput");
  const value = input.value.trim();

  if (!value) return;

  currentTags.push(value);
  input.value = "";

  renderTags();
}

export function removeTag(index) {
  currentTags.splice(index, 1);
  renderTags();
}

export function renderTags() {
  const container = document.getElementById("tagContainer");

  container.innerHTML = currentTags.map((tag, i) => `
    <div class="tag-pill">
      ${tag}
      <span onclick="removeTag(${i})">✕</span>
    </div>
  `).join("");
}