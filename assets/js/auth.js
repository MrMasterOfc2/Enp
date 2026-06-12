const tabs = document.querySelectorAll(".auth-tabs button");
function openTab(id) {
  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.tab === id));
  document.querySelectorAll(".auth-view").forEach(view => view.classList.toggle("active", view.id === id));
}
tabs.forEach(tab => tab.onclick = () => openTab(tab.dataset.tab));
if (location.hash === "#register") openTab("register");

document.getElementById("registerForm").onsubmit = event => {
  event.preventDefault();
  const user = Object.fromEntries(new FormData(event.target));
  const users = Store.get("users");
  if (users.some(existing => existing.email.toLowerCase() === user.email.toLowerCase())) return showToast("An account already exists for this email.");
  users.push({ ...user, role: "student" });
  Store.set("users", users);
  localStorage.setItem("enp_session", JSON.stringify({ name: user.name, email: user.email, role: "student" }));
  showToast("Account created successfully!");
  setTimeout(() => location.href = "index.html", 900);
};

document.getElementById("loginForm").onsubmit = event => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.target));
  const user = Store.get("users").find(item => item.email.toLowerCase() === values.email.toLowerCase() && item.password === values.password);
  if (!user) return showToast("Incorrect email or password.");
  localStorage.setItem("enp_session", JSON.stringify({ name: user.name, email: user.email, role: user.role }));
  showToast(`Welcome back, ${user.name}!`);
  setTimeout(() => location.href = user.role === "admin" ? "panel/" : "index.html", 700);
};

function decodeGoogleCredential(token) {
  const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(decodeURIComponent(atob(payload).split("").map(char => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")));
}

function finishGoogleSignIn(response) {
  try {
    const profile = decodeGoogleCredential(response.credential);
    const user = { name: profile.name, email: profile.email, photo: profile.picture, role: "student", provider: "google" };
    const users = Store.get("users");
    if (!users.some(existing => existing.email?.toLowerCase() === user.email.toLowerCase())) {
      users.push(user);
      Store.set("users", users);
    }
    localStorage.setItem("enp_session", JSON.stringify(user));
    showToast(`Welcome, ${user.name}!`);
    setTimeout(() => location.href = "index.html", 700);
  } catch (error) {
    console.error("Google credential could not be read.", error);
    showToast("Google sign-in could not be completed.");
  }
}

function startGoogleSignIn() {
  const clientId = window.ENP_GOOGLE_CLIENT_ID || "";
  if (!clientId || clientId.startsWith("PASTE_")) {
    showToast("Paste your Google Client ID into google-auth-config.js first.");
    return;
  }
  if (!window.google?.accounts?.id) {
    showToast("Google Sign-In is still loading. Please try again.");
    return;
  }
  google.accounts.id.initialize({ client_id: clientId, callback: finishGoogleSignIn, ux_mode: "popup" });
  google.accounts.id.prompt(notification => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      showToast("Allow Google popups and try again.");
    }
  });
}

document.querySelectorAll(".google-btn").forEach(button => button.onclick = startGoogleSignIn);

async function startFirebaseSocialSignIn(provider) {
  if (!window.ENPSocialAuth?.ready) return showToast("Configure Firebase and enable this sign-in provider first.");
  try {
    const user = await window.ENPSocialAuth.signIn(provider);
    const users = Store.get("users");
    if (!users.some(existing => existing.email?.toLowerCase() === user.email.toLowerCase())) { users.push(user); Store.set("users", users); }
    localStorage.setItem("enp_session", JSON.stringify(user));
    showToast(`Welcome, ${user.name}!`);
    setTimeout(() => location.href = "index.html", 700);
  } catch (error) {
    console.error(`${provider} sign-in failed.`, error);
    showToast(error.code === "auth/account-exists-with-different-credential" ? "This email already uses another sign-in method." : `${provider[0].toUpperCase() + provider.slice(1)} sign-in could not be completed.`);
  }
}
document.querySelectorAll("[data-provider]").forEach(button => button.onclick = () => startFirebaseSocialSignIn(button.dataset.provider));
