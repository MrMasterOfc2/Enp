(async function setupFirebaseSync() {
  const config = window.ENP_FIREBASE_CONFIG || {};
  const configured = config.apiKey && !config.apiKey.startsWith("YOUR_");
  window.FirebaseBridge = { ready: false, set() {} };
  if (!configured) {
    document.documentElement.dataset.database = "local";
    return;
  }

  try {
    const appSdk = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js");
    const dbSdk = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js");
    const app = appSdk.initializeApp(config);
    const database = dbSdk.getDatabase(app);
    const syncedKeys = ["teachers", "blogs", "chats", "feedback"];

    window.FirebaseBridge = {
      ready: true,
      set(key, value) {
        if (!syncedKeys.includes(key)) return;
        dbSdk.set(dbSdk.ref(database, `enp/${key}`), value).catch(error => console.error(`Firebase ${key} write failed`, error));
      }
    };

    syncedKeys.forEach(key => {
      dbSdk.onValue(dbSdk.ref(database, `enp/${key}`), snapshot => {
        if (!snapshot.exists()) {
          const seed = window.Store?.get(key);
          if (seed) window.FirebaseBridge.set(key, seed);
          return;
        }
        localStorage.setItem(`enp_${key}`, JSON.stringify(snapshot.val()));
        dispatchEvent(new CustomEvent("enp:data-changed", { detail: { key } }));
      }, error => console.error(`Firebase ${key} sync failed`, error));
    });
    document.documentElement.dataset.database = "firebase";
  } catch (error) {
    document.documentElement.dataset.database = "local";
    console.error("Firebase initialization failed; using local storage.", error);
  }
})();
