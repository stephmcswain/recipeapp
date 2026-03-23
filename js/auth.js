const AUTH_STORAGE_KEY = "recipes-authenticated";

// Frontend-only guard for basic access control.
// Update these to your own credentials.
const AUTH_USERNAME = "admin";
const AUTH_PASSWORD = "recipes123";

function setAuthenticated(value) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, value ? "true" : "false");
  } catch {
    // Ignore localStorage issues.
  }
}

export function isAuthenticated() {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
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

  if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
    setAuthenticated(true);
    updateAuthUI();
    return true;
  }

  window.alert("Invalid username or password.");
  return false;
}

export function logout() {
  setAuthenticated(false);
  updateAuthUI();
}

export function requireAuth() {
  if (isAuthenticated()) return true;
  return login();
}
