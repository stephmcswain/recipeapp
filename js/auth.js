const AUTH_STORAGE_KEY = "recipes-auth-token";
let authModalInitialized = false;

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

function getAuthModalElements() {
  return {
    modal: document.getElementById("authModal"),
    form: document.getElementById("authForm"),
    username: document.getElementById("authUsername"),
    password: document.getElementById("authPassword"),
    togglePassword: document.getElementById("authTogglePassword"),
    error: document.getElementById("authError"),
    cancel: document.getElementById("authCancel"),
  };
}

export function closeLoginModal() {
  const { modal, form, password, togglePassword, error } = getAuthModalElements();
  if (!modal) return;
  modal.style.display = "none";
  if (form) form.reset();
  if (password) password.type = "password";
  if (togglePassword) togglePassword.checked = false;
  if (error) error.style.display = "none";
}

function openLoginModal() {
  const { modal, username, error } = getAuthModalElements();
  if (!modal) return false;
  modal.style.display = "flex";
  if (error) error.style.display = "none";
  if (username) username.focus();
  return true;
}

export function initAuthModal() {
  if (authModalInitialized) return;
  const { modal, form, password, togglePassword, cancel, error } = getAuthModalElements();
  if (!modal || !form || !password || !togglePassword || !cancel || !error) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const usernameValue = document.getElementById("authUsername")?.value ?? "";
    const passwordValue = document.getElementById("authPassword")?.value ?? "";
    if (!usernameValue || !passwordValue) {
      error.textContent = "Username and password are required.";
      error.style.display = "block";
      return;
    }
    const token = window.btoa(`${usernameValue}:${passwordValue}`);
    setAuthToken(token);
    error.style.display = "none";
    closeLoginModal();
    updateAuthUI();
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

  cancel.addEventListener("click", () => {
    closeLoginModal();
  });

  modal.addEventListener("click", (event) => {
    if (event.target && event.target.id === "authModal") closeLoginModal();
  });

  document.addEventListener("keydown", (event) => {
    const modalVisible = modal.style.display === "flex";
    if (event.key === "Escape" && modalVisible) {
      closeLoginModal();
      return;
    }

    const loginShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "l";
    if (loginShortcut && !isAuthenticated()) {
      event.preventDefault();
      openLoginModal();
    }
  });

  authModalInitialized = true;
}

export function login() {
  if (isAuthenticated()) return;
  openLoginModal();
}

export function logout() {
  setAuthToken("");
  closeLoginModal();
  updateAuthUI();
}

export function requireAuth() {
  if (isAuthenticated()) return true;
  login();
  return false;
}
