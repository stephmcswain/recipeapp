const AUTH_STORAGE_KEY = "recipes-auth-token";

function setAuthToken(token) {
  try {
    if (token) localStorage.setItem(AUTH_STORAGE_KEY, token);
    else localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore localStorage issues.
  }
}

function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export function getAuthHeaders() {
  const token = getAuthToken();
  if (!token) return {};
  return { authorization: `Basic ${token}` };
}

export function updateAuthUI() {
  const loggedIn = isAuthenticated();
  const guarded = document.querySelectorAll("[data-auth-required='true']");
  guarded.forEach((el) => {
    el.style.display = loggedIn ? "" : "none";
  });

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  if (loginBtn) loginBtn.style.display = loggedIn ? "none" : "";
  if (logoutBtn) logoutBtn.style.display = loggedIn ? "" : "none";
}

export function login() {
  const username = window.prompt("Username:");
  if (username === null) return false;

  const password = window.prompt("Password:");
  if (password === null) return false;

  const token = window.btoa(`${username}:${password}`);
  setAuthToken(token);
  updateAuthUI();
  return true;
}

export function logout() {
  setAuthToken("");
  updateAuthUI();
}

export function requireAuth() {
  if (isAuthenticated()) return true;
  return login();
}
