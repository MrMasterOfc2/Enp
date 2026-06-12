(async function prepareSocialAuthentication() {
  const config = window.ENP_FIREBASE_CONFIG || {};
  const configured = config.apiKey && !config.apiKey.startsWith("YOUR_");
  window.ENPSocialAuth = { ready: false };
  if (!configured) return;
  try {
    const appSdk = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js");
    const authSdk = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js");
    const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(config);
    const auth = authSdk.getAuth(app);
    window.ENPSocialAuth = {
      ready: true,
      async signIn(providerName) {
        const provider = providerName === "github" ? new authSdk.GithubAuthProvider() : new authSdk.FacebookAuthProvider();
        provider.addScope("email");
        const result = await authSdk.signInWithPopup(auth, provider);
        return { name: result.user.displayName || result.user.email?.split("@")[0] || "Student", email: result.user.email || `${result.user.uid}@${providerName}.user`, photo: result.user.photoURL || "", role: "student", provider: providerName };
      }
    };
  } catch (error) {
    console.error("Social authentication initialization failed.", error);
  }
})();
