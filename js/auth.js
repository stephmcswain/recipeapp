const AUTH_STORAGE_KEY = "recipes-auth-token";
const AUTH_CHECK_URL = "/.netlify/functions/recipes/auth";
let currentView = "home";

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
  const homePage = document.getElementById("homePage");
  const authPage = document.getElementById("authPage");
  const appRoot = document.getElementById("appRoot");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loggedIn) {
    currentView = "app";
  }

  if (homePage) homePage.style.display = currentView === "home" ? "grid" : "none";
  if (authPage) authPage.style.display = currentView === "login" ? "grid" : "none";
  if (appRoot) appRoot.style.display = currentView === "app" ? "block" : "none";
  if (logoutBtn) logoutBtn.style.display = loggedIn ? "" : "none";
}

async function verifyToken(token) {
  const res = await fetch(AUTH_CHECK_URL, {
    method: "GET",
    headers: { authorization: `Basic ${token}` },
  });
  return res.ok;
}

export function initAuthPage(onLoginSuccess) {
  const form = document.getElementById("authForm");
  const username = document.getElementById("authUsername");
  const password = document.getElementById("authPassword");
  const togglePassword = document.getElementById("authTogglePassword");
  const error = document.getElementById("authError");
  if (!form || !username || !password || !togglePassword || !error) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const usernameValue = username.value.trim();
    const passwordValue = password.value;
    if (!usernameValue || !passwordValue) {
      error.textContent = "Username and password are required.";
      error.style.display = "block";
      return;
    }

    const token = window.btoa(`${usernameValue}:${passwordValue}`);
    const valid = await verifyToken(token).catch(() => false);
    if (!valid) {
      setAuthToken("");
      error.textContent = "Invalid username or password.";
      error.style.display = "block";
      return;
    }

    setAuthToken(token);
    currentView = "app";
    error.style.display = "none";
    form.reset();
    password.type = "password";
    togglePassword.checked = false;
    updateAuthUI();
    if (typeof onLoginSuccess === "function") onLoginSuccess();
  });

  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (event.target && event.target.tagName === "TEXTAREA") return;
    event.preventDefault();
    form.requestSubmit();
  });

  togglePassword.addEventListener("change", () => {
    password.type = togglePassword.checked ? "text" : "password";
  });

  username.focus();
}

export function showLoginPage() {
  if (isAuthenticated()) {
    currentView = "app";
  } else {
    currentView = "login";
  }
  updateAuthUI();
}

export function showHomePage() {
  if (isAuthenticated()) {
    currentView = "app";
  } else {
    currentView = "home";
  }
  updateAuthUI();
}

export function logout() {
  setAuthToken("");
  currentView = "home";
  updateAuthUI();
}

export function requireAuth() {
  return isAuthenticated();
}
